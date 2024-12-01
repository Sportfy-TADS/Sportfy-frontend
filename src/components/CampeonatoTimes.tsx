'use client'

import React from 'react'

interface Time {
  id: number
  nome: string
  // ... other fields ...
}

interface CampeonatoTimesProps {
  campeonatoId: number
  times: Time[]
}

const CampeonatoTimes: React.FC<CampeonatoTimesProps> = ({ campeonatoId, times }) => {
  return (
    <div className="campeonato-times">
      <h2>Times Participantes</h2>
      {times.length === 0 ? (
        <p>Nenhum time inscrito neste campeonato.</p>
      ) : (
        <ul>
          {times.map((time) => (
            <li key={time.id}>
              {time.nome}
              {/* Add more time details as needed */}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default CampeonatoTimes