import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Goal {
  idMetaDiaria: number
  titulo: string
  objetivo: string
  quantidadeConcluida: number
  progressoMaximo: number
  progressoItem: string
  situacaoMetaDiaria: number
}

interface GoalCardProps {
  goal: Goal
  onEdit: (goal: Goal) => void
  onDelete: (id: number) => void
}

export default function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  return (
    <Card key={goal.idMetaDiaria}>
      <CardHeader>
        <CardTitle>{goal.titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Objetivo: {goal.objetivo}</p>
        <p>
          Progresso: {goal.quantidadeConcluida}/{goal.progressoMaximo}{' '}
          {goal.progressoItem}
        </p>
        <p>
          Status: {goal.situacaoMetaDiaria === 1 ? 'Concluída' : 'Em andamento'}
        </p>
        <div className="flex space-x-2 mt-2">
          <Button
            onClick={() => onEdit(goal)}
            className="bg-white hover:bg-zinc-300"
          >
            Editar
          </Button>
          <Button
            onClick={() => onDelete(goal.idMetaDiaria)}
            className="bg-red-500 hover:bg-red-600"
          >
            Excluir
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
