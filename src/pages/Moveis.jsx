import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client.js'

const VAZIO = { codigo: '', nome: '', descricao: '', tempoEstimadoMontagemMin: '' }

export default function Moveis() {
  const [moveis, setMoveis] = useState([])
  const [form, setForm] = useState(VAZIO)
  const [erro, setErro] = useState(null)

  function carregar() {
    api.listarMoveis().then(setMoveis).catch((e) => setErro(e.message))
  }

  useEffect(carregar, [])

  async function salvar(e) {
    e.preventDefault()
    setErro(null)
    try {
      await api.criarMovel({
        ...form,
        tempoEstimadoMontagemMin: form.tempoEstimadoMontagemMin ? Number(form.tempoEstimadoMontagemMin) : null,
      })
      setForm(VAZIO)
      carregar()
    } catch (e2) {
      setErro(e2.message)
    }
  }

  async function remover(id) {
    if (!confirm('Remover este modelo de móvel e toda a sua estrutura (BOM)?')) return
    try {
      await api.removerMovel(id)
      carregar()
    } catch (e) {
      setErro(e.message)
    }
  }

  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow-plain">Catálogo</p>
        <h1>Modelos de Móveis</h1>
        <p className="lede">Cada modelo tem uma lista fixa de componentes (BOM) e um tempo de montagem estimado.</p>
      </header>

      {erro && <div className="banner banner-error">{erro}</div>}

      <div className="split split-wide">
        <section className="panel">
          <h2>Novo modelo</h2>
          <form className="form-grid" onSubmit={salvar}>
            <label>Código
              <input required value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="MOV-003" />
            </label>
            <label>Nome
              <input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </label>
            <label className="span-2">Descrição
              <textarea rows={3} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
            </label>
            <label>Tempo estimado (min)
              <input type="number" value={form.tempoEstimadoMontagemMin} onChange={(e) => setForm({ ...form, tempoEstimadoMontagemMin: e.target.value })} />
            </label>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Adicionar modelo</button>
            </div>
          </form>
        </section>

        <section className="panel">
          <h2>Modelos cadastrados</h2>
          <table className="table">
            <thead><tr><th>Código</th><th>Nome</th><th>Tempo</th><th></th></tr></thead>
            <tbody>
              {moveis.map((m) => (
                <tr key={m.id}>
                  <td className="mono">{m.codigo}</td>
                  <td><Link to={`/moveis/${m.id}`}>{m.nome}</Link></td>
                  <td className="mono">{m.tempoEstimadoMontagemMin ? `${m.tempoEstimadoMontagemMin} min` : '—'}</td>
                  <td className="row-actions">
                    <Link className="btn-link" to={`/moveis/${m.id}`}>ver BOM</Link>
                    <button className="btn-link btn-danger" onClick={() => remover(m.id)}>remover</button>
                  </td>
                </tr>
              ))}
              {moveis.length === 0 && <tr><td colSpan={4} className="muted">Nenhum modelo cadastrado.</td></tr>}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}
