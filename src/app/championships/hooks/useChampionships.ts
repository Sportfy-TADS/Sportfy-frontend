import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toast } from 'sonner'

import {
    createChampionship,
    deleteChampionship,
    getChampionships,
    updateChampionship,
} from '@/http/championship'
import { Campeonato } from '@/interface/types'

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
      // Reset do formulário será feito pelo componente pai
    },
    onError: (error: AxiosError) =>
      handleError(error, 'Erro ao criar campeonato.'),
  })

  const updateMutation = useMutation({
    mutationFn: (data: Campeonato) => {
      return updateChampionship(data.idCampeonato, data)
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
