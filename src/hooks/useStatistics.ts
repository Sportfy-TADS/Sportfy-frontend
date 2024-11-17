import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { useQuery } from '@tanstack/react-query'
import { jwtDecode } from 'jwt-decode'
import { toast } from 'sonner'

import { fetchUsoAcademico, fetchUserData } from '@/http/statistics'

export function useStatistics() {
  const [userId, setUserId] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    console.log('Token encontrado:', token)
    if (token) {
      try {
        const decodedToken: { idUsuario: number } = jwtDecode(token)
        console.log('Token decodificado:', decodedToken)
        setUserId(decodedToken.idUsuario)
      } catch (error) {
        console.error('Erro ao decodificar o token:', error)
        toast.error('Erro ao decodificar o token.')
      }
    } else {
      toast.error('Usuário não está logado.')
      router.push('/auth')
    }
  }, [router])

  const {
    data: userData,
    isLoading: isLoadingUserData,
    error: errorUserData,
  } = useQuery({
    queryKey: ['userData', userId],
    queryFn: () => fetchUserData(userId!),
    enabled: !!userId,
    onError: (error: any) => {
      console.error('Erro ao buscar dados do usuário:', error)
      toast.error('Erro ao buscar dados do usuário.')
    },
  })

  const academicoId = userData?.idAcademico

  const {
    data: usoAcademico,
    isLoading: isLoadingUsoAcademico,
    error: errorUsoAcademico,
  } = useQuery({
    queryKey: ['usoAcademico', academicoId],
    queryFn: () => fetchUsoAcademico(academicoId!),
    enabled: !!academicoId,
    onError: (error: any) => {
      console.error('Erro ao buscar uso acadêmico:', error)
      toast.error('Erro ao buscar uso acadêmico.')
    },
  })

  return {
    userId,
    userData,
    isLoadingUserData,
    errorUserData,
    academicoId,
    usoAcademico,
    isLoadingUsoAcademico,
    errorUsoAcademico,
  }
}
