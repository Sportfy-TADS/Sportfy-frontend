import axios from 'axios'

import { Campeonato } from '@/interface/types'
import {
    getHttpOptions,
    getToken,
    getUserIdFromToken,
} from '@/services/championshipService'

export const getChampionships = async () => {
  const token = getToken()
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/campeonatos/listar?sort=dataCriacao,desc`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )
  if (!response.ok) throw new Error('Erro ao buscar campeonatos')
  const data = await response.json()
  return data.content
}

export const createChampionship = async (data: Campeonato) => {
  try {
    const token = getToken()
    const idAcademico = getUserIdFromToken()

    console.log('=== DEBUG CREATE CHAMPIONSHIP ===')
    console.log('1. Token exists:', !!token)
    console.log('2. User ID:', idAcademico)
    console.log('3. API URL:', process.env.NEXT_PUBLIC_API_URL)
    console.log('4. Input data:', JSON.stringify(data, null, 2))

    if (!token) {
      throw new Error('Usuário não autenticado')
    }

    if (!idAcademico) {
      throw new Error('ID do acadêmico não encontrado')
    }

    const payload = {
      ...data,
      idAcademico,
    }

    console.log('5. Final payload:', JSON.stringify(payload, null, 2))

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/campeonatos`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    )

    console.log('6. Response status:', response.status)
    console.log('7. Response data:', response.data)

    if (response.status !== 201 && response.status !== 200) {
      throw new Error('Erro ao criar campeonato')
    }

    return response.data || payload
  } catch (error) {
    console.error('=== ERROR CREATING CHAMPIONSHIP ===')
    if (axios.isAxiosError(error)) {
      console.error('Axios error response:', error.response?.data)
      console.error('Axios error status:', error.response?.status)
      console.error('Axios error message:', error.message)
    } else {
      console.error('Generic error:', error)
    }
    throw error
  }
}

export const updateChampionship = async (
  id: number,
  data: Campeonato,
) => {
  const token = getToken()
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/campeonatos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Erro ao atualizar campeonato')
  return await response.json()
}

export const deleteChampionship = async (id: number) => {
  const token = getToken()
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/campeonatos/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) throw new Error('Erro ao deletar campeonato')
}

export const getChampionshipById = async (id: string, token?: string) => {
  console.log(`Fetching championship with ID: ${id}`)
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/campeonatos/${id}`,
      getHttpOptions(token),
    )
    console.log('API response:', response.data)
    return response.data
  } catch (error) {
    console.error(`Error fetching championship with ID ${id}:`, error)
    throw new Error('Erro ao buscar campeonato.')
  }
}
