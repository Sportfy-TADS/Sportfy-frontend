import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { jwtDecode } from 'jwt-decode'
import { toast } from 'sonner'

export default function useAdminStatus() {
  const [currentAdmin, setCurrentAdmin] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const checkAdminStatus = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth')
        return
      }
      const decoded = jwtDecode(token)
      if (decoded.role !== 'ADMINISTRADOR') {
        toast.error(
          'Acesso negado! Somente administradores podem acessar esta página.',
        )
        router.push('/')
        return
      }
      setCurrentAdmin({
        id: decoded.idUsuario,
        name: decoded.name,
        email: decoded.email,
        username: decoded.username,
      })
    }
    checkAdminStatus()
  }, [router])

  return currentAdmin
}
