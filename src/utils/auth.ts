import {jwtDecode} from 'jwt-decode' // Changed from named import to default import

interface TokenPayload {
  sub: string
  roles: string
  idUsuario?: number
  idAcademico?: number
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
      // Use idAcademico as idUsuario if idUsuario is not present
      return decodedToken.idAcademico ?? decodedToken.idUsuario ?? null
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

export const getUserData = (): any => {
  const data = localStorage.getItem('userData')
  if (data) {
    try {
      return JSON.parse(data)
    } catch (error) {
      console.error('Error parsing user data:', error)
      return null
    }
  }
  return null
}