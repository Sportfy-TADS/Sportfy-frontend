import axios, { AxiosResponse } from 'axios'
import { jwtDecode } from 'jwt-decode'

interface TokenPayload {
  sub: string
  roles: string
  idUsuario: number
  idAcademico: number
  iss: string
  exp: number
}

interface MatchData {
  // Defina as propriedades de acordo com a estrutura dos dados de uma partida
}

interface Match {
  // Defina as propriedades de acordo com a estrutura dos dados de uma partida
}

interface Inscription {
  // Defina as propriedades de acordo com a estrutura dos dados de uma inscrição
}

interface Sport {
  // Defina as propriedades de acordo com a estrutura dos dados de um esporte
}

const getToken = (): string | null => localStorage.getItem('jwt')

const getHttpOptions = () => {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }

  return { headers }
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

export const getMatches = async (idCampeonato: number): Promise<Match[]> => {
  const response: AxiosResponse<Match[]> = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/campeonatos/${idCampeonato}/partidas`,
    getHttpOptions(),
  )
  return response.data
}

export const createMatch = async (data: MatchData): Promise<Match> => {
  const response: AxiosResponse<Match> = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/matches`,
    data,
    getHttpOptions(),
  )
  return response.data
}

export const getInscriptions = async (
  userId: number,
): Promise<Inscription[]> => {
  const response: AxiosResponse<Inscription[]> = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/inscricoes?userId=${userId}`,
    getHttpOptions(),
  )
  return response.data
}

export const getSports = async (): Promise<Sport[]> => {
  const response: AxiosResponse<Sport[]> = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/sports`,
    getHttpOptions(),
  )
  return response.data
}
