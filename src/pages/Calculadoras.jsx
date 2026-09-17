import React, { useState } from 'react'
import { api } from '../api/client.js'

const PECA_VAZIA = { comprimentoMm: '', larguraMm: '', quantidade: '' }
const LADO_VAZIO = { comprimentoLadoMm: '', quantidadeLados: '' }

export default function Calculadoras() {
  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow-plain">Seção 2 — Fórmulas e Cálculos de Insumos</p>
        <h1>Calculadoras de Plano de Corte</h1>
        <p className="lede">
          Simulações rápidas das fórmulas de chapas e fita de borda, sem precisar vincular a um móvel cadastrado.
        </p>
      </header>

      <div className="split split-wide">
        <CalculadoraChapas />
        <CalculadoraFitaBorda />
      </div>
    </div>
  )
}

function CalculadoraChapas() {
  const [materiais, setMateriais] = useState([])
  const [materialId, setMaterialId] = useState('')
  const [fornecedoresDoMaterial, setFornecedoresDoMaterial] = useState([])
  const [fornecedorId, setFornecedorId] = useState('')
  const [areaUtilChapaM2, setAreaUtilChapaM2] = useState('5.0325')
  const [percentualPerdaCorte, setPercentualPerdaCorte] = useState('0.20')
  const [pecas, setPecas] = useState([{ ...PECA_VAZIA }])
  const [resultado, setResultado] = useState(null)
  const [erro, setErro] = useState(null)

  React.useEffect(() => {
    api.listarMateriais('CHAPA').then(setMateriais).catch((e) => setErro(e.message))
  }, [])

  const materialSelecionado = materiais.find((m) => String(m.id) === String(materialId))

  React.useEffect(() => {
    if (!materialId) {
      setFornecedoresDoMaterial([])
      setFornecedorId('')
      return
    }
    api.listarFornecedoresDoMaterial(materialId)
      .then(setFornecedoresDoMaterial)
      .catch((e) => setErro(e.message))
    setFornecedorId('')
  }, [materialId])

  function escolherMaterial(id) {
    setMaterialId(id)
    const m = materiais.find((x) => String(x.id) === String(id))
    if (m && m.comprimentoMm && m.larguraMm) {
      const areaM2 = (m.comprimentoMm * m.larguraMm) / 1000000
      setAreaUtilChapaM2(areaM2.toFixed(4))
    }
  }

  function atualizarPeca(idx, campo, valor) {
    setPecas((ps) => ps.map((p, i) => (i === idx ? { ...p, [campo]: valor } : p)))
  }

  function adicionarPeca() {
    setPecas((ps) => [...ps, { ...PECA_VAZIA }])
  }

  function removerPeca(idx) {
    setPecas((ps) => ps.filter((_, i) => i !== idx))
  }

  async function calcular(e) {
    e.preventDefault()
    setErro(null)
    try {
      const resp = await api.calcularChapas({
        materialId: materialId ? Number(materialId) : null,
        fornecedorId: fornecedorId ? Number(fornecedorId) : null,
        areaUtilChapaM2: Number(areaUtilChapaM2),
        percentualPerdaCorte: Number(percentualPerdaCorte),
        pecas: pecas.map((p) => ({
          comprimentoMm: Number(p.comprimentoMm),
          larguraMm: Number(p.larguraMm),
          quantidade: Number(p.quantidade),
        })),
      })
      setResultado(resp)
    } catch (e2) {
      setErro(e2.message)
    }
  }

  return (
    <section className="panel">
      <h2>Plano de Corte (Chapas)</h2>
      <p className="formula">Área Total (m²) = Σ (Comprimento × Largura × Quantidade)</p>
      <p className="formula">Chapas Necessárias = ⌈ Área Total ÷ (Área Útil da Chapa × (1 − Perda Corte)) ⌉</p>

      {erro && <div className="banner banner-error">{erro}</div>}

      <form onSubmit={calcular}>
        <div className="form-grid">
          <label className="span-2">Material (chapa) — opcional
            <select value={materialId} onChange={(e) => escolherMaterial(e.target.value)}>
              <option value="">— informar área útil manualmente —</option>
              {materiais.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.sku} — {m.nome} {m.comprimentoMm && m.larguraMm ? `(${m.comprimentoMm}×${m.larguraMm}mm)` : ''}
                </option>
              ))}
            </select>
            <span className="hint">selecionando um material, a área útil é preenchida automaticamente</span>
          </label>

          {materialId && (
            <label className="span-2">Fornecedor — opcional
              <select value={fornecedorId} onChange={(e) => setFornecedorId(e.target.value)}>
                <option value="">
                  {fornecedoresDoMaterial.length > 0
                    ? `— usar custo padrão do material (R$ ${Number(materialSelecionado?.custoUnitario ?? 0).toFixed(2)}) —`
                    : '— nenhum fornecedor cadastrado para este material —'}
                </option>
                {fornecedoresDoMaterial.map((f) => (
                  <option key={f.id} value={f.fornecedorId}>
                    {f.fornecedorNome} — R$ {Number(f.precoUnitario).toFixed(2)} {f.preferencial ? '(preferencial)' : ''}
                  </option>
                ))}
              </select>
              <span className="hint">usa o preço cadastrado na tabela de preços do fornecedor selecionado</span>
            </label>
          )}

          <label>Área útil da chapa (m²)
            <input required type="number" step="0.0001" value={areaUtilChapaM2}
                   onChange={(e) => setAreaUtilChapaM2(e.target.value)} readOnly={!!materialId} />
            {materialId && <span className="hint">derivada do material selecionado</span>}
          </label>
          <label>% de perda de corte
            <input required type="number" step="0.01" min="0" max="0.9" value={percentualPerdaCorte}
                   onChange={(e) => setPercentualPerdaCorte(e.target.value)} />
            <span className="hint">0.15–0.25 conforme a especificação — ajuste livremente</span>
          </label>
        </div>

        <h3 className="subhead">Peças a cortar</h3>
        {pecas.map((p, idx) => (
          <div className="peca-row" key={idx}>
            <input required type="number" placeholder="Comprimento (mm)" value={p.comprimentoMm}
                   onChange={(e) => atualizarPeca(idx, 'comprimentoMm', e.target.value)} />
            <input required type="number" placeholder="Largura (mm)" value={p.larguraMm}
                   onChange={(e) => atualizarPeca(idx, 'larguraMm', e.target.value)} />
            <input required type="number" placeholder="Quantidade" value={p.quantidade}
                   onChange={(e) => atualizarPeca(idx, 'quantidade', e.target.value)} />
            <button type="button" className="btn-link btn-danger" onClick={() => removerPeca(idx)}
                    disabled={pecas.length === 1}>remover</button>
          </div>
        ))}
        <button type="button" className="btn-link" onClick={adicionarPeca}>+ adicionar peça</button>

        <div className="form-actions">
          <button type="submit" className="btn-primary">Calcular</button>
        </div>
      </form>

      {resultado && (
        <div className="result-block">
          <div><span>Área total de peças</span><strong className="mono">{resultado.areaTotalM2} m²</strong></div>
          <div><span>Área útil líquida por chapa</span><strong className="mono">{resultado.areaUtilLiquidaChapaM2} m²</strong></div>
          <div className="result-highlight">
            <span>Chapas necessárias</span><strong className="mono">{resultado.chapasNecessarias}</strong>
          </div>
          {resultado.custoTotalEstimado != null && (
            <>
              <div>
                <span>Custo unitário {resultado.fornecedorNome ? `(${resultado.fornecedorNome})` : '(padrão do material)'}</span>
                <strong className="mono">R$ {Number(resultado.custoUnitarioChapa).toFixed(2)}</strong>
              </div>
              <div className="result-highlight">
                <span>Custo total estimado</span>
                <strong className="mono">R$ {Number(resultado.custoTotalEstimado).toFixed(2)}</strong>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  )
}

function CalculadoraFitaBorda() {
  const [itens, setItens] = useState([{ ...LADO_VAZIO }])
  const [resultado, setResultado] = useState(null)
  const [erro, setErro] = useState(null)

  function atualizarItem(idx, campo, valor) {
    setItens((its) => its.map((it, i) => (i === idx ? { ...it, [campo]: valor } : it)))
  }

  function adicionarItem() {
    setItens((its) => [...its, { ...LADO_VAZIO }])
  }

  function removerItem(idx) {
    setItens((its) => its.filter((_, i) => i !== idx))
  }

  async function calcular(e) {
    e.preventDefault()
    setErro(null)
    try {
      const resp = await api.calcularFitaBorda({
        itens: itens.map((it) => ({
          comprimentoLadoMm: Number(it.comprimentoLadoMm),
          quantidadeLados: Number(it.quantidadeLados),
        })),
      })
      setResultado(resp)
    } catch (e2) {
      setErro(e2.message)
    }
  }

  return (
    <section className="panel">
      <h2>Fita de Borda</h2>
      <p className="formula">Perímetro Fitado (m) = Σ [(Lados Fitados) × Comprimento do Lado] × 1.10</p>

      {erro && <div className="banner banner-error">{erro}</div>}

      <form onSubmit={calcular}>
        <h3 className="subhead">Lados a fitar</h3>
        {itens.map((it, idx) => (
          <div className="peca-row" key={idx}>
            <input required type="number" placeholder="Comprimento do lado (mm)" value={it.comprimentoLadoMm}
                   onChange={(e) => atualizarItem(idx, 'comprimentoLadoMm', e.target.value)} />
            <input required type="number" placeholder="Qtd. de lados" value={it.quantidadeLados}
                   onChange={(e) => atualizarItem(idx, 'quantidadeLados', e.target.value)} />
            <button type="button" className="btn-link btn-danger" onClick={() => removerItem(idx)}
                    disabled={itens.length === 1}>remover</button>
          </div>
        ))}
        <button type="button" className="btn-link" onClick={adicionarItem}>+ adicionar lado</button>

        <div className="form-actions">
          <button type="submit" className="btn-primary">Calcular</button>
        </div>
      </form>

      {resultado && (
        <div className="result-block">
          <div><span>Perímetro bruto</span><strong className="mono">{resultado.perimetroBrutoM} m</strong></div>
          <div className="result-highlight">
            <span>Perímetro fitado (+10% seg.)</span><strong className="mono">{resultado.perimetroFitadoM} m</strong>
          </div>
        </div>
      )}
    </section>
  )
}
