import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

import GoalCard from './GoalCard'
import { Button } from '../ui/button'

interface GoalListProps {
  goals: any[]
  isLoading: boolean
  onEdit: (goal: any) => void
  onDelete: (goalId: number) => void
}

const GoalList = ({ goals, isLoading, onEdit, onDelete }: GoalListProps) => {
  if (isLoading) {
    return (
      <>
        <Skeleton />
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </>
    )
  }

  if (!goals.length) {
    return <p>Não há metas cadastradas.</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {goals.map((goal: any) => (
        <div key={goal.idMetaDiaria} className="p-4 border rounded-md shadow-sm">
          <h2 className="text-xl font-bold">{goal.titulo}</h2>
          <p>{goal.objetivo}</p>
          <p>Progresso Atual: {goal.progressoAtual}</p>
          <p>Progresso Máximo: {goal.progressoMaximo}</p>
          <p>Progresso Item: {goal.progressoItem}</p>
          <p>Situação: {goal.situacaoMetaDiaria === 0 ? 'Em andamento' : 'Concluída'}</p>
          <div className="mt-2 space-x-2">
            <Button
              onClick={() => onEdit(goal)}
              className="rounded-md"
            >
              Editar
            </Button>
            <Button
              onClick={() => onDelete(goal.idMetaDiaria)}
              className="bg-red-500 text-white rounded-md"
            >
              Excluir
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default GoalList
