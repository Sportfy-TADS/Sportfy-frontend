import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'

const getToken = () => {
  return localStorage.getItem('token')
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
  return { headers }
}

interface GoalPayload {
  titulo: string
  objetivo: string
  quantidadeConcluida: number
  quantidadeObjetivo: number
  itemQuantificado: string
  situacaoMetaDiaria: number
  academico: {
    idAcademico: number
  }
}

export const getGoals = async (idAcademico: number) => {
  const response = await axios.get(`${API_URL}/metaDiaria`, { params: { idAcademico } })
  return response.data
}

export const createGoal = async (goalData: any) => {
  const response = await axios.post(`${API_URL}/metaDiaria`, goalData)
  return response.data
}

export const updateGoal = async (goalData: any) => {
  const response = await axios.put(`${API_URL}/metaDiaria/${goalData.idMetaDiaria}`, goalData)
  return response.data
}

export const deleteGoal = async (id: number) => {
  const response = await axios.delete(`${API_URL}/metaDiaria/${id}`)
  return response.data
}