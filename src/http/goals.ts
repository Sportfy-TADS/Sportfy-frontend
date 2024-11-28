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
  const response = await axios.get(
    `${API_URL}/metaDiaria/listar/${idAcademico}`,
    getHttpOptions()
  )
  return response.data
}

export const createGoal = async (goalData: any) => {
  const payload: GoalPayload = {
    titulo: goalData.titulo,
    objetivo: goalData.objetivo,
    quantidadeConcluida: 0,
    quantidadeObjetivo: goalData.progressoMaximo,
    itemQuantificado: goalData.progressoItem || 'unidade',
    situacaoMetaDiaria: 0,
    academico: {
      idAcademico: goalData.idAcademico
    }
  }

  try {
    const response = await axios.post(
      `${API_URL}/metaDiaria`,
      payload,
      {
        ...getHttpOptions(),
        validateStatus: false
      }
    )

    if (response.status >= 400) {
      console.error('Server response:', response.data)
      throw new Error(response.data.message || `Error ${response.status}: ${response.data.error}`)
    }

    return response.data
  } catch (error: any) {
    console.error('Create goal error:', error.response?.data || error)
    throw error
  }
}

export const updateGoal = async (goalData: any) => {
  const response = await axios.put(
    `${API_URL}/metaDiaria`,
    goalData,
    getHttpOptions()
  )
  return response.data
}

export const deleteGoal = async (id: number) => {
  const response = await axios.delete(
    `${API_URL}/metaDiaria/excluir/${id}`,
    getHttpOptions()
  )
  return response.data
}