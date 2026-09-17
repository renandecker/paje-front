import React, { useEffect, useState } from 'react'

/**
 * Mostra um aviso fixo no topo quando alguma chamada à API está demorando
 * mais que o normal (sinal de que o servidor pode estar "acordando" de um
 * cold start, comum em planos gratuitos que dormem após 15min inativos).
 *
 * Escuta o evento 'api:cold-start' disparado por src/api/client.js — não
 * tem acoplamento direto com o client, então funciona pra qualquer chamada
 * feita por ele, em qualquer página, sem precisar passar props por todo lado.
 */
export default function ColdStartBanner() {
  const [acordando, setAcordando] = useState(false)

  useEffect(() => {
    function aoMudar(e) {
      setAcordando(e.detail.acordando)
    }
    window.addEventListener('api:cold-start', aoMudar)
    return () => window.removeEventListener('api:cold-start', aoMudar)
  }, [])

  if (!acordando) return null

  return (
    <div className="cold-start-banner" role="status">
      <span className="cold-start-spinner" aria-hidden="true" />
      <span>
        Acordando o servidor… a instância gratuita foi desativada por inatividade,
        o que pode atrasar essa resposta em 50 segundos ou mais. Aguarde, não é
        necessário recarregar a página.
      </span>
    </div>
  )
}
