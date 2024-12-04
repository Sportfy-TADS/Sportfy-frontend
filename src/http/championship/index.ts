import {
  getToken,
  getUserIdFromToken,
  getHttpOptions,
} from '@/services/championshipService'

import axios from 'axios'

export const getChampionships = async () => {
  const token = getToken()
  const response = await fetch(
    `http://localhost:8081/campeonatos/listar?sort=dataCriacao,desc`,
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

interface ChampionshipData {
  name: string
  date: string
  location: string
  // Add other fields as necessary
}

export const createChampionship = async (data: ChampionshipData) => {
  try {
    const token = getToken()
    const idAcademico = getUserIdFromToken()

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

    console.log(
      'Sending championship payload:',
      JSON.stringify(payload, null, 2),
    )

    const response = await axios.post(
      `http://localhost:8081/campeonatos`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    )

    console.log('Championship creation response:', response)

    if (response.status !== 201 && response.status !== 200) {
      throw new Error('Erro ao criar campeonato')
    }

    if (!response.data) {
      return payload
    }

    return response.data
  } catch (error) {
    console.error('Error creating championship:', error)
    throw error
  }
}

export const updateChampionship = async (
  id: number,
  data: ChampionshipData,
) => {
  const token = getToken()
  const response = await fetch(`http://localhost:8081/campeonatos/${id}`, {
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
  const response = await fetch(`http://localhost:8081/campeonatos/${id}`, {
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
      `http://localhost:8081/campeonatos/${id}`,
      getHttpOptions(token),
    )
    console.log('API response:', response.data)
    return response.data
  } catch (error) {
    console.error(`Error fetching championship with ID ${id}:`, error)
    throw new Error('Erro ao buscar campeonato.')
  }
}
