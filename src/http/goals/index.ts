import axios from 'axios'

// Função para obter o idAcademico
export async function getUserData(userId: number) {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/academico/consultar/${userId}`,
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

// Função API para criar uma nova meta
export async function createGoal(data: {
  titulo: string
  objetivo: string
  quantidadeConcluida: number
  progressoAtual: number
  progressoMaximo: number
  progressoItem: string
  idAcademico: number
  situacaoMetaDiaria: number
}) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/metaDiaria`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
  )
  if (!response.ok) throw new Error('Erro ao criar meta')
  return await response.json()
}

// Função API para excluir uma meta
export async function deleteGoal(idMetaDiaria: number) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/metaDiaria/deletar`,
    {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idMetaDiaria }),
    },
  )
  if (!response.ok) throw new Error('Erro ao deletar meta')
}

// Função API para atualizar uma meta
export async function updateGoal(data: {
  idMetaDiaria: number
  titulo: string
  objetivo: string
  quantidadeConcluida: number
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
  )
  if (!response.ok) throw new Error('Erro ao atualizar meta')
  return await response.json()
}
