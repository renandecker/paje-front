import React, { useEffect, useState } from 'react'
import { api } from '../api/client.js'

const CATEGORIAS_RECEITA = ['VENDA_MOVEL', 'OUTRAS_RECEITAS']
const CATEGORIAS_DESPESA = ['COMPRA_MATERIAL', 'SALARIOS', 'ALUGUEL', 'ENERGIA', 'IMPOSTOS', 'MANUTENCAO', 'OUTRAS_DESPESAS']
const FORMAS_PAGAMENTO = ['DINHEIRO', 'PIX', 'CARTAO', 'BOLETO', 'TRANSFERENCIA']
const STATUS_COR = { PAGO: 'var(--success)', PENDENTE: 'var(--accent)', ATRASADO: '#a23b2e', CANCELADO: '#8a7f6f' }

function primeiroDiaDoMes() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
}
function hoje() {
  return new Date().toISOString().slice(0, 10)
}

const VAZIO = { tipo: 'DESPESA', categoria: 'OUTRAS_DESPESAS', descricao: '', valor: '', dataVencimento: hoje(), formaPagamento: '', observacao: '' }

export default function FluxoCaixa() {
  const [resumo, setResumo] = useState(null)
  const [lancamentos, setLancamentos] = useState([])
  const [inicio, setInicio] = useState(primeiroDiaDoMes())
  const [fim, setFim] = useState(hoje())
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [form, setForm] = useState(VAZIO)
  const [erro, setErro] = useState(null)

  function carregarResumo() {
    api.resumoFluxoCaixa(inicio, fim).then(setResumo).catch((e) => setErro(e.message))
  }
  function carregarLancamentos() {
    api.listarLancamentos({ tipo: filtroTipo || undefined, status: filtroStatus || undefined })
      .then(setLancamentos).catch((e) => setErro(e.message))
  }

  useEffect(() => { carregarResumo() }, [inicio, fim])
  useEffect(() => { carregarLancamentos() }, [filtroTipo, filtroStatus])

  async function salvar(e) {
    e.preventDefault()
    setErro(null)
    try {
      await api.criarLancamento({ ...form, valor: Number(form.valor) })
      setForm({ ...VAZIO, tipo: form.tipo, categoria: form.tipo === 'RECEITA' ? CATEGORIAS_RECEITA[0] : CATEGORIAS_DESPESA[0] })
      carregarResumo()
      carregarLancamentos()
    } catch (e2) {
      setErro(e2.message)
    }
  }

  async function marcarPago(id) {
    try {
      await api.registrarPagamentoLancamento(id, {})
      carregarResumo()
      carregarLancamentos()
    } catch (e) {
      setErro(e.message)
    }
  }

  async function cancelar(id) {
    if (!confirm('Cancelar este lançamento?')) return
    try {
      await api.cancelarLancamento(id)
      carregarResumo()
      carregarLancamentos()
    } catch (e) {
      setErro(e.message)
    }
  }

  const categoriasDisponiveis = form.tipo === 'RECEITA' ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA

  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow-plain">Financeiro</p>
        <h1>Fluxo de Caixa</h1>
        <p className="lede">
          Contas a receber (vendas) e a pagar (compras de material) são lançadas automaticamente.
          Use o formulário abaixo para lançamentos manuais, como aluguel e salários.
        </p>
      </header>

      {erro && <div className="banner banner-error">{erro}</div>}

      <section className="panel">
        <div className="panel-toolbar">
          <h2>Resumo do período</h2>
          <div className="inline-form">
            <label>De<input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} /></label>
            <label>Até<input type="date" value={fim} onChange={(e) => setFim(e.target.value)} /></label>
          </div>
        </div>

        {resumo && (
          <>
            <div className="kpi-row-caixa">
              <KpiCaixa label="Recebido no período" valor={resumo.totalRecebido} cor="var(--success)" />
              <KpiCaixa label="Pago no período" valor={resumo.totalPago} cor="#a23b2e" />
              <KpiCaixa label="Saldo do período" valor={resumo.saldoPeriodo} destaque />
              <KpiCaixa label="Saldo de caixa atual" valor={resumo.saldoAtual} destaque />
            </div>
            <div className="kpi-row-caixa" style={{ marginTop: '0.6rem' }}>
              <KpiCaixa label="Total a receber (em aberto)" valor={resumo.totalAReceber} cor="var(--accent)" pequeno />
              <KpiCaixa label="Total a pagar (em aberto)" valor={resumo.totalAPagar} cor="#a23b2e" pequeno />
            </div>

            {resumo.porCategoria?.length > 0 && (
              <div style={{ marginTop: '1.2rem' }}>
                <h3 className="subhead-plain">Por categoria (realizado no período)</h3>
                {resumo.porCategoria.map((c) => {
                  const max = Math.max(...resumo.porCategoria.map((x) => Number(x.total)))
                  const pct = max > 0 ? (Number(c.total) / max) * 100 : 0
                  return (
                    <div key={c.categoria} style={{ marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 2 }}>
                        <span>{c.categoria} <span className="tag">{c.tipo}</span></span>
                        <span className="mono">R$ {Number(c.total).toFixed(2)}</span>
                      </div>
                      <div style={{ background: '#ede7d8', height: 6, borderRadius: 3 }}>
                        <div style={{
                          width: `${pct}%`, height: 6, borderRadius: 3,
                          background: c.tipo === 'RECEITA' ? 'var(--success)' : 'var(--accent)',
                        }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </section>

      <div className="split split-wide">
        <section className="panel">
          <h2>Novo lançamento</h2>
          <form className="form-grid" onSubmit={salvar}>
            <div className="span-2" style={{ display: 'flex', gap: '0.6rem' }}>
              <button type="button" className={form.tipo === 'RECEITA' ? 'btn-primary' : 'btn-link'}
                      onClick={() => setForm({ ...form, tipo: 'RECEITA', categoria: CATEGORIAS_RECEITA[0] })}>Receita</button>
              <button type="button" className={form.tipo === 'DESPESA' ? 'btn-primary' : 'btn-link'}
                      onClick={() => setForm({ ...form, tipo: 'DESPESA', categoria: CATEGORIAS_DESPESA[0] })}>Despesa</button>
            </div>

            <label>Categoria
              <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                {categoriasDisponiveis.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label>Valor (R$)
              <input required type="number" step="0.01" value={form.valor}
                     onChange={(e) => setForm({ ...form, valor: e.target.value })} />
            </label>
            <label className="span-2">Descrição
              <input required value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
            </label>
            <label>Vencimento
              <input required type="date" value={form.dataVencimento}
                     onChange={(e) => setForm({ ...form, dataVencimento: e.target.value })} />
            </label>
            <label>Forma de pagamento
              <select value={form.formaPagamento} onChange={(e) => setForm({ ...form, formaPagamento: e.target.value })}>
                <option value="">— não informado —</option>
                {FORMAS_PAGAMENTO.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </label>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Adicionar lançamento</button>
            </div>
          </form>
        </section>

        <section className="panel">
          <div className="panel-toolbar">
            <h2>Lançamentos</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                <option value="">Tipo</option>
                <option value="RECEITA">Receita</option>
                <option value="DESPESA">Despesa</option>
              </select>
              <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
                <option value="">Status</option>
                <option value="PENDENTE">Pendente</option>
                <option value="ATRASADO">Atrasado</option>
                <option value="PAGO">Pago</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>
          </div>

          <table className="table">
            <thead><tr><th>Descrição</th><th>Valor</th><th>Vencimento</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {lancamentos.map((l) => (
                <tr key={l.id}>
                  <td>{l.descricao}<br /><span className="mono muted">{l.categoria}</span></td>
                  <td className="mono" style={{ color: l.tipo === 'RECEITA' ? 'var(--success)' : '#a23b2e' }}>
                    {l.tipo === 'RECEITA' ? '+' : '−'} R$ {Number(l.valor).toFixed(2)}
                  </td>
                  <td className="mono muted">{new Date(l.dataVencimento).toLocaleDateString('pt-BR')}</td>
                  <td><span className="tag" style={{ background: 'transparent', border: `1px solid ${STATUS_COR[l.status]}`, color: STATUS_COR[l.status] }}>{l.status}</span></td>
                  <td className="row-actions">
                    {(l.status === 'PENDENTE' || l.status === 'ATRASADO') && (
                      <>
                        <button className="btn-link" onClick={() => marcarPago(l.id)}>marcar pago</button>
                        <button className="btn-link btn-danger" onClick={() => cancelar(l.id)}>cancelar</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {lancamentos.length === 0 && <tr><td colSpan={5} className="muted">Nenhum lançamento encontrado.</td></tr>}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}

function KpiCaixa({ label, valor, cor, destaque, pequeno }) {
  const numero = Number(valor)
  const corFinal = destaque ? (numero >= 0 ? 'var(--success)' : '#a23b2e') : cor
  return (
    <div className="kpi-card" style={{ flex: 1 }}>
      <span className="kpi-value" style={{ fontSize: pequeno ? '1.3rem' : '1.7rem', color: corFinal }}>
        R$ {numero.toFixed(2)}
      </span>
      <span className="kpi-label">{label}</span>
    </div>
  )
}
