// Em dev, usa o proxy do Vite ('/api' -> backend local). Em produção (build),
// aponta direto para o backend hospedado — veja .env.production. Pode ser
// sobrescrito em qualquer ambiente com a variável VITE_API_URL.
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// O backend pode estar hospedado num plano gratuito (Render) que desativa a
// instância por inatividade — segundo o próprio aviso do Render, isso pode
// atrasar as próximas requisições em 50 segundos OU MAIS. Esses dois números
// controlam esse comportamento:
const TEMPO_LIMITE_MS = 75_000;      // aborta a chamada só depois de 75s (folga acima dos 50s+ avisados pelo Render)
const LIMIAR_AVISO_MS = 3_500;       // se passar disso sem resposta, avisamos a tela que "pode ser cold start"

// Contador de quantas chamadas em andamento já passaram do limiar acima.
// Enquanto > 0, a UI mostra o aviso de "acordando o servidor"; ao zerar, some.
let chamadasLentasEmAndamento = 0;

function avisarUI(estaAcordando) {
  if (estaAcordando) chamadasLentasEmAndamento++;
  else chamadasLentasEmAndamento = Math.max(0, chamadasLentasEmAndamento - 1);

  window.dispatchEvent(new CustomEvent('api:cold-start', {
    detail: { acordando: chamadasLentasEmAndamento > 0 },
  }));
}

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TEMPO_LIMITE_MS);

  // Se a resposta não chegar em ~3,5s, avisa a UI que pode ser o servidor acordando.
  let avisouLentidao = false;
  const avisoTimeoutId = setTimeout(() => {
    avisouLentidao = true;
    avisarUI(true);
  }, LIMIAR_AVISO_MS);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      ...options,
    });

    if (!res.ok) {
      let mensagem = `Erro ${res.status}`;
      try {
        const corpo = await res.json();
        mensagem = corpo.erro || mensagem;
      } catch (_) {
        /* corpo sem JSON */
      }
      throw new Error(mensagem);
    }

    if (res.status === 204) return null;
    return await res.json();
  } catch (e) {
    if (e.name === 'AbortError') {
      throw new Error(
        'O servidor demorou demais para responder (mais de 75s). Se ele estava inativo, ' +
        'tente novamente em alguns segundos — costuma voltar ao normal no segundo acesso.'
      );
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
    clearTimeout(avisoTimeoutId);
    if (avisouLentidao) avisarUI(false);
  }
}

