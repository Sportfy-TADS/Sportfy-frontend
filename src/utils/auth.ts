import { jwtDecode } from 'jwt-decode' // Corrected import statement
import axios from 'axios' // Added import for axios

interface TokenPayload {
  sub: string
  roles: string
  idUsuario?: number
  iss: string
  exp: number
}

export const getUserIdFromToken = (): number | null => {
  const token = localStorage.getItem('token')
  console.log('Token from localStorage:', token)
  if (token) {
    try {
      const decodedToken: TokenPayload = jwtDecode(token)
      console.log('Decoded Token:', decodedToken)
      return decodedToken.idUsuario ?? null
    } catch (error) {
      console.error('Error decoding token:', error)
      return null
    }
  }
  return null
}

export const storeUserData = (userData: any) => {
  console.log('Storing user data:', userData) // Debugging line
  localStorage.setItem('userData', JSON.stringify(userData))
}

export const getDecodedToken = (): TokenPayload | null => {
  const token = localStorage.getItem('token')
  if (token) {
    try {
      const decodedToken: TokenPayload = jwtDecode(token)
      return decodedToken
    } catch (error) {
      console.error('Error decoding token:', error)
      return null
    }
  }
  return null
}

export const getUserData = async () => {
  const decodedToken = getDecodedToken()
  if (!decodedToken?.sub) {
    console.error('Erro: Token inválido ou username não encontrado')
    return null
  }

  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Token não encontrado')
    }

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/academico/buscar/${decodedToken.sub}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    )

    if (response.status !== 200) {
      throw new Error('Erro ao obter dados do usuário')
    }

    return response.data
  } catch (error) {
    console.error('Erro ao obter dados do usuário:', error)
    return null
  }
}
