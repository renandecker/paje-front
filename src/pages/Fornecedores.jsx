import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client.js'

const VAZIO = { nome: '', cnpj: '', email: '', telefone: '', logradouro: '', numero: '', cidade: '', estado: '', cep: '', ativo: true }

export default function Fornecedores() {
  const [fornecedores, setFornecedores] = useState([])
  const [form, setForm] = useState(VAZIO)
  const [erro, setErro] = useState(null)

  function carregar() {
    api.listarFornecedores().then(setFornecedores).catch((e) => setErro(e.message))
  }

  useEffect(carregar, [])

  async function salvar(e) {
    e.preventDefault()
    setErro(null)
    try {
      await api.criarFornecedor(form)
      setForm(VAZIO)
      carregar()
    } catch (e2) {
      setErro(e2.message)
    }
  }

  async function remover(id) {
    if (!confirm('Remover este fornecedor e suas cotações de preço?')) return
    try {
      await api.removerFornecedor(id)
      carregar()
    } catch (e) {
      setErro(e.message)
    }
  }

  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow-plain">Cadastro</p>
        <h1>Fornecedores</h1>
        <p className="lede">Fornecedores de materiais e a tabela de preços praticados por cada um.</p>
      </header>

      {erro && <div className="banner banner-error">{erro}</div>}

      <div className="split split-wide">
        <section className="panel">
          <h2>Novo fornecedor</h2>
          <form className="form-grid" onSubmit={salvar}>
            <label className="span-2">Nome
              <input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </label>
            <label>CNPJ
              <input value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} placeholder="00.000.000/0000-00" />
            </label>
            <label>Telefone
              <input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
            </label>
            <label className="span-2">E-mail
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>
            <label className="span-2">Logradouro
              <input value={form.logradouro} onChange={(e) => setForm({ ...form, logradouro: e.target.value })} />
            </label>
            <label>Número
              <input value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} />
            </label>
            <label>Cidade
              <input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} />
            </label>
            <label>UF
              <input maxLength={2} value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value.toUpperCase() })} />
            </label>
            <label>CEP
              <input value={form.cep} onChange={(e) => setForm({ ...form, cep: e.target.value })} />
            </label>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Adicionar fornecedor</button>
            </div>
          </form>
        </section>

        <section className="panel">
          <h2>Fornecedores cadastrados</h2>
          <table className="table">
            <thead><tr><th>Nome</th><th>Contato</th><th>Cidade</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {fornecedores.map((f) => (
                <tr key={f.id}>
                  <td><Link to={`/fornecedores/${f.id}`}>{f.nome}</Link><br /><span className="mono muted">{f.cnpj}</span></td>
                  <td className="mono">{f.telefone || f.email || '—'}</td>
                  <td>{f.cidade ? `${f.cidade}/${f.estado}` : '—'}</td>
                  <td><span className={'tag' + (!f.ativo ? '' : '')}>{f.ativo ? 'ativo' : 'inativo'}</span></td>
                  <td className="row-actions">
                    <Link className="btn-link" to={`/fornecedores/${f.id}`}>ver preços</Link>
                    <button className="btn-link btn-danger" onClick={() => remover(f.id)}>remover</button>
                  </td>
                </tr>
              ))}
              {fornecedores.length === 0 && <tr><td colSpan={5} className="muted">Nenhum fornecedor cadastrado.</td></tr>}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}
