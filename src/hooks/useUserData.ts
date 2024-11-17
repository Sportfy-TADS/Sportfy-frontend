import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { jwtDecode } from 'jwt-decode'
import { toast } from 'sonner'

import { getUserData } from '@/http/goals'

export function useUserData() {
  const [idDoUsuarioLogado, setIdDoUsuarioLogado] = useState<number | null>(
    null,
  )
  const [idAcademico, setIdAcademico] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      console.error('Erro: Nenhum usuário logado encontrado no localStorage')
      toast.error('Usuário não está logado.')
      router.push('/auth')
      return
    }

    const loadUserData = async () => {
      try {
        const decodedToken: any = jwtDecode(token)
        console.log('Token decodificado:', decodedToken)

        const userId = decodedToken.idAcademico || decodedToken.idUsuario

        // Obter dados do usuário
        const userData = await getUserData(userId)
        console.log('Dados do usuário:', userData)

        setIdDoUsuarioLogado(userId)
        setIdAcademico(userData.idAcademico)
      } catch (error) {
        console.error('Erro ao obter dados do usuário:', error)
        toast.error('Erro ao obter dados do usuário. Faça login novamente.')
        router.push('/auth')
      }
    }

    loadUserData()
  }, [router])

  return { idDoUsuarioLogado, idAcademico }
}
