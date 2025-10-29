import { jwtDecode } from 'jwt-decode'

interface TokenPayload {
  sub: string
  roles: string[]
  idUsuario: number
  idAcademico: number
  iss: string
  exp: number
}

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('jwt') || localStorage.getItem('token')
  }
  return null
}

export const getHttpOptions = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
  return { headers }
}

export const getUserIdFromToken = (): number | null => {
  const token = localStorage.getItem('token')
  if (!token) return null

  try {
    const decoded: TokenPayload = jwtDecode(token)
    return decoded.idUsuario
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}
