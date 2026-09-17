import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client.js'

const ITEM_VAZIO = { materialId: '', precoUnitario: '', prazoEntregaDias: '', preferencial: false }

export default function FornecedorDetalhe() {
  const { id } = useParams()
  const [fornecedor, setFornecedor] = useState(null)
  const [precos, setPrecos] = useState([])
  const [materiais, setMateriais] = useState([])
  const [form, setForm] = useState(ITEM_VAZIO)
  const [erro, setErro] = useState(null)

  function carregar() {
    api.buscarFornecedor(id).then(setFornecedor).catch((e) => setErro(e.message))
    api.listarMateriaisDoFornecedor(id).then(setPrecos).catch((e) => setErro(e.message))
  }

  useEffect(() => {
    carregar()
    api.listarMateriais().then(setMateriais).catch((e) => setErro(e.message))
  }, [id])

  async function adicionarPreco(e) {
    e.preventDefault()
    setErro(null)
    try {
      await api.adicionarMaterialAoFornecedor(id, {
        materialId: Number(form.materialId),
        precoUnitario: Number(form.precoUnitario),
        prazoEntregaDias: form.prazoEntregaDias ? Number(form.prazoEntregaDias) : null,
        preferencial: form.preferencial,
      })
      setForm(ITEM_VAZIO)
      carregar()
    } catch (e2) {
      setErro(e2.message)
    }
  }

  async function removerPreco(itemId) {
    if (!confirm('Remover este material da tabela de preços deste fornecedor?')) return
    try {
      await api.removerMaterialDoFornecedor(id, itemId)
      carregar()
    } catch (e) {
      setErro(e.message)
    }
  }

  if (!fornecedor) {
    return <div className="page"><p className="muted">Carregando fornecedor…</p></div>
  }

  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow-plain"><Link to="/fornecedores">Fornecedores</Link> / {fornecedor.nome}</p>
        <h1>{fornecedor.nome}</h1>
        <p className="mono muted">{fornecedor.cnpj}</p>
        <p className="lede">{fornecedor.telefone} {fornecedor.email && `· ${fornecedor.email}`}</p>
      </header>

      {erro && <div className="banner banner-error">{erro}</div>}

      <div className="split split-wide">
        <section className="panel">
          <h2>Adicionar preço de material</h2>
          <form className="form-grid" onSubmit={adicionarPreco}>
            <label className="span-2">Material
              <select required value={form.materialId} onChange={(e) => setForm({ ...form, materialId: e.target.value })}>
                <option value="">Selecione…</option>
                {materiais.map((m) => <option key={m.id} value={m.id}>{m.sku} — {m.nome}</option>)}
              </select>
            </label>
            <label>Preço unitário (R$)
              <input required type="number" step="0.01" value={form.precoUnitario}
                     onChange={(e) => setForm({ ...form, precoUnitario: e.target.value })} />
            </label>
            <label>Prazo de entrega (dias)
              <input type="number" value={form.prazoEntregaDias}
                     onChange={(e) => setForm({ ...form, prazoEntregaDias: e.target.value })} />
            </label>
            <label style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={form.preferencial}
                     onChange={(e) => setForm({ ...form, preferencial: e.target.checked })} style={{ width: 'auto' }} />
              Fornecedor preferencial para este material
            </label>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Adicionar à tabela de preços</button>
            </div>
          </form>
        </section>

        <section className="panel">
          <h2>Tabela de preços</h2>
          <table className="table">
            <thead><tr><th>Material</th><th>Preço</th><th>Prazo</th><th></th></tr></thead>
            <tbody>
              {precos.map((p) => (
                <tr key={p.id}>
                  <td className="mono">{p.materialSku}<br /><span className="muted">{p.materialNome}</span></td>
                  <td className="mono">R$ {Number(p.precoUnitario).toFixed(2)} {p.preferencial && <span className="tag">preferencial</span>}</td>
                  <td className="mono">{p.prazoEntregaDias ? `${p.prazoEntregaDias}d` : '—'}</td>
                  <td className="row-actions">
                    <button className="btn-link btn-danger" onClick={() => removerPreco(p.id)}>remover</button>
                  </td>
                </tr>
              ))}
              {precos.length === 0 && <tr><td colSpan={4} className="muted">Nenhum preço cadastrado ainda.</td></tr>}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}
