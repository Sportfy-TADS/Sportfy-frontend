import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

import GoalCard from './GoalCard'

interface GoalListProps {
  goals: any[]
  isLoading: boolean
  onEdit: (goal: any) => void
  onDelete: (goalId: number) => void
}

const GoalList = ({ goals, isLoading, onEdit, onDelete }: GoalListProps) => {
  if (isLoading) {
    return <div>Loading...</div>
  }

  if (goals.length === 0) {
    return <div>No goals found</div>
  }

  return (
    <div className="space-y-4">
      {goals.map((goal) => (
        <div key={goal.idMetaDiaria} className="p-4 border rounded-md shadow-sm">
          <h2 className="text-xl font-bold">{goal.titulo}</h2>
          <p>{goal.objetivo}</p>
          <p>Progresso Atual: {goal.progressoAtual}</p>
          <p>Progresso Máximo: {goal.progressoMaximo}</p>
          <p>Progresso Item: {goal.progressoItem}</p>
          <p>Situação: {goal.situacaoMetaDiaria === 0 ? 'Em andamento' : 'Concluída'}</p>
          <div className="mt-2 space-x-2">
            <button
              onClick={() => onEdit(goal)}
              className="py-1 px-3 bg-yellow-500 text-white rounded-md"
            >
              Editar
            </button>
            <button
              onClick={() => onDelete(goal.idMetaDiaria)}
              className="py-1 px-3 bg-red-500 text-white rounded-md"
            >
              Excluir
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default GoalList
