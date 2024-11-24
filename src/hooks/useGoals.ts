import { useState, useEffect } from 'react'
import { getGoals, createGoal, updateGoal, deleteGoal } from '@/http/goals'

export const useGoals = () => {
  const [goals, setGoals] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const idAcademico = Number(localStorage.getItem('idAcademico'))

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
      const response = await createGoal({ ...goalData, idAcademico })
      setGoals(prev => [...prev, response])
    } catch (error) {
      console.error('Error creating goal:', error)
      throw error
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
