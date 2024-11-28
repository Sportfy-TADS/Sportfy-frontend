import { useState, useEffect } from 'react'
import { getGoals, createGoal, updateGoal, deleteGoal } from '@/http/goals'

export const useGoals = (idAcademico: number | undefined) => {
  const [goals, setGoals] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchGoals = async () => {
      if (!idAcademico) return
      try {
        const data = await getGoals(idAcademico)
        setGoals(data)
      } catch (error) {
        console.error('Error fetching goals:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (idAcademico) {
      fetchGoals()
    }
  }, [idAcademico])

  const handleCreateGoal = async (goalData: any) => {
    try {
      if (!idAcademico) {
        throw new Error('ID do acadêmico não fornecido')
      }

      if (!goalData.titulo?.trim()) {
        throw new Error('Título é obrigatório')
      }

      if (!goalData.objetivo?.trim()) {
        throw new Error('Objetivo é obrigatório')
      }

      if (!goalData.progressoMaximo || goalData.progressoMaximo <= 0) {
        throw new Error('Quantidade objetivo deve ser maior que zero')
      }

      const response = await createGoal({
        ...goalData,
        idAcademico,
        progressoItem: goalData.progressoItem || 'unidade'
      })
      
      setGoals(prev => [...prev, response])
      return response
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao criar meta'
      console.error('Error in handleCreateGoal:', error)
      throw new Error(errorMessage)
    }
  }

  const handleUpdateGoal = async (goalData: any) => {
    try {
      const response = await updateGoal({ ...goalData, idAcademico })
      setGoals(prev => prev.map(goal => goal.idMetaDiaria === goalData.idMetaDiaria ? response : goal))
    } catch (error) {
      console.error('Error updating goal:', error)
      throw error
    }
  }

  const handleDeleteGoal = async (goalId: number) => {
    try {
      await deleteGoal(goalId)
      setGoals(prev => prev.filter(goal => goal.idMetaDiaria !== goalId))
    } catch (error) {
      console.error('Error deleting goal:', error)
      throw error
    }
  }

  return { goals, isLoading, handleCreateGoal, handleUpdateGoal, handleDeleteGoal }
}
