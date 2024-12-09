import React from 'react'

import { CircleDashed, ClipboardPen, Target } from 'lucide-react'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Remover importação não utilizada
// import GoalCard from './GoalCard'
import { Button } from '../ui/button'

interface GoalListProps {
  goals: {
    idMetaDiaria: number
    titulo: string
    objetivo: string
    progressoItem: string
    progressoAtual: number
    progressoMaximo: number
    situacaoMetaDiaria: number
    isSports?: boolean // Optional flag to identify sports goals
  }[]
  isLoading: boolean
  onEdit: (goal: {
    idMetaDiaria: number
    titulo: string
    objetivo: string
    progressoItem: string
    progressoAtual: number
    progressoMaximo: number
    situacaoMetaDiaria: number
    isSports?: boolean
  }) => void
  onDelete?: (goalId: number) => void // Make onDelete optional
  // Remover userRole não utilizado
  // userRole?: string
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
      {goals.map((goal) => (
        <Card
          key={goal.idMetaDiaria}
          className="p-4 border border-amber-300 rounded-md shadow-sm"
        >
          <CardHeader>
            <CardTitle className="text-xl font-bold">{goal.titulo}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <Target className="inline-block mr-2 text-amber-300" />
              {goal.objetivo}
            </p>
            <p>
              <CircleDashed className="inline-block mr-2 text-amber-300" />
              Progresso Item: {goal.progressoItem}
            </p>
            <p>
              <CircleDashed className="inline-block mr-2 text-amber-300" />
              Progresso Atual: {goal.progressoAtual}
            </p>
            <p>
              <CircleDashed className="inline-block mr-2 text-amber-300" />
              Progresso Máximo: {goal.progressoMaximo}
            </p>

            <p>
              <ClipboardPen className="inline-block mr-2 text-amber-300" />
              Situação:{' '}
              {goal.situacaoMetaDiaria === 0 ? 'Em andamento' : 'Concluída'}
            </p>
            <div className="mt-4 space-x-2">
              {' '}
              {/* Adjusted spacing */}
              <Button onClick={() => onEdit(goal)} className="rounded-md">
                Editar
              </Button>
              {onDelete && (
                <Button
                  onClick={() => onDelete(goal.idMetaDiaria)}
                  className="bg-red-500 text-white rounded-md"
                >
                  Excluir
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default GoalList
