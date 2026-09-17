import React from 'react'
import { NavLink, Route, Routes, Navigate } from 'react-router-dom'
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
  return (
    <div className="shell">
      <ColdStartBanner />
      <aside className="sidebar">
        <div className="brand">
          <img src="/logo-moveis-paje.png" alt="Móveis Pajé" className="brand-logo" />
        </div>

        <nav className="nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
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
