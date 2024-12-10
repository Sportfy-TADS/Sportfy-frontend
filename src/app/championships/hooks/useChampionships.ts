import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios' // Adicionado
import { toast } from 'sonner'

import {
  getChampionships,
  createChampionship,
  updateChampionship,
  deleteChampionship,
} from '@/http/championship'

export const useChampionships = () => {
  const queryClient = useQueryClient()

  const { data: campeonatos = [], isLoading } = useQuery({
    queryKey: ['campeonatos'],
    queryFn: getChampionships,
  })

  const createMutation = useMutation({
    mutationFn: createChampionship,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campeonatos'] })
      toast.success('Campeonato criado com sucesso!')
    },
    onError: (error: AxiosError) => {
      // Alterado
      console.error('Erro ao criar campeonato:', error)
      if (error.response) {
        console.error('Response data:', error.response.data)
        console.error('Response status:', error.response.status)
        console.error('Response headers:', error.response.headers)
      } else if (error.request) {
        console.error('No response received:', error.request)
      } else {
        console.error('Error setting up request:', error.message)
      }
      toast.error('Erro ao criar campeonato.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: Campeonato) =>
      updateChampionship(data.idCampeonato, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campeonatos'] })
      toast.success('Campeonato atualizado com sucesso!')
    },
    onError: (error: AxiosError) => {
      // Alterado
      console.error('Erro ao atualizar campeonato:', error)
      if (error.response) {
        console.error('Response data:', error.response.data)
        console.error('Response status:', error.response.status)
        console.error('Response headers:', error.response.headers)
      } else if (error.request) {
        console.error('No response received:', error.request)
      } else {
        console.error('Error setting up request:', error.message)
      }
      toast.error('Erro ao atualizar campeonato.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteChampionship(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campeonatos'] })
      toast.success('Campeonato excluído com sucesso!')
    },
    onError: (error: AxiosError) => {
      // Alterado
      console.error('Erro ao excluir campeonato:', error)
      if (error.response) {
        console.error('Response data:', error.response.data)
        console.error('Response status:', error.response.status)
        console.error('Response headers:', error.response.headers)
      } else if (error.request) {
        console.error('No response received:', error.request)
      } else {
        console.error('Error setting up request:', error.message)
      }
      toast.error('Erro ao excluir campeonato.')
    },
  })

  return {
    campeonatos,
    isLoading,
    createMutation,
    updateMutation,
    deleteMutation,
  }
}
