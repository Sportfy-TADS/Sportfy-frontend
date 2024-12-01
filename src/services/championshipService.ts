import axios from 'axios'
// import { jwtDecode } from 'jwt-decode' // Remove incorrect import

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
    const token = getToken()
    if (!token) return null
    const payload: TokenPayload = JSON.parse(atob(token.split('.')[1]))
    return payload.idUsuario
  } catch (error) {
    console.error('Erro ao decodificar token:', error)
    return null
  }
}

export const getChampionships = async () => {
  const token = getToken()
  const response = await fetch(
    `/api/campeonatos/listar?sort=dataCriacao,desc`,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }
  )
  if (!response.ok) {
    throw new Error('Erro ao buscar campeonatos.')
  }
  const data = await response.json()
  return data.content
}

export const createChampionship = async (data: any) => {
  try {
    const token = getToken()
    const response = await fetch(`/api/campeonatos`, {
      method: 'POST',
      headers: getHttpOptions(token),
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Erro ao criar campeonato.')
    }
    return await response.json()
  } catch (error) {
    console.error('Erro na criação do campeonato:', error)
    throw error
  }
}

export const updateChampionship = async (id: number, data: any) => {
  const token = getToken()
  const response = await fetch(`/api/campeonatos/${id}`, {
    method: 'PUT',
    headers: getHttpOptions(token),
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Erro ao atualizar campeonato.')
  }
  return await response.json()
}

export const deleteChampionship = async (id: number) => {
  const token = getToken()
  const response = await fetch(`/api/campeonatos/${id}`, {
    method: 'DELETE',
    headers: getHttpOptions(token),
  })
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Erro ao excluir campeonato.')
  }
  return true
}

// Modify getChampionshipById to accept a token parameter
export const getChampionshipById = async (id: string, token?: string) => {
  const response = await fetch(`/api/campeonatos/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Erro ao buscar campeonato.')
  }
  const data = await response.json()
  return data
}

// Add the service function to fetch times by championship ID
export const getTimesByChampionshipId = async (id: string): Promise<Time[]> => {
  const token = getToken()
  const response = await fetch(`/api/championships/${id}/times`, {
    headers: {
      // Include authorization headers if required
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to fetch times.')
  }

  const data = await response.json()
  return data
}