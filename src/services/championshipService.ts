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
  // Check if we're on the client side
  if (typeof window !== 'undefined') {
    return localStorage.getItem('jwt')
  } else {
    // Return null or handle server-side token retrieval
    return null
  }
}

// Modify getHttpOptions to accept a token parameter
const getHttpOptions = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    // Include Authorization header if token is provided
    ...(token && { Authorization: `Bearer ${token}` }),
  }

  return {
    headers,
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

export const getChampionships = async (page: number, size: number, token?: string) => {
  console.log(`Fetching championships: page=${page}, size=${size}`) // Added log
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/campeonatos/listar?page=${page}&size=${size}&sort=dataCriacao,desc`,
    getHttpOptions(token),
  )
  console.log('API response:', response.data) // Added log
  return response.data.content
}

export const createChampionship = async (data: any, token?: string) => {
  console.log('Creating championship with data:', data) // Added log
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/campeonatos`,
    data,
    getHttpOptions(token),
  )
  console.log('API response:', response.data) // Added log
  return response.data
}

export const updateChampionship = async (id: number, data: any, token?: string) => {
  console.log(`Updating championship with ID: ${id}, data:`, data) // Added log
  const response = await axios.put(
    `${process.env.NEXT_PUBLIC_API_URL}/campeonatos/${id}`,
    data,
    getHttpOptions(token),
  )
  console.log('API response:', response.data) // Added log
  return response.data
}

export const deleteChampionship = async (id: number, token?: string) => {
  console.log(`Deleting championship with ID: ${id}`) // Added log
  const response = await axios.delete(
    `${process.env.NEXT_PUBLIC_API_URL}/campeonatos/${id}`,
    getHttpOptions(token),
  )
  console.log('API response:', response.data) // Added log
  return response.data
}

// Modify getChampionshipById to accept a token parameter
export const getChampionshipById = async (id: string, token?: string) => {
  console.log(`Fetching championship with ID: ${id}`) // Added log
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/campeonatos/${id}`,
      getHttpOptions(token),
    )
    console.log('API response:', response.data) // Added log
    return response.data
  } catch (error) {
    console.error(`Error fetching championship with ID ${id}:`, error) // Added log
    throw error // Re-throw the error after logging
  }
}