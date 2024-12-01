import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { fetchUsoAcademico } from '@/http/statistics'
import { getUserIdFromToken, getUserData } from '@/utils/auth'

export function useStatistics() {
  const [userId, setUserId] = useState<number | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const id = getUserIdFromToken()
    console.log('User ID from token:', id)
    if (id !== null) {
      setUserId(id)
      const data = getUserData()
      console.log('User data from localStorage:', data)
      setUserData(data)
    } else {
      toast.error('Usuário não está logado.')
      localStorage.clear() // Limpar localStorage se o usuário não estiver logado
      router.push('/auth')
    }
  }, [router])

  const academicoId = userData?.idAcademico ?? userId ?? null

  const {
    data: usoAcademico,
    isLoading: isLoadingUsoAcademico,
    error: errorUsoAcademico,
  } = useQuery({
    queryKey: ['usoAcademico', academicoId],
    queryFn: () => fetchUsoAcademico(academicoId!),
    enabled: academicoId !== null,
    onError: (error: any) => {
      console.error('Erro ao buscar uso acadêmico:', error)
      toast.error('Erro ao buscar uso acadêmico.')
    },
  })

  return {
    userId,
    userData,
    academicoId,
    usoAcademico,
    isLoadingUsoAcademico,
    errorUsoAcademico,
  }
}
