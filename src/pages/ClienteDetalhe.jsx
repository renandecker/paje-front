import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client.js'

const VENDA_VAZIA = { movelId: '', quantidade: 1, valorUnitario: '' }
const STATUS = ['PENDENTE', 'ENTREGUE', 'CANCELADA']

export default function ClienteDetalhe() {
  const { id } = useParams()
  const [cliente, setCliente] = useState(null)
  const [compras, setCompras] = useState([])
  const [moveis, setMoveis] = useState([])
  const [form, setForm] = useState(VENDA_VAZIA)
  const [erro, setErro] = useState(null)

  function carregar() {
    api.buscarCliente(id).then(setCliente).catch((e) => setErro(e.message))
    api.listarComprasDoCliente(id).then(setCompras).catch((e) => setErro(e.message))
  }

  useEffect(() => {
    carregar()
    api.listarMoveis().then(setMoveis).catch((e) => setErro(e.message))
  }, [id])

  async function registrarCompra(e) {
    e.preventDefault()
    setErro(null)
    try {
      await api.criarVenda({
        clienteId: Number(id),
        movelId: Number(form.movelId),
        quantidade: Number(form.quantidade),
        valorUnitario: Number(form.valorUnitario),
      })
      setForm(VENDA_VAZIA)
      carregar()
    } catch (e2) {
      setErro(e2.message)
    }
  }

  async function mudarStatus(vendaId, status) {
    try {
      await api.atualizarStatusVenda(vendaId, status)
      carregar()
    } catch (e) {
      setErro(e.message)
    }
  }

  if (!cliente) {
    return <div className="page"><p className="muted">Carregando cliente…</p></div>
  }

  const endereco = [cliente.logradouro, cliente.numero, cliente.complemento].filter(Boolean).join(', ')
  const localidade = [cliente.bairro, cliente.cidade && `${cliente.cidade}/${cliente.estado}`, cliente.cep].filter(Boolean).join(' — ')

  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow-plain"><Link to="/clientes">Clientes</Link> / {cliente.nome}</p>
        <h1>{cliente.nome}</h1>
        <p className="mono muted">{cliente.cpfCnpj}</p>
        <p className="lede">
          {cliente.telefone && <>{cliente.telefone} · </>}{cliente.email}
        </p>
        {endereco && <p className="lede">{endereco}{localidade && <><br />{localidade}</>}</p>}
      </header>

      {erro && <div className="banner banner-error">{erro}</div>}

      <div className="split split-wide">
        <section className="panel">
          <h2>Registrar compra</h2>
          <form className="form-grid" onSubmit={registrarCompra}>
            <label className="span-2">Móvel
              <select required value={form.movelId} onChange={(e) => setForm({ ...form, movelId: e.target.value })}>
                <option value="">Selecione…</option>
                {moveis.map((m) => <option key={m.id} value={m.id}>{m.codigo} — {m.nome}</option>)}
              </select>
            </label>
            <label>Quantidade
              <input required type="number" min="1" value={form.quantidade}
                     onChange={(e) => setForm({ ...form, quantidade: e.target.value })} />
            </label>
            <label>Valor unitário (R$)
              <input required type="number" step="0.01" value={form.valorUnitario}
                     onChange={(e) => setForm({ ...form, valorUnitario: e.target.value })} />
            </label>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Registrar compra</button>
            </div>
          </form>
        </section>

        <section className="panel">
          <h2>Histórico de compras</h2>
          <table className="table">
            <thead><tr><th>Móvel</th><th>Qtd.</th><th>Valor total</th><th>Data</th><th>Status</th></tr></thead>
            <tbody>
              {compras.map((v) => (
                <tr key={v.id}>
                  <td>{v.movelNome}<br /><span className="mono muted">{v.movelCodigo}</span></td>
                  <td className="mono">{v.quantidade}</td>
                  <td className="mono">R$ {Number(v.valorTotal).toFixed(2)}</td>
                  <td className="mono muted">{new Date(v.dataVenda).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <select value={v.status} onChange={(e) => mudarStatus(v.id, e.target.value)}>
                      {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {compras.length === 0 && <tr><td colSpan={5} className="muted">Nenhuma compra registrada ainda.</td></tr>}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}
