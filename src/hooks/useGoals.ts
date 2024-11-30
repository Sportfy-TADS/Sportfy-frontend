import { useState, useEffect } from 'react'
import { getGoals, createGoal, updateGoal, deleteGoal } from '@/http/goals'

export const useGoals = (idAcademico: number | undefined) => {
  interface Goal {
    idMetaDiaria: number;
    titulo: string;
    objetivo: string;
    quantidadeConcluida: number;
    quantidadeObjetivo: number;
    itemQuantificado: string;
    situacaoMetaDiaria: string;
    academico: {
      idAcademico: number;
    };
  }

  const [goals, setGoals] = useState<Goal[]>([])
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

      // Format the data according to the backend's expected structure
      const payload = {
        titulo: goalData.titulo,
        objetivo: goalData.objetivo,
        progressoAtual: goalData.progressoAtual,
        progressoMaximo: goalData.progressoMaximo,
        progressoItem: goalData.progressoItem,
        idAcademico,
        situacaoMetaDiaria: goalData.situacaoMetaDiaria
      }

      const response = await createGoal(payload)
      setGoals(prev => prev.map((goal: Goal) => goal.idMetaDiaria === goalData.idMetaDiaria ? response : goal))
      
      setGoals(prev => [...prev, response])
      return response
    } catch (error: any) {
      console.error('Error creating goal:', error)
      throw new Error(error?.response?.data?.message || error.message || 'Erro ao criar meta')
    }
  }

  const handleUpdateGoal = async (goalData: any) => {
    try {
      // Ensure all required fields are present and properly formatted
      const payload = {
        idMetaDiaria: goalData.idMetaDiaria,
        titulo: goalData.titulo,
        objetivo: goalData.objetivo,
        quantidadeConcluida: Number(goalData.progressoAtual),
        quantidadeObjetivo: Number(goalData.progressoMaximo),
        itemQuantificado: goalData.progressoItem === 'outro' ? 
          goalData.customProgressoItem : goalData.progressoItem,
        situacaoMetaDiaria: Number(goalData.situacaoMetaDiaria),
        academico: {
          idAcademico
        }
      }

      const response = await updateGoal(payload)
      setGoals(prev => prev.map(goal => 
        goal.idMetaDiaria === goalData.idMetaDiaria ? response : goal
      ))
      return response
    } catch (error: any) {
      console.error('Error updating goal:', error)
      throw new Error(error?.response?.data?.message || error.message || 'Erro ao atualizar meta')
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
