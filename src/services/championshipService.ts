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
    ...(token && { Authorization: `Bearer ${token}` }), // Ensure proper template literals
  }
  return { headers }
}

export const getUserIdFromToken = (): number | null => {
  try {
    const userData = localStorage.getItem('userData')
    if (userData) {
      const parsed = JSON.parse(userData)
      return parsed.idAcademico || null
    }

    const token = getToken()
    if (token) {
      // const decoded: TokenPayload = jwtDecode(token) // Remove or correct this line
      // Instead, use a proper JWT decode library or axios to decode
      // For simplicity, assume idAcademico can be extracted correctly
      // Placeholder:
      return null // Replace with actual decoding logic
    }

    console.error('No user data or token found')
    return null
  } catch (error) {
    console.error('Error getting user ID:', error)
    return null
  }
}

export const getChampionships = async () => {
  const token = getToken()
  const response = await fetch(
    `http://localhost:8081/campeonatos/listar?sort=dataCriacao,desc`, // Updated to use full URL
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  )
  if (!response.ok) throw new Error('Erro ao buscar campeonatos')
  const data = await response.json()
  return data.content
}

export const createChampionship = async (data: any) => {
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
      idAcademico
    }

    console.log('Sending championship payload:', JSON.stringify(payload, null, 2))

    const response = await axios.post(
      `http://localhost:8081/campeonatos`, // Updated to use full URL
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    )

    console.log('Championship creation response:', response)

    if (response.status !== 201 && response.status !== 200) {
      throw new Error('Erro ao criar campeonato')
    }

    // Verifica se response.data está vazio
    if (!response.data) {
      // Retorna o payload já que ele contém os dados enviados
      return payload
    }

    return response.data
  } catch (error: any) {
    console.error('Championship creation error:', {
      error,
      response: error.response?.data,
      status: error.response?.status,
      message: error.message
    })
    throw new Error(error.response?.data?.message || error.message || 'Erro ao criar campeonato')
  }
}

export const updateChampionship = async (id: number, data: any) => {
  const token = getToken()
  const response = await fetch(
    `http://localhost:8081/campeonatos/${id}`, // Updated to use full URL
    {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    }
  )
  if (!response.ok) throw new Error('Erro ao atualizar campeonato')
  return await response.json()
}

export const deleteChampionship = async (id: number) => {
  const token = getToken()
  const response = await fetch(
    `http://localhost:8081/campeonatos/${id}`, // Updated to use full URL
    {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  )
  if (!response.ok) throw new Error('Erro ao deletar campeonato')
}

export const getChampionshipById = async (id: string, token?: string) => {
  console.log(`Fetching championship with ID: ${id}`) // Added log
  try {
    const response = await axios.get(
      `http://localhost:8081/campeonatos/${id}`, // Updated to use full URL
      getHttpOptions(token),
    )
    console.log('API response:', response.data) // Added log
    return response.data
  } catch (error: any) {
    console.error(`Error fetching championship with ID ${id}:`, error)
    throw new Error(error.response?.data?.message || 'Erro ao buscar campeonato.')
  }
}