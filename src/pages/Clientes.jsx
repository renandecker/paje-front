import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client.js'

const VAZIO = {
  nome: '', cpfCnpj: '', email: '', telefone: '',
  logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '',
}

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [busca, setBusca] = useState('')
  const [form, setForm] = useState(VAZIO)
  const [erro, setErro] = useState(null)

  function carregar(termo) {
    api.listarClientes(termo).then(setClientes).catch((e) => setErro(e.message))
  }

  useEffect(() => { carregar() }, [])

  function buscar(e) {
    e.preventDefault()
    carregar(busca)
  }

  async function salvar(e) {
    e.preventDefault()
    setErro(null)
    try {
      await api.criarCliente(form)
      setForm(VAZIO)
      carregar(busca)
    } catch (e2) {
      setErro(e2.message)
    }
  }

  async function remover(id) {
    if (!confirm('Remover este cliente?')) return
    try {
      await api.removerCliente(id)
      carregar(busca)
    } catch (e) {
      setErro(e.message)
    }
  }

  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow-plain">Cadastro</p>
        <h1>Clientes</h1>
        <p className="lede">Dados de contato, endereço e histórico de compras (móveis adquiridos).</p>
      </header>

      {erro && <div className="banner banner-error">{erro}</div>}

      <div className="split split-wide">
        <section className="panel">
          <h2>Novo cliente</h2>
          <form className="form-grid" onSubmit={salvar}>
            <label className="span-2">Nome
              <input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </label>
            <label>CPF/CNPJ
              <input value={form.cpfCnpj} onChange={(e) => setForm({ ...form, cpfCnpj: e.target.value })} placeholder="000.000.000-00" />
            </label>
            <label>Telefone
              <input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="(51) 99999-9999" />
            </label>
            <label className="span-2">E-mail
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>

            <label className="span-2">Logradouro
              <input value={form.logradouro} onChange={(e) => setForm({ ...form, logradouro: e.target.value })} placeholder="Rua, Av..." />
            </label>
            <label>Número
              <input value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} />
            </label>
            <label>Complemento
              <input value={form.complemento} onChange={(e) => setForm({ ...form, complemento: e.target.value })} />
            </label>
            <label>Bairro
              <input value={form.bairro} onChange={(e) => setForm({ ...form, bairro: e.target.value })} />
            </label>
            <label>Cidade
              <input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} />
            </label>
            <label>UF
              <input maxLength={2} value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value.toUpperCase() })} placeholder="RS" />
            </label>
            <label>CEP
              <input value={form.cep} onChange={(e) => setForm({ ...form, cep: e.target.value })} placeholder="00000-000" />
            </label>

            <div className="form-actions">
              <button type="submit" className="btn-primary">Adicionar cliente</button>
            </div>
          </form>
        </section>

        <section className="panel">
          <div className="panel-toolbar">
            <h2>Clientes cadastrados</h2>
            <form onSubmit={buscar} style={{ display: 'flex', gap: '0.5rem' }}>
              <input placeholder="Buscar por nome…" value={busca} onChange={(e) => setBusca(e.target.value)} />
              <button type="submit" className="btn-link">buscar</button>
            </form>
          </div>

          <table className="table">
            <thead><tr><th>Nome</th><th>Contato</th><th>Cidade</th><th></th></tr></thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id}>
                  <td><Link to={`/clientes/${c.id}`}>{c.nome}</Link><br /><span className="mono muted">{c.cpfCnpj}</span></td>
                  <td className="mono">{c.telefone || c.email || '—'}</td>
                  <td>{c.cidade ? `${c.cidade}/${c.estado}` : '—'}</td>
                  <td className="row-actions">
                    <Link className="btn-link" to={`/clientes/${c.id}`}>ver compras</Link>
                    <button className="btn-link btn-danger" onClick={() => remover(c.id)}>remover</button>
                  </td>
                </tr>
              ))}
              {clientes.length === 0 && <tr><td colSpan={4} className="muted">Nenhum cliente encontrado.</td></tr>}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}
