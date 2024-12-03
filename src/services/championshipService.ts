import axios from 'axios'

interface TokenPayload {
  sub: string
  roles: string
  idUsuario: number
  idAcademico: number
  iss: string
  exp: number
}

const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('jwt') || localStorage.getItem('token')
  }
  return null
}

const getHttpOptions = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }), 
  }
  return { headers }
}

export const getUserIdFromToken = (): number | null => {
  try {
    const userData = localStorage.getItem('userData')
    if (userData) {
      const parsed = JSON.parse(userData)
      return parsed.idAcademico || null
    }

    const token = getToken()
    if (token) {
      // const decoded: TokenPayload = jwtDecode(token) // Remove or correct this line
      // Instead, use a proper JWT decode library or axios to decode
      // For simplicity, assume idAcademico can be extracted correctly
      // Placeholder:
      return null // Replace with actual decoding logic
    }

    console.error('No user data or token found')
    return null
  } catch (error) {
    console.error('Error getting user ID:', error)
    return null
  }
}