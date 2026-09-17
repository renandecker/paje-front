import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client.js'

const ITEM_VAZIO = {
  materialId: '', quantidadeNecessaria: '', percentualPerdaAplicado: '',
  comprimentoPecaMm: '', larguraPecaMm: '', ladosFitados: '',
}

export default function MovelDetalhe() {
  const { id } = useParams()
  const [movel, setMovel] = useState(null)
  const [materiais, setMateriais] = useState([])
  const [item, setItem] = useState(ITEM_VAZIO)
  const [quantidadeSimulada, setQuantidadeSimulada] = useState(1)
  const [necessidade, setNecessidade] = useState(null)
  const [erro, setErro] = useState(null)

  function carregar() {
    api.buscarMovel(id).then(setMovel).catch((e) => setErro(e.message))
  }

  useEffect(() => {
    carregar()
    api.listarMateriais().then(setMateriais).catch((e) => setErro(e.message))
  }, [id])

  function numOuNull(v) {
    if (v === '' || v === null || v === undefined) return null
    const n = Number(v)
    return Number.isNaN(n) ? null : n
  }

  async function adicionarItem(e) {
    e.preventDefault()
    setErro(null)
    try {
      await api.adicionarItemEstrutura(id, {
        materialId: Number(item.materialId),
        quantidadeNecessaria: numOuNull(item.quantidadeNecessaria),
        percentualPerdaAplicado: numOuNull(item.percentualPerdaAplicado),
        comprimentoPecaMm: numOuNull(item.comprimentoPecaMm),
        larguraPecaMm: numOuNull(item.larguraPecaMm),
        ladosFitados: numOuNull(item.ladosFitados),
      })
      setItem(ITEM_VAZIO)
      carregar()
    } catch (e2) {
      setErro(e2.message)
    }
  }

  async function removerItem(itemId) {
    if (!confirm('Remover este componente da estrutura do móvel?')) return
    try {
      await api.removerItemEstrutura(id, itemId)
      carregar()
    } catch (e) {
      setErro(e.message)
    }
  }

  async function calcularNecessidade() {
    setErro(null)
    try {
      const resp = await api.calcularNecessidade(id, Number(quantidadeSimulada) || 1)
      setNecessidade(resp)
    } catch (e) {
      setErro(e.message)
    }
  }

  if (!movel) {
    return <div className="page"><p className="muted">Carregando modelo…</p></div>
  }

  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow-plain"><Link to="/moveis">Móveis</Link> / {movel.codigo}</p>
        <h1>{movel.nome}</h1>
        {movel.descricao && <p className="lede">{movel.descricao}</p>}
        {movel.tempoEstimadoMontagemMin && (
          <p className="mono muted">Tempo estimado de montagem: {movel.tempoEstimadoMontagemMin} min / unidade</p>
        )}
      </header>

      {erro && <div className="banner banner-error">{erro}</div>}

      <div className="split split-wide">
        <section className="panel">
          <h2>Adicionar componente à BOM</h2>
          <form className="form-grid" onSubmit={adicionarItem}>
            <label className="span-2">Material
              <select required value={item.materialId} onChange={(e) => setItem({ ...item, materialId: e.target.value })}>
                <option value="">Selecione…</option>
                {materiais.map((m) => (
                  <option key={m.id} value={m.id}>{m.sku} — {m.nome}</option>
                ))}
              </select>
            </label>
            <label>Quantidade necessária
              <input required type="number" step="0.001" value={item.quantidadeNecessaria}
                     onChange={(e) => setItem({ ...item, quantidadeNecessaria: e.target.value })} />
            </label>
            <label>% de perda (opcional)
              <input type="number" step="0.01" min="0" max="1" value={item.percentualPerdaAplicado}
                     onChange={(e) => setItem({ ...item, percentualPerdaAplicado: e.target.value })} />
              <span className="hint">se vazio, usa o fator padrão do material</span>
            </label>
            <label>Comprimento da peça (mm)
              <input type="number" value={item.comprimentoPecaMm}
                     onChange={(e) => setItem({ ...item, comprimentoPecaMm: e.target.value })} />
            </label>
            <label>Largura da peça (mm)
              <input type="number" value={item.larguraPecaMm}
                     onChange={(e) => setItem({ ...item, larguraPecaMm: e.target.value })} />
            </label>
            <label>Lados fitados
              <input type="number" min="0" max="4" value={item.ladosFitados}
                     onChange={(e) => setItem({ ...item, ladosFitados: e.target.value })} />
            </label>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Adicionar à estrutura</button>
            </div>
          </form>
        </section>

        <section className="panel">
          <h2>Estrutura do móvel (BOM)</h2>
          <table className="table">
            <thead><tr><th>Material</th><th>Qtd.</th><th>% Perda</th><th>Peça (mm)</th><th></th></tr></thead>
            <tbody>
              {movel.estrutura?.map((it) => (
                <tr key={it.id}>
                  <td className="mono">{it.materialSku}<br /><span className="muted">{it.materialNome}</span></td>
                  <td className="mono">{it.quantidadeNecessaria}</td>
                  <td className="mono">{it.percentualPerdaAplicado ?? '— (padrão)'}</td>
                  <td className="mono">
                    {it.comprimentoPecaMm && it.larguraPecaMm ? `${it.comprimentoPecaMm} × ${it.larguraPecaMm}` : '—'}
                  </td>
                  <td className="row-actions">
                    <button className="btn-link btn-danger" onClick={() => removerItem(it.id)}>remover</button>
                  </td>
                </tr>
              ))}
              {(!movel.estrutura || movel.estrutura.length === 0) && (
                <tr><td colSpan={5} className="muted">Nenhum componente cadastrado ainda.</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </div>

      <section className="panel">
        <div className="panel-toolbar">
          <h2>Explosão de materiais</h2>
          <div className="inline-form">
            <label>Quantidade de móveis
              <input type="number" min="1" value={quantidadeSimulada}
                     onChange={(e) => setQuantidadeSimulada(e.target.value)} style={{ width: '5rem' }} />
            </label>
            <button className="btn-primary" onClick={calcularNecessidade}>Calcular necessidade</button>
          </div>
        </div>

        {necessidade && (
          <>
            <table className="table">
              <thead>
                <tr><th>Material</th><th>Tipo</th><th>Qtd. base</th><th>% Perda</th><th>Qtd. c/ perda</th><th>Custo total</th></tr>
              </thead>
              <tbody>
                {necessidade.itens.map((it) => (
                  <tr key={it.materialId}>
                    <td className="mono">{it.sku}<br /><span className="muted">{it.nome}</span></td>
                    <td><span className="tag">{it.tipo}</span></td>
                    <td className="mono">{it.quantidadeBaseTotal} {it.unidadeMedida}</td>
                    <td className="mono">{(it.percentualPerdaAplicado * 100).toFixed(0)}%</td>
                    <td className="mono">{it.quantidadeComPerda} {it.unidadeMedida}</td>
                    <td className="mono">R$ {it.custoTotalEstimado.toFixed ? it.custoTotalEstimado.toFixed(2) : it.custoTotalEstimado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="summary-row">
              <span>Custo total estimado: <strong className="mono">R$ {Number(necessidade.custoTotalEstimado).toFixed(2)}</strong></span>
              {necessidade.tempoTotalEstimadoMin && (
                <span>Tempo total: <strong className="mono">{necessidade.tempoTotalEstimadoMin} min</strong></span>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  )
}
