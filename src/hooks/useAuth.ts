import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { getUserData } from '@/utils/auth'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      const authData = await getUserData()
      console.log('Token:', token) // Log para depuração
      console.log('Auth Data:', authData) // Log para depuração

      if (!token || !authData?.idAcademico) {
        router.push('/auth')
        return false
      }

      setUserId(String(authData.idAcademico))
      return true
    }

    const authenticate = async () => {
      const auth = await checkAuth()
      setIsAuthenticated(auth)
      setIsLoading(false)
    }

    authenticate()
  }, [router])

  return { isAuthenticated, isLoading, userId }
}
