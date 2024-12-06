import { useState, useEffect } from 'react'
import { getGoals, createGoal, updateGoal, deleteGoal } from '@/http/goals'

export const useGoals = (idAcademico: number) => {
  // Make idAcademico required
  interface Goal {
    idMetaDiaria: number
    titulo: string
    descricao: string // Changed from objetivo to descricao
    quantidadeConcluida: number
    quantidadeObjetivo: number
    itemQuantificado: string
    situacaoMetaDiaria: string
    academico: {
      idAcademico: number
    }
  }

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

  const handleCreateGoal = async (goalData: any) => {
    try {
      if (!idAcademico) {
        throw new Error('ID do acadêmico não fornecido')
      }

      // Format the data according to the backend's expected structure
      const payload = {
        titulo: goalData.titulo,
        descricao: goalData.descricao, // Use 'descricao' instead of 'objetivo'
        progressoAtual: 0, // Set to zero by default
        progressoMaximo: goalData.progressoMaximo,
        progressoItem: goalData.progressoItem,
        idAcademico,
        situacaoMetaDiaria: goalData.situacaoMetaDiaria || 0,
      }

      console.log('Creating goal with payload:', payload)

      const response = await createGoal(payload)

      console.log('Goal created successfully:', response)

      // Add the new goal to the goals list
      setGoals((prev) => [...prev, response])

      return response
    } catch (error: any) {
      console.error('Error creating goal:', error)
      throw new Error(error.message || 'Erro ao criar meta')
    }
  }

  // Ensure handleUpdateGoal is exported for daily goals
  const handleUpdateGoal = async (goalData: any) => {
    try {
      // Ensure all required fields are present and properly formatted
      const payload = {
        idMetaDiaria: goalData.idMetaDiaria,
        titulo: goalData.titulo,
        descricao: goalData.descricao, // Changed from objetivo to descricao
        progressoAtual: Number(goalData.progressoAtual), // Ensure it's a number
        progressoMaximo: Number(goalData.progressoMaximo),
        progressoItem:
          goalData.progressoItem === 'outro'
            ? goalData.customProgressoItem
            : goalData.progressoItem,
        situacaoMetaDiaria: Number(goalData.situacaoMetaDiaria),
        idAcademico, // Ensure idAcademico is included
      }

      const response = await updateGoal(payload)
      setGoals((prev) =>
        prev.map((goal) =>
          goal.idMetaDiaria === goalData.idMetaDiaria ? response : goal,
        ),
      )
      return response
    } catch (error: any) {
      console.error('Error updating goal:', error)
      throw new Error(
        error?.response?.data?.message ||
          error.message ||
          'Erro ao atualizar meta',
      )
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
    handleUpdateGoal, // Export the update handler for daily goals
    handleDeleteGoal,
  }
}