export const api = {
  // Materiais
  listarMateriais: (tipo) => request(`/materiais${tipo ? `?tipo=${tipo}` : ''}`),
  buscarMaterial: (id) => request(`/materiais/${id}`),
  criarMaterial: (dto) => request('/materiais', { method: 'POST', body: JSON.stringify(dto) }),
  atualizarMaterial: (id, dto) => request(`/materiais/${id}`, { method: 'PUT', body: JSON.stringify(dto) }),
  removerMaterial: (id) => request(`/materiais/${id}`, { method: 'DELETE' }),
  materiaisAbaixoEstoque: () => request('/materiais/abaixo-estoque-minimo'),

  // Móveis
  listarMoveis: () => request('/moveis'),
  buscarMovel: (id) => request(`/moveis/${id}`),
  criarMovel: (dto) => request('/moveis', { method: 'POST', body: JSON.stringify(dto) }),
  atualizarMovel: (id, dto) => request(`/moveis/${id}`, { method: 'PUT', body: JSON.stringify(dto) }),
  removerMovel: (id) => request(`/moveis/${id}`, { method: 'DELETE' }),

  // Estrutura (BOM)
  listarEstrutura: (movelId) => request(`/moveis/${movelId}/estrutura`),
  adicionarItemEstrutura: (movelId, dto) =>
    request(`/moveis/${movelId}/estrutura`, { method: 'POST', body: JSON.stringify(dto) }),
  atualizarItemEstrutura: (movelId, itemId, dto) =>
    request(`/moveis/${movelId}/estrutura/${itemId}`, { method: 'PUT', body: JSON.stringify(dto) }),
  removerItemEstrutura: (movelId, itemId) =>
    request(`/moveis/${movelId}/estrutura/${itemId}`, { method: 'DELETE' }),

  // Necessidade de materiais (explosão de BOM)
  calcularNecessidade: (movelId, quantidade) =>
    request(`/moveis/${movelId}/necessidade-materiais?quantidade=${quantidade}`),

  // Ordens de montagem
  listarOrdens: (status) => request(`/ordens-montagem${status ? `?status=${status}` : ''}`),
  criarOrdem: (dto) => request('/ordens-montagem', { method: 'POST', body: JSON.stringify(dto) }),
  atualizarStatusOrdem: (id, status) =>
    request(`/ordens-montagem/${id}/status`, { method: 'PATCH', body: JSON.stringify(status) }),
  removerOrdem: (id) => request(`/ordens-montagem/${id}`, { method: 'DELETE' }),

  // Calculadoras utilitárias (Seção 2)
  calcularChapas: (dto) => request('/calculos/chapas', { method: 'POST', body: JSON.stringify(dto) }),
  calcularFitaBorda: (dto) => request('/calculos/fita-borda', { method: 'POST', body: JSON.stringify(dto) }),

  // Fornecedores por material (cotações)
  listarFornecedoresDoMaterial: (materialId) => request(`/materiais/${materialId}/fornecedores`),

  // Clientes
  listarClientes: (busca) => request(`/clientes${busca ? `?busca=${encodeURIComponent(busca)}` : ''}`),
  buscarCliente: (id) => request(`/clientes/${id}`),
  criarCliente: (dto) => request('/clientes', { method: 'POST', body: JSON.stringify(dto) }),
  atualizarCliente: (id, dto) => request(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(dto) }),
  removerCliente: (id) => request(`/clientes/${id}`, { method: 'DELETE' }),
  listarComprasDoCliente: (id) => request(`/clientes/${id}/compras`),

  // Vendas (compras dos clientes, com dados do móvel)
  listarVendas: (status) => request(`/vendas${status ? `?status=${status}` : ''}`),
  criarVenda: (dto) => request('/vendas', { method: 'POST', body: JSON.stringify(dto) }),
  atualizarStatusVenda: (id, status) => request(`/vendas/${id}/status`, { method: 'PATCH', body: JSON.stringify(status) }),
  removerVenda: (id) => request(`/vendas/${id}`, { method: 'DELETE' }),

  // Fornecedores
  listarFornecedores: (apenasAtivos) => request(`/fornecedores${apenasAtivos ? '?apenasAtivos=true' : ''}`),
  buscarFornecedor: (id) => request(`/fornecedores/${id}`),
  criarFornecedor: (dto) => request('/fornecedores', { method: 'POST', body: JSON.stringify(dto) }),
  atualizarFornecedor: (id, dto) => request(`/fornecedores/${id}`, { method: 'PUT', body: JSON.stringify(dto) }),
  removerFornecedor: (id) => request(`/fornecedores/${id}`, { method: 'DELETE' }),
  listarMateriaisDoFornecedor: (id) => request(`/fornecedores/${id}/materiais`),
  adicionarMaterialAoFornecedor: (id, dto) => request(`/fornecedores/${id}/materiais`, { method: 'POST', body: JSON.stringify(dto) }),
  atualizarMaterialDoFornecedor: (id, itemId, dto) => request(`/fornecedores/${id}/materiais/${itemId}`, { method: 'PUT', body: JSON.stringify(dto) }),
  removerMaterialDoFornecedor: (id, itemId) => request(`/fornecedores/${id}/materiais/${itemId}`, { method: 'DELETE' }),

  // Movimentações de estoque (entrada/saída)
  listarMovimentacoes: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.materialId) qs.set('materialId', params.materialId);
    if (params.tipo) qs.set('tipo', params.tipo);
    const query = qs.toString();
    return request(`/movimentacoes${query ? `?${query}` : ''}`);
  },
  registrarMovimentacao: (dto) => request('/movimentacoes', { method: 'POST', body: JSON.stringify(dto) }),

  // Fluxo de caixa
  listarLancamentos: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.tipo) qs.set('tipo', params.tipo);
    if (params.status) qs.set('status', params.status);
    const query = qs.toString();
    return request(`/fluxo-caixa/lancamentos${query ? `?${query}` : ''}`);
  },
  criarLancamento: (dto) => request('/fluxo-caixa/lancamentos', { method: 'POST', body: JSON.stringify(dto) }),
  registrarPagamentoLancamento: (id, dto) =>
    request(`/fluxo-caixa/lancamentos/${id}/pagar`, { method: 'PATCH', body: JSON.stringify(dto || {}) }),
  cancelarLancamento: (id) => request(`/fluxo-caixa/lancamentos/${id}/cancelar`, { method: 'PATCH' }),
  resumoFluxoCaixa: (inicio, fim) => {
    const qs = new URLSearchParams();
    if (inicio) qs.set('inicio', inicio);
    if (fim) qs.set('fim', fim);
    const query = qs.toString();
    return request(`/fluxo-caixa/resumo${query ? `?${query}` : ''}`);
  },
};
