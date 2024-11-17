import { Skeleton } from '@/components/ui/skeleton'

import GoalCard from './GoalCard'

export default function GoalList({ goals, isLoading, onEdit, onDelete }: any) {
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
        <GoalCard
          key={goal.idMetaDiaria}
          goal={goal}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
