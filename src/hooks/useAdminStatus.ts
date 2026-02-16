import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { jwtDecode, JwtPayload } from 'jwt-decode'
import { toast } from 'sonner'

interface DecodedToken extends JwtPayload {
  role: string
  idUsuario: number
  name: string
  email: string
  username: string
}

interface AdminInfo {
  id: number
  name: string
  email: string
  username: string
}

export default function useAdminStatus() {
  const [currentAdmin, setCurrentAdmin] = useState<AdminInfo | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAdminStatus = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth')
        return
      }
      const decoded = jwtDecode<DecodedToken>(token)
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
