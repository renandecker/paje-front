import React, { useState } from 'react'
import { NavLink, Route, Routes, Navigate, useLocation } from 'react-router-dom'
import ColdStartBanner from './components/ColdStartBanner.jsx'
import Painel from './pages/Painel.jsx'
import Materiais from './pages/Materiais.jsx'
import Moveis from './pages/Moveis.jsx'
import MovelDetalhe from './pages/MovelDetalhe.jsx'
import OrdensMontagem from './pages/OrdensMontagem.jsx'
import Calculadoras from './pages/Calculadoras.jsx'
import Clientes from './pages/Clientes.jsx'
import ClienteDetalhe from './pages/ClienteDetalhe.jsx'
import Fornecedores from './pages/Fornecedores.jsx'
import FornecedorDetalhe from './pages/FornecedorDetalhe.jsx'
import Estoque from './pages/Estoque.jsx'
import FluxoCaixa from './pages/FluxoCaixa.jsx'

const NAV_ITEMS = [
  { to: '/', label: 'Painel', end: true },
  { to: '/materiais', label: 'Materiais' },
  { to: '/estoque', label: 'Entrada · Saída' },
  { to: '/fornecedores', label: 'Fornecedores' },
  { to: '/moveis', label: 'Móveis · BOM' },
  { to: '/clientes', label: 'Clientes' },
  { to: '/ordens', label: 'Ordens de Montagem' },
  { to: '/fluxo-caixa', label: 'Fluxo de Caixa' },
  { to: '/calculadoras', label: 'Calculadoras' },
]

export default function App() {
  const [menuAberto, setMenuAberto] = useState(false)
  const location = useLocation()

  // Fecha o menu mobile a cada troca de rota
  React.useEffect(() => {
    setMenuAberto(false)
  }, [location.pathname])

  // Trava o scroll do body e fecha com Esc quando o drawer está aberto
  React.useEffect(() => {
    document.body.style.overflow = menuAberto ? 'hidden' : ''
    function aoTeclar(e) {
      if (e.key === 'Escape') setMenuAberto(false)
    }
    if (menuAberto) window.addEventListener('keydown', aoTeclar)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', aoTeclar)
    }
  }, [menuAberto])

  return (
    <div className="shell">
      {/* Barra superior — só aparece no mobile (<=900px via CSS) */}
      <header className="topbar">
        <button
          type="button"
          className={'nav-toggle' + (menuAberto ? ' is-open' : '')}
          aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuAberto}
          onClick={() => setMenuAberto((v) => !v)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
        <img src="/logo-moveis-paje.png" alt="Móveis Pajé" className="topbar-logo" />
      </header>

      <ColdStartBanner />

      {menuAberto && (
        <div className="nav-overlay" onClick={() => setMenuAberto(false)} aria-hidden="true" />
      )}

      <aside className={'sidebar' + (menuAberto ? ' is-open' : '')}>
        <div className="brand">
          <img src="/logo-moveis-paje.png" alt="Móveis Pajé" className="brand-logo" />
        </div>

        <nav className="nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMenuAberto(false)}
              className={({ isActive }) => 'nav-link' + (isActive ? ' is-active' : '')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-foot">
          <span className="tick">±1mm</span>
          <p>Tolerância dimensional padrão para peças cortadas (MDF/MDP).</p>
        </div>
      </aside>

      <main className="content">
        <Routes>
          <Route path="/" element={<Painel />} />
          <Route path="/materiais" element={<Materiais />} />
          <Route path="/estoque" element={<Estoque />} />
          <Route path="/fornecedores" element={<Fornecedores />} />
          <Route path="/fornecedores/:id" element={<FornecedorDetalhe />} />
          <Route path="/moveis" element={<Moveis />} />
          <Route path="/moveis/:id" element={<MovelDetalhe />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/clientes/:id" element={<ClienteDetalhe />} />
          <Route path="/ordens" element={<OrdensMontagem />} />
          <Route path="/fluxo-caixa" element={<FluxoCaixa />} />
          <Route path="/calculadoras" element={<Calculadoras />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
