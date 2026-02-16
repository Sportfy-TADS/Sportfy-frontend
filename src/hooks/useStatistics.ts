import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { fetchUsoAcademico } from '@/http/statistics'
import { UsoAcademico } from '@/interface/types'
import { getUserData, getUserIdFromToken } from '@/utils/auth'

interface UserData {
  idAcademico: number
  // ... outras propriedades de UserData ...
}

export function useStatistics() {
  const [userId, setUserId] = useState<number | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      const id = getUserIdFromToken()
      console.log('User ID from token:', id)
      if (id !== null) {
        setUserId(id)
        const data = await getUserData()
        console.log('User data from localStorage:', data)
        if (data) {
          setUserData(data as unknown as UserData)
        }
      } else {
        toast.error('Usuário não está logado.')
        localStorage.clear()
        router.push('/auth')
      }
    }
    loadUser()
  }, [router])

  const academicoId = userData?.idAcademico ?? userId ?? null

  const {
    data: usoAcademico,
    isLoading: isLoadingUsoAcademico,
    error: errorUsoAcademico,
  } = useQuery<UsoAcademico>({
    queryKey: ['usoAcademico', academicoId],
    queryFn: () => fetchUsoAcademico(academicoId!),
    enabled: academicoId !== null,
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
