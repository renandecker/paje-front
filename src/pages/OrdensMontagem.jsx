import React, { useEffect, useState } from 'react'
import { api } from '../api/client.js'

const STATUS = ['RASCUNHO', 'APROVADA', 'EM_PRODUCAO', 'CONCLUIDA', 'CANCELADA']

export default function OrdensMontagem() {
  const [ordens, setOrdens] = useState([])
  const [moveis, setMoveis] = useState([])
  const [form, setForm] = useState({ movelId: '', quantidadeMoveis: 1 })
  const [erro, setErro] = useState(null)

  function carregar() {
    api.listarOrdens().then(setOrdens).catch((e) => setErro(e.message))
  }

  useEffect(() => {
    carregar()
    api.listarMoveis().then(setMoveis).catch((e) => setErro(e.message))
  }, [])

  async function salvar(e) {
    e.preventDefault()
    setErro(null)
    try {
      await api.criarOrdem({ movelId: Number(form.movelId), quantidadeMoveis: Number(form.quantidadeMoveis) })
      setForm({ movelId: '', quantidadeMoveis: 1 })
      carregar()
    } catch (e2) {
      setErro(e2.message)
    }
  }

  async function mudarStatus(id, status) {
    try {
      await api.atualizarStatusOrdem(id, status)
      carregar()
    } catch (e) {
      setErro(e.message)
    }
  }

  async function remover(id) {
    if (!confirm('Remover esta ordem de montagem?')) return
    try {
      await api.removerOrdem(id)
      carregar()
    } catch (e) {
      setErro(e.message)
    }
  }

  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow-plain">Produção</p>
        <h1>Ordens de Montagem</h1>
        <p className="lede">Solicitações de produção de um modelo de móvel em determinada quantidade.</p>
      </header>

      {erro && <div className="banner banner-error">{erro}</div>}

      <div className="split split-wide">
        <section className="panel">
          <h2>Nova ordem</h2>
          <form className="form-grid" onSubmit={salvar}>
            <label className="span-2">Modelo de móvel
              <select required value={form.movelId} onChange={(e) => setForm({ ...form, movelId: e.target.value })}>
                <option value="">Selecione…</option>
                {moveis.map((m) => <option key={m.id} value={m.id}>{m.codigo} — {m.nome}</option>)}
              </select>
            </label>
            <label>Quantidade
              <input required type="number" min="1" value={form.quantidadeMoveis}
                     onChange={(e) => setForm({ ...form, quantidadeMoveis: e.target.value })} />
            </label>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Criar ordem</button>
            </div>
          </form>
        </section>

        <section className="panel">
          <h2>Ordens registradas</h2>
          <table className="table">
            <thead><tr><th>Móvel</th><th>Qtd.</th><th>Criada em</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {ordens.map((o) => (
                <tr key={o.id}>
                  <td>{o.movelNome}</td>
                  <td className="mono">{o.quantidadeMoveis}</td>
                  <td className="mono muted">{new Date(o.dataCriacao).toLocaleString('pt-BR')}</td>
                  <td>
                    <select value={o.status} onChange={(e) => mudarStatus(o.id, e.target.value)}>
                      {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="row-actions">
                    <button className="btn-link btn-danger" onClick={() => remover(o.id)}>remover</button>
                  </td>
                </tr>
              ))}
              {ordens.length === 0 && <tr><td colSpan={5} className="muted">Nenhuma ordem registrada.</td></tr>}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}
