import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { 
  BicepsFlexed,
  CaseUpper,
  ChevronDown,
  CircleDashed,
  ClipboardPen,
  Clock4,
  EllipsisVertical,
  NotebookText,
  Pencil,
  Ruler,
  SquareCheckBig,
  SquarePen,
  Target,
  Trash2 }
  from 'lucide-react'

import GoalCard from './GoalCard'
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
  onEdit: (goal: any) => void
  onDelete?: (goalId: number) => void // Make onDelete optional
  userRole?: string // Receive user role
}

const GoalList = ({ goals, isLoading, onEdit, onDelete, userRole }: GoalListProps) => {
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
        <Card key={goal.idMetaDiaria} className="p-4 border border-amber-300 rounded-md shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">{goal.titulo}</CardTitle>
          </CardHeader>
          <CardContent>
            <p><Target className="inline-block mr-2 text-amber-300" />{goal.objetivo}</p>
            <p><CircleDashed className="inline-block mr-2 text-amber-300" />Progresso Item: {goal.progressoItem}</p>
            <p><CircleDashed className="inline-block mr-2 text-amber-300" />Progresso Atual: {goal.progressoAtual}</p>
            <p><CircleDashed className="inline-block mr-2 text-amber-300" />Progresso Máximo: {goal.progressoMaximo}</p>
            
            <p><ClipboardPen className="inline-block mr-2 text-amber-300" />Situação: {goal.situacaoMetaDiaria === 0 ? 'Em andamento' : 'Concluída'}</p>
            <div className="mt-4 space-x-2"> {/* Adjusted spacing */}
              <Button onClick={() => onEdit(goal)} className="rounded-md">
                Editar
              </Button>
              {userRole === 'ADMIN' && !goal.isSports && onDelete && (
                <Button onClick={() => onDelete(goal.idMetaDiaria)} className="bg-red-500 text-white rounded-md">
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
