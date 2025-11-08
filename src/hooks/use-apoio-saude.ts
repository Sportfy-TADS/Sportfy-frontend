import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'

import { apoioSaudeAPI } from '@/lib/api/apoio-saude.api'
import { ApiError } from '@/lib/utils/api-error-handler'
import { UpdateApoioSaudeDTO } from '@/types/apoio-saude'

const QUERY_KEY = ['apoiosSaude'] as const

export function useApoioSaude() {
  const queryClient = useQueryClient()
  const router = useRouter()

  const {
    data: apoiosSaude = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: apoioSaudeAPI.list,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        return false
      }
      return failureCount < 2
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })

  const createMutation = useMutation({
    mutationFn: apoioSaudeAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Apoio à saúde cadastrado com sucesso!')
    },
    onError: (error: ApiError) => {
      toast.error(error.message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateApoioSaudeDTO }) =>
      apoioSaudeAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Apoio à saúde atualizado com sucesso!')
    },
    onError: (error: ApiError) => {
      toast.error(error.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: apoioSaudeAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Apoio à saúde removido com sucesso!')
    },
    onError: (error: ApiError) => {
      toast.error(error.message)
    },
  })

  const deactivateMutation = useMutation({
    mutationFn: apoioSaudeAPI.deactivate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Apoio à saúde desativado com sucesso!')
    },
    onError: (error: ApiError) => {
      toast.error(error.message)
    },
  })

  // Handle auth errors
  useEffect(() => {
    if (isError && error instanceof ApiError && error.status === 401) {
      const timer = setTimeout(() => {
        router.push('/login')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isError, error, router])

  const handleRetry = useCallback(() => {
    refetch()
    toast.info('Tentando novamente...')
  }, [refetch])

  return {
    apoiosSaude,
    isLoading,
    isError,
    error: error as ApiError,
    refetch: handleRetry,
    mutations: {
      create: createMutation,
      update: updateMutation,
      delete: deleteMutation,
      deactivate: deactivateMutation,
    },
  }
}
