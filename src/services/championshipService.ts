import axios from 'axios'
import {jwtDecode} from 'jwt-decode' // Corrected import

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

export const getChampionships = async (page: number, size: number) => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/campeonatos/listar?page=${page}&size=${size}&sort=dataCriacao,desc`,
    getHttpOptions(),
  )
  return response.data.content
}

export const createChampionship = async (data: any) => {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/campeonatos`,
    data,
    getHttpOptions(),
  )
  return response.data
}

export const updateChampionship = async (id: number, data: any) => {
  const response = await axios.put(
    `${process.env.NEXT_PUBLIC_API_URL}/campeonatos/${id}`,
    data,
    getHttpOptions(),
  )
  return response.data
}

export const deleteChampionship = async (id: number) => {
  const response = await axios.delete(
    `${process.env.NEXT_PUBLIC_API_URL}/campeonatos/${id}`,
    getHttpOptions(),
  )
  return response.data
}