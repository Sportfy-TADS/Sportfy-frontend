import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toast } from 'sonner'

import {
  getChampionships,
  createChampionship,
  updateChampionship,
  deleteChampionship,
} from '@/http/championship'
import { ChampionshipData } from '@/interface/types' // Adicionado ChampionshipData

export const useChampionships = () => {
  const queryClient = useQueryClient()

  const { data: campeonatos = [], isLoading } = useQuery({
    queryKey: ['campeonatos'],
    queryFn: getChampionships,
  })

  const handleError = (error: AxiosError, message: string) => {
    console.error(message, error)
    if (error.response) {
      console.error('Response data:', error.response.data)
      console.error('Response status:', error.response.status)
      console.error('Response headers:', error.response.headers)
    } else if (error.request) {
      console.error('No response received:', error.request)
    } else {
      console.error('Error setting up request:', error.message)
    }
    toast.error(message)
  }

  const createMutation = useMutation({
    mutationFn: createChampionship,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campeonatos'] })
      toast.success('Campeonato criado com sucesso!')
    },
    onError: (error: AxiosError) =>
      handleError(error, 'Erro ao criar campeonato.'),
  })

  const updateMutation = useMutation({
    mutationFn: (data: ChampionshipData) => {
      const updatedData = { ...data, date: data.date.toISOString() }
      return updateChampionship(updatedData.idCampeonato, updatedData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campeonatos'] })
      toast.success('Campeonato atualizado com sucesso!')
    },
    onError: (error: AxiosError) =>
      handleError(error, 'Erro ao atualizar campeonato.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteChampionship(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campeonatos'] })
      toast.success('Campeonato excluído com sucesso!')
    },
    onError: (error: AxiosError) =>
      handleError(error, 'Erro ao excluir campeonato.'),
  })

  return {
    campeonatos,
    isLoading,
    createMutation,
    updateMutation,
    deleteMutation,
  }
}
