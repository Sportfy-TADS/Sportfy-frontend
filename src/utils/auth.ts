import {jwtDecode} from 'jwt-decode'

interface TokenPayload {
  sub: string
  roles: string
  idUsuario: number
  idAcademico: number
  iss: string
  exp: number
}

export const getUserIdFromToken = (): number | null => {
  const token = localStorage.getItem('jwt')
  console.log('Token from localStorage:', token) // Debugging line
  if (token) {
    try {
      const decodedToken: TokenPayload = jwtDecode(token)
      console.log('Decoded Token:', decodedToken) // Debugging line
      return decodedToken.idAcademico || null
    } catch (error) {
      console.error('Erro ao decodificar o token:', error)
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
  const userDataStr = localStorage.getItem('userData')
  console.log('User data from localStorage:', userDataStr) // Debugging line
  if (userDataStr) {
    return JSON.parse(userDataStr)
  }
  return null
}