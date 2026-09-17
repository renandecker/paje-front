import React, { useEffect, useState } from 'react'
import { api } from '../api/client.js'

const VAZIO = { materialId: '', tipo: 'ENTRADA', quantidade: '', custoUnitario: '', fornecedorId: '', observacao: '' }

export default function Estoque() {
  const [movimentacoes, setMovimentacoes] = useState([])
  const [materiais, setMateriais] = useState([])
  const [fornecedores, setFornecedores] = useState([])
  const [filtroTipo, setFiltroTipo] = useState('')
  const [form, setForm] = useState(VAZIO)
  const [erro, setErro] = useState(null)
  const [sucesso, setSucesso] = useState(null)

  function carregar(tipo) {
    api.listarMovimentacoes({ tipo: tipo || undefined }).then(setMovimentacoes).catch((e) => setErro(e.message))
  }

  useEffect(() => {
    carregar(filtroTipo)
    api.listarMateriais().then(setMateriais).catch((e) => setErro(e.message))
    api.listarFornecedores().then(setFornecedores).catch((e) => setErro(e.message))
  }, [filtroTipo])

  async function registrar(e) {
    e.preventDefault()
    setErro(null)
    setSucesso(null)
    try {
      await api.registrarMovimentacao({
        materialId: Number(form.materialId),
        tipo: form.tipo,
        quantidade: Number(form.quantidade),
        custoUnitario: form.custoUnitario ? Number(form.custoUnitario) : null,
        fornecedorId: form.fornecedorId ? Number(form.fornecedorId) : null,
        observacao: form.observacao || null,
      })
      setForm(VAZIO)
      setSucesso('Movimentação registrada e estoque atualizado.')
      carregar(filtroTipo)
      api.listarMateriais().then(setMateriais)
    } catch (e2) {
      setErro(e2.message)
    }
  }

  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow-plain">Estoque</p>
        <h1>Entrada · Saída</h1>
        <p className="lede">
          Registre compras de fornecedores (entrada) e consumo/perdas (saída). O estoque atual de cada
          material é atualizado automaticamente a cada movimentação.
        </p>
      </header>

      {erro && <div className="banner banner-error">{erro}</div>}
      {sucesso && <div className="banner" style={{ background: '#e8ece9', color: 'var(--success)', border: '1px solid #c3cdc6' }}>{sucesso}</div>}

      <div className="split split-wide">
        <section className="panel">
          <h2>Nova movimentação</h2>
          <form className="form-grid" onSubmit={registrar}>
            <label className="span-2">Tipo</label>
            <div className="span-2" style={{ display: 'flex', gap: '0.6rem', marginTop: '-0.6rem', marginBottom: '0.4rem' }}>
              <button type="button"
                      className={form.tipo === 'ENTRADA' ? 'btn-primary' : 'btn-link'}
                      onClick={() => setForm({ ...form, tipo: 'ENTRADA' })}>Entrada</button>
              <button type="button"
                      className={form.tipo === 'SAIDA' ? 'btn-primary' : 'btn-link'}
                      onClick={() => setForm({ ...form, tipo: 'SAIDA' })}>Saída</button>
            </div>

            <label className="span-2">Material
              <select required value={form.materialId} onChange={(e) => setForm({ ...form, materialId: e.target.value })}>
                <option value="">Selecione…</option>
                {materiais.map((m) => (
                  <option key={m.id} value={m.id}>{m.sku} — {m.nome} (atual: {m.estoqueAtual} {m.unidadeMedida})</option>
                ))}
              </select>
            </label>
            <label>Quantidade
              <input required type="number" step="0.001" value={form.quantidade}
                     onChange={(e) => setForm({ ...form, quantidade: e.target.value })} />
            </label>

            {form.tipo === 'ENTRADA' && (
              <>
                <label>Custo unitário (R$)
                  <input type="number" step="0.01" value={form.custoUnitario}
                         onChange={(e) => setForm({ ...form, custoUnitario: e.target.value })} />
                  <span className="hint">se informado, atualiza o custo cadastrado do material</span>
                </label>
                <label className="span-2">Fornecedor
                  <select value={form.fornecedorId} onChange={(e) => setForm({ ...form, fornecedorId: e.target.value })}>
                    <option value="">— não informado —</option>
                    {fornecedores.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
                  </select>
                </label>
              </>
            )}

            <label className="span-2">Observação
              <input value={form.observacao} onChange={(e) => setForm({ ...form, observacao: e.target.value })}
                     placeholder="Ex.: consumo na ordem #12, ajuste de inventário..." />
            </label>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Registrar {form.tipo === 'ENTRADA' ? 'entrada' : 'saída'}
              </button>
            </div>
          </form>
        </section>

        <section className="panel">
          <div className="panel-toolbar">
            <h2>Histórico de movimentações</h2>
            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
              <option value="">Todas</option>
              <option value="ENTRADA">Entradas</option>
              <option value="SAIDA">Saídas</option>
            </select>
          </div>

          <table className="table">
            <thead><tr><th>Material</th><th>Tipo</th><th>Qtd.</th><th>Data</th><th>Obs.</th></tr></thead>
            <tbody>
              {movimentacoes.map((m) => (
                <tr key={m.id}>
                  <td className="mono">{m.materialSku}<br /><span className="muted">{m.materialNome}</span></td>
                  <td><span className={'tag'} style={m.tipo === 'SAIDA' ? { background: '#f6e2dd', color: '#a23b2e' } : undefined}>{m.tipo}</span></td>
                  <td className="mono">{m.quantidade} {m.unidadeMedida}</td>
                  <td className="mono muted">{new Date(m.dataMovimentacao).toLocaleString('pt-BR')}</td>
                  <td className="muted">{m.observacao || m.fornecedorNome || '—'}</td>
                </tr>
              ))}
              {movimentacoes.length === 0 && <tr><td colSpan={5} className="muted">Nenhuma movimentação registrada.</td></tr>}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}
