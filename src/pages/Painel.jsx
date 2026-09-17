import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client.js'

export default function Painel() {
  const [materiais, setMateriais] = useState([])
  const [moveis, setMoveis] = useState([])
  const [ordens, setOrdens] = useState([])
  const [abaixoEstoque, setAbaixoEstoque] = useState([])
  const [erro, setErro] = useState(null)

  useEffect(() => {
    Promise.all([
      api.listarMateriais(),
      api.listarMoveis(),
      api.listarOrdens(),
      api.materiaisAbaixoEstoque(),
    ])
      .then(([m, mv, o, ae]) => {
        setMateriais(m); setMoveis(mv); setOrdens(o); setAbaixoEstoque(ae)
      })
      .catch((e) => setErro(e.message))
  }, [])

  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow-plain">Visão geral</p>
        <h1>Painel de Produção</h1>
        <p className="lede">
          Catálogo de materiais, modelos de móveis e ordens de montagem em andamento na oficina.
        </p>
      </header>

      {erro && <div className="banner banner-error">Não foi possível carregar os dados: {erro}</div>}

      <section className="kpi-row">
        <div className="kpi-card">
          <span className="kpi-value">{materiais.length}</span>
          <span className="kpi-label">materiais cadastrados</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-value">{moveis.length}</span>
          <span className="kpi-label">modelos de móveis</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-value">{ordens.length}</span>
          <span className="kpi-label">ordens de montagem</span>
        </div>
        <div className={'kpi-card' + (abaixoEstoque.length ? ' kpi-warn' : '')}>
          <span className="kpi-value">{abaixoEstoque.length}</span>
          <span className="kpi-label">materiais abaixo do estoque mínimo</span>
        </div>
      </section>

      <div className="split">
        <section className="panel">
          <h2>Modelos recentes</h2>
          {moveis.length === 0 && <p className="muted">Nenhum móvel cadastrado ainda.</p>}
          <ul className="plain-list">
            {moveis.slice(0, 6).map((m) => (
              <li key={m.id}>
                <Link to={`/moveis/${m.id}`}>{m.nome}</Link>
                <span className="mono muted">{m.codigo}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h2>Materiais abaixo do estoque mínimo</h2>
          {abaixoEstoque.length === 0 && <p className="muted">Todos os materiais estão dentro do nível mínimo.</p>}
          <ul className="plain-list">
            {abaixoEstoque.map((m) => (
              <li key={m.id}>
                <span>{m.nome}</span>
                <span className="mono warn">{m.estoqueAtual} / {m.estoqueMinimo} {m.unidadeMedida}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
