 'use client'

import React from 'react'
import { Calendar } from 'lucide-react'

interface CampeonatoStatusProps {
  situacaoCampeonato: string
}

const CampeonatoStatus: React.FC<CampeonatoStatusProps> = ({ situacaoCampeonato }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EM_ABERTO':
        return 'text-green-500'
      case 'EM_ANDAMENTO':
        return 'text-yellow-500'
      case 'FINALIZADO':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  const statusColor = getStatusColor(situacaoCampeonato)
  const formattedStatus = situacaoCampeonato.replace('_', ' ')

  return (
    <div className="campeonato-status">
      <h2>Status do Campeonato</h2>
      <p className={`font-semibold ${statusColor}`}>
        <strong>Situacao:</strong> {formattedStatus} <Calendar className="inline ml-2" size={16} color="orange" />
      </p>
      {/* Add more status details as needed */}
    </div>
  )
}

export default CampeonatoStatus