import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

interface TokenPayload {
  sub: string
  roles: string
  idUsuario?: number
  iss: string
  exp: number
}

const getToken = (): string | null => localStorage.getItem('token')

const decodeToken = (token: string): TokenPayload | null => {
  try {
    return jwtDecode<TokenPayload>(token)
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

export const getUserIdFromToken = (): number | null => {
  const token = getToken()
  if (!token) return null

  const decodedToken = decodeToken(token)
  return decodedToken?.idUsuario ?? null
}

export const storeUserData = (userData: Record<string, unknown>): void => {
  console.log('Storing user data:', userData)
  localStorage.setItem('userData', JSON.stringify(userData))
}

export const getDecodedToken = (): TokenPayload | null => {
  const token = getToken()
  return token ? decodeToken(token) : null
}

export const getUserData = async (): Promise<Record<
  string,
  unknown
> | null> => {
  const decodedToken = getDecodedToken()
  if (!decodedToken?.sub) {
    console.error('Erro: Token inválido ou username não encontrado')
    return null
  }

  try {
    const token = getToken()
    if (!token) throw new Error('Token não encontrado')

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/academico/buscar/${decodedToken.sub}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    )

    if (response.status !== 200)
      throw new Error('Erro ao obter dados do usuário')

    return response.data
  } catch (error) {
    console.error('Erro ao obter dados do usuário:', error)
    return null
  }
}
