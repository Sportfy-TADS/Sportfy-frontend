import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { getGoals, createGoal, deleteGoal, updateGoal } from '@/http/goals'

export function useGoals(idAcademico: number | null) {
  const queryClient = useQueryClient()

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals', idAcademico],
    queryFn: () => getGoals(idAcademico as number),
    enabled: idAcademico !== null,
  })

  const handleCreateGoal = async (data: any) => {
    try {
      await createGoal(data)
      queryClient.invalidateQueries({ queryKey: ['goals', idAcademico] })
      toast.success('Meta criada com sucesso!')
    } catch (error) {
      console.error('Erro ao criar a meta:', error)
      toast.error('Erro ao criar a meta')
    }
  }

  const handleDeleteGoal = async (idMetaDiaria: number) => {
    try {
      await deleteGoal(idMetaDiaria)
      queryClient.invalidateQueries({ queryKey: ['goals', idAcademico] })
      toast.success('Meta excluída com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir a meta:', error)
      toast.error('Erro ao excluir a meta')
    }
  }

  const handleUpdateGoal = async (data: any) => {
    try {
      await updateGoal(data)
      queryClient.invalidateQueries({ queryKey: ['goals', idAcademico] })
      toast.success('Meta atualizada com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar a meta:', error)
      toast.error('Erro ao atualizar a meta')
    }
  }

  return {
    goals,
    isLoading,
    handleCreateGoal,
    handleDeleteGoal,
    handleUpdateGoal,
  }
}
