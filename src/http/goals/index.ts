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
  return await response.json()
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
  
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/metaDiaria`,
    {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...data,
        quantidadeConcluida: data.progressoAtual,
        situacaoMetaDiaria: 0
      }),
    },
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    console.error('Error response:', errorData)
    throw new Error(errorData?.message || 'Erro ao criar meta')
  }

  return await response.json()
}

// Função API para excluir uma meta
export async function deleteGoal(idMetaDiaria: number) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/metaDiaria/excluir/${idMetaDiaria}`,
    {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
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
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/metaDiaria`,
    {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data),
    },
  )
  if (!response.ok) throw new Error('Erro ao atualizar meta')
  return await response.json()
}
