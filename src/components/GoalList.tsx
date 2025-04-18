// components/GoalList.tsx
import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getGoals } from '@/http/get-goals'

interface Goal {
  id: string
  title: string
  frequency: number
  status: 'completed' | 'in_progress'
}

export function GoalList() {
  const [filter, setFilter] = useState('all')
  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: getGoals,
  })

  if (isLoading) return <p>Carregando...</p>

  const filteredGoals = goals.filter((goal: Goal) => {
    if (filter === 'all') return true
    return goal.status === filter
  })

  return (
    <>
      <div className="flex justify-between mb-4">
        <Select onValueChange={setFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="completed">Concluídas</SelectItem>
            <SelectItem value="in_progress">Em andamento</SelectItem>
          </SelectContent>
        </Select>
        <Button>Adicionar Meta</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredGoals.length ? (
          filteredGoals.map((goal: Goal) => (
            <Card key={goal.id}>
              <CardHeader>
                <CardTitle>{goal.title}</CardTitle>
              </CardHeader>
              <CardContent>
                Frequência: {goal.frequency}x por semana
                <p>
                  Status:{' '}
                  {goal.status === 'completed' ? 'Concluída' : 'Em andamento'}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <p>Nenhuma meta encontrada</p>
        )}
      </div>
    </>
  )
}
