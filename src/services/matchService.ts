import axios from 'axios'
import {jwtDecode} from 'jwt-decode'

interface TokenPayload {
  sub: string
  roles: string
  idUsuario: number
  idAcademico: number
  iss: string
  exp: number
}

const getToken = (): string | null => {
  return localStorage.getItem('jwt')
}

const getHttpOptions = () => {
  const token = getToken()
  const headers = token
    ? {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }
    : {
        'Content-Type': 'application/json',
      }

  return {
    headers: headers,
  }
}

export const getUserIdFromToken = (): number | null => {
  const token = getToken()
  if (token) {
    try {
      const decodedToken: TokenPayload = jwtDecode(token)
      return decodedToken.idAcademico || null
    } catch (error) {
      console.error('Erro ao decodificar o token:', error)
      return null
    }
  }
  return null
}

export const getMatches = async (idCampeonato: number) => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/campeonatos/${idCampeonato}/partidas`,
    getHttpOptions(),
  )
  return response.data
}

export const createMatch = async (data: any) => {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/matches`,
    data,
    getHttpOptions(),
  )
  return response.data
}

export const getInscriptions = async (userId: number) => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/inscricoes?userId=${userId}`,
    getHttpOptions(),
  )
  return response.data
}

export const getSports = async () => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/sports`,
    getHttpOptions(),
  )
  return response.data
}