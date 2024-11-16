import { useState } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import {
  getCampeonatos,
  createCampeonato,
  updateCampeonato,
  deleteCampeonato,
} from '@/http/championships'
import { Campeonato } from '@/interface/types'

export function useCampeonatos() {
  const queryClient = useQueryClient()
  const [selectedCampeonato, setSelectedCampeonato] =
    useState<Campeonato | null>(null)

  const { register, handleSubmit, reset } = useForm<Partial<Campeonato>>({
    defaultValues: selectedCampeonato || {},
  })

  const { data: campeonatos = [], isLoading } = useQuery({
    queryKey: ['campeonatos'],
    queryFn: getCampeonatos,
  })

  const createMutation = useMutation({
    mutationFn: createCampeonato,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campeonatos'] })
      toast.success('Campeonato criado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao criar campeonato')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({
      idCampeonato,
      data,
    }: {
      idCampeonato: number
      data: Partial<Campeonato>
    }) => updateCampeonato(idCampeonato, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campeonatos'] })
      toast.success('Campeonato atualizado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao atualizar campeonato')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCampeonato,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campeonatos'] })
      toast.success('Campeonato excluído com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao excluir campeonato')
    },
  })

  const handleCreateCampeonato = (data: Partial<Campeonato>) => {
    createMutation.mutate(data)
    reset()
  }

  const handleUpdateCampeonato = (data: Partial<Campeonato>) => {
    if (selectedCampeonato) {
      updateMutation.mutate({
        idCampeonato: selectedCampeonato.idCampeonato,
        data,
      })
      reset()
      setSelectedCampeonato(null)
    }
  }

  const handleDeleteCampeonato = (idCampeonato: number) => {
    deleteMutation.mutate(idCampeonato)
  }

  return {
    campeonatos,
    isLoading,
    selectedCampeonato,
    setSelectedCampeonato,
    register,
    handleSubmit,
    reset,
    handleCreateCampeonato,
    handleUpdateCampeonato,
    handleDeleteCampeonato,
  }
}
