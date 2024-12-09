import { useState, useEffect } from 'react'

import { getGoals, createGoal, updateGoal, deleteGoal } from '@/http/goals'

interface Goal {
  idMetaDiaria: number
  titulo: string
  descricao: string
  quantidadeConcluida: number
  quantidadeObjetivo: number
  itemQuantificado: string
  situacaoMetaDiaria: string
  academico: {
    idAcademico: number
  }
}

interface GoalData {
  idMetaDiaria?: number
  titulo: string
  descricao: string
  progressoAtual?: number
  progressoMaximo: number
  progressoItem: string
  customProgressoItem?: string
  situacaoMetaDiaria?: number
}

export const useGoals = (idAcademico: number) => {
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const data = await getGoals(idAcademico)
        setGoals(data)
      } catch (error) {
        console.error('Error fetching goals:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGoals()
  }, [idAcademico])

  const handleCreateGoal = async (goalData: GoalData) => {
    try {
      if (!idAcademico) {
        throw new Error('ID do acadêmico não fornecido')
      }

      const payload = {
        titulo: goalData.titulo,
        descricao: goalData.descricao,
        progressoAtual: 0,
        progressoMaximo: goalData.progressoMaximo,
        progressoItem: goalData.progressoItem,
        idAcademico,
        situacaoMetaDiaria: goalData.situacaoMetaDiaria || 0,
      }

      console.log('Creating goal with payload:', payload)

      const response = await createGoal(payload)

      console.log('Goal created successfully:', response)

      setGoals((prev) => [...prev, response])

      return response
    } catch (error) {
      console.error('Error creating goal:', error)
      throw new Error((error as Error).message || 'Erro ao criar meta')
    }
  }

  const handleUpdateGoal = async (goalData: GoalData) => {
    try {
      const payload = {
        idMetaDiaria: goalData.idMetaDiaria!,
        titulo: goalData.titulo,
        descricao: goalData.descricao,
        progressoAtual: Number(goalData.progressoAtual),
        progressoMaximo: Number(goalData.progressoMaximo),
        progressoItem:
          goalData.progressoItem === 'outro'
            ? goalData.customProgressoItem
            : goalData.progressoItem,
        situacaoMetaDiaria: Number(goalData.situacaoMetaDiaria),
        idAcademico,
      }

      const response = await updateGoal(payload)
      setGoals((prev) =>
        prev.map((goal) =>
          goal.idMetaDiaria === goalData.idMetaDiaria ? response : goal,
        ),
      )
      return response
    } catch (error) {
      console.error('Error updating goal:', error)
      throw new Error((error as Error)?.message || 'Erro ao atualizar meta')
    }
  }

  const handleDeleteGoal = async (goalId: number) => {
    try {
      await deleteGoal(goalId)
      setGoals((prev) => prev.filter((goal) => goal.idMetaDiaria !== goalId))
    } catch (error) {
      console.error('Error deleting goal:', error)
      throw error
    }
  }

  return {
    goals,
    isLoading,
    handleCreateGoal,
    handleUpdateGoal,
    handleDeleteGoal,
  }
}
