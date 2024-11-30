import axios from 'axios'

// Função para obter o dados do usuário
export async function getUserData(username: string) {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/academico/buscar/${username}`,
  )
  if (response.status !== 200) throw new Error('Erro ao obter dados do usuário')
  return response.data
}

// Função API para buscar metas
export async function getGoals(idAcademico: number) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/metaDiaria/listar/${idAcademico}`,
  )
  if (!response.ok) throw new Error('Erro ao buscar metas')

  const text = await response.text()
  if (!text) {
    return [] // Return an empty array if response body is empty
  }
  return JSON.parse(text)
}

// Função API para buscar meta por nome
export async function searchGoalByName(idAcademico: number, titulo: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/metaDiaria/${idAcademico}/buscar/${titulo}`,
  )
  if (!response.ok) throw new Error('Erro ao buscar meta por nome')
  return await response.json()
}

// Função API para criar uma nova meta
export async function createGoal(data: {
  titulo: string
  objetivo: string
  progressoAtual: number
  progressoMaximo: number
  progressoItem: string
  idAcademico: number
  situacaoMetaDiaria: number
}) {
  const token = localStorage.getItem('token')
  
  const payload = {
    titulo: data.titulo,
    objetivo: data.objetivo,
    quantidadeConcluida: data.progressoAtual,
    quantidadeObjetivo: data.progressoMaximo,
    itemQuantificado: data.progressoItem,
    situacaoMetaDiaria: 0,
    academico: {
      idAcademico: data.idAcademico
    }
  }

  console.log('Creating goal with payload:', payload) // Debug log

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/metaDiaria`,
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Server error details:', errorData)
      throw new Error(errorData.message || `Error ${response.status}: ${errorData.error}`)
    }

    const result = await response.json()
    console.log('Goal created successfully:', result) // Debug log
    return result
  } catch (error: any) {
    console.error('Failed to create goal:', error)
    throw new Error(error.message || 'Erro ao criar meta')
  }
}

// Função API para excluir uma meta
export async function deleteGoal(idMetaDiaria: number) {
  const token = localStorage.getItem('token')
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/metaDiaria/excluir/${idMetaDiaria}`,
    {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    },
  )
  if (!response.ok) throw new Error('Erro ao deletar meta')
}

// Função API para atualizar uma meta
export async function updateGoal(data: {
  idMetaDiaria: number
  titulo: string
  objetivo: string
  progressoAtual: number
  progressoMaximo: number
  progressoItem: string
  idAcademico: number
  situacaoMetaDiaria: number
}) {
  const token = localStorage.getItem('token')
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/metaDiaria`,
    {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    },
  )
  if (!response.ok) throw new Error('Erro ao atualizar meta')
  return await response.json()
}

