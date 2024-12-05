import { useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'

interface DecodedToken {
  sub: string
  roles: string
  idUsuario: number
}

interface UserData {
  username: string
  idAcademico: number // Make idAcademico required
  nome?: string
  // ...other user data fields
}

export const useUserData = () => {
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    const loadUserData = async () => {
      const token = localStorage.getItem('token')
      if (!token) return null

      try {
        const decoded: DecodedToken = jwtDecode(token)
        const username = decoded.sub

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/academico/buscar/${username}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        )

        setUserData({
          username: response.data.username,
          idAcademico: response.data.idAcademico, // Ensure idAcademico is set
          nome: response.data.nome,
          // ...other fields
        })
      } catch (error) {
        console.error('Erro ao obter dados do usuário:', error)
      }
    }

    loadUserData()
  }, [])

  return userData
}
