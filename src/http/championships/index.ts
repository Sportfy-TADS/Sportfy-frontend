import { Campeonato } from '@/interface/types'

// Função para buscar os campeonatos
export async function getCampeonatos() {
  const token = localStorage.getItem('token')
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/campeonatos/listar`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )

  if (!res.ok) {
    console.error('Erro ao buscar campeonatos', await res.text())
    throw new Error('Erro ao buscar campeonatos')
  }

  const data = await res.json()
  return data.content // Extrair o array 'content'
}

// Função para criar um novo campeonato
export async function createCampeonato(data: Partial<Campeonato>) {
  const token = localStorage.getItem('token')
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/campeonatos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Erro ao criar campeonato')
  return res.json()
}

// Função para atualizar um campeonato existente
export async function updateCampeonato(
  idCampeonato: number,
  data: Partial<Campeonato>,
) {
  const token = localStorage.getItem('token')
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/campeonatos/${idCampeonato}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    },
  )
  if (!res.ok) throw new Error('Erro ao atualizar campeonato')
  return res.json()
}

// Função para excluir um campeonato
export async function deleteCampeonato(idCampeonato: number) {
  const token = localStorage.getItem('token')
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/campeonatos/${idCampeonato}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )
  if (!res.ok) throw new Error('Erro ao excluir campeonato')
  return res.json()
}
