import { useUserData } from '@/hooks/useUserData'
import axios from 'axios'

// Função para obter o dados do usuário
export async function getUserData(username: string) {
  const token = localStorage.getItem('token')
  if (!token) return null
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/academico/buscar/${username}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )
  if (response.status !== 200) throw new Error('Erro ao obter dados do usuário')
  return response.data
}

// Função API para buscar metas
export async function getGoals(idAcademico: number) {
  // Make idAcademico required
  if (!idAcademico) {
    console.error('idAcademico is undefined')
    throw new Error('idAcademico is required')
  }
  const token = localStorage.getItem('token')
  if (!token) return null
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/metaDiaria/listar/${idAcademico}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
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
  const token = localStorage.getItem('token')
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/metaDiaria/${idAcademico}/buscar/${titulo}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )
  if (!response.ok) throw new Error('Erro ao buscar meta por nome')
  return await response.json()
}

// Função API para criar uma nova meta
export async function createGoal(data: {
  titulo: string
  descricao: string // Use 'descricao' instead of 'objetivo'
  progressoAtual: number
  progressoMaximo: number
  progressoItem: string
  idAcademico: number
  situacaoMetaDiaria?: number
}) {
  const token = localStorage.getItem('token')

  if (!data.idAcademico) {
    console.error('idAcademico is undefined')
    throw new Error('idAcademico is required')
  }

  const payload = {
    titulo: data.titulo,
    objetivo: data.descricao, // Map 'descricao' to 'objetivo' as required by the backend
    progressoAtual: data.progressoAtual,
    progressoMaximo: data.progressoMaximo,
    progressoItem: data.progressoItem,
    idAcademico: data.idAcademico,
    situacaoMetaDiaria: data.situacaoMetaDiaria || 0,
  }

  console.log('Creating goal with payload:', payload)

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/metaDiaria`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    )

    const result = await response.json()

    if (!response.ok) {
      const errorMessage = `Error ${response.status}: ${result?.message || 'Unknown error'}`
      console.error('Server error details:', errorMessage)
      throw new Error(errorMessage)
    }

    console.log('Goal created successfully:', result)
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
        Authorization: `Bearer ${token}`,
      },
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
  if (!token) {
    throw new Error('Usuário não autenticado')
  }

  const response = await fetch(`http://localhost:8081/metaDiaria`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorDetails = await response.text()
    console.error('Resposta de erro da API:', errorDetails)
    throw new Error(`Erro ao atualizar Meta Diária: ${errorDetails}`)
  }

  return response.json()
}

export async function getMetaEsportiva(idAcademico: number) {
  // Make idAcademico required
  if (!idAcademico) {
    console.error('idAcademico is undefined')
    throw new Error('idAcademico is required')
  }
  const token = localStorage.getItem('token')
  const response = await fetch(
    `http://localhost:8081/modalidadeEsportiva/listar/${idAcademico}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )
  if (!response.ok) {
    throw new Error('Erro ao buscar modalidades esportivas')
  }
  const modalidades = await response.json()
  const metasPromises = modalidades.map((modalidade: any) =>
    fetch(
      `http://localhost:8081/modalidadeEsportiva/metaEsportiva/listar/${modalidade.idModalidadeEsportiva}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    ).then((res) => res.json()),
  )
  const metasEsportivas = await Promise.all(metasPromises)
  return metasEsportivas.flat()
}

export async function updateMetaEsportiva(meta: MetaEsportiva) {
  const token = localStorage.getItem('token') // Use localStorage to get the token
  if (!token) {
    throw new Error('Usuário não autenticado')
  }

  // Fetch the list of available conquistas for the idAcademico
  const conquistasResponse = await axios.get(
    `http://localhost:8081/conquista/listarConquistas/${meta.idAcademico}`, // Use the correct idAcademico
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )

  if (conquistasResponse.status !== 200) {
    console.error('Erro ao buscar conquistas:', conquistasResponse.data)
    throw new Error(`Erro ao buscar conquistas: ${conquistasResponse.data}`)
  }

  const conquistas = conquistasResponse.data

  // Find the conquista that matches the metaEsportiva
  const conquista = conquistas.find(
    (c: any) => c.metaEsportiva.idMetaEsportiva === meta.idMetaEsportiva,
  )

  if (!conquista) {
    throw new Error('Conquista não existe!')
  }

  const payload = {
    idConquista: conquista.idConquista, // Use the correct idConquista
    progressoAtual: meta.progressoMaximo, // Update only the progressoAtual field
    dataConquista: null,
    conquistado: false,
    idAcademico: meta.idAcademico, // Ensure this is the correct idAcademico
    metaEsportiva: {
      idMetaEsportiva: meta.idMetaEsportiva,
      titulo: meta.titulo,
      descricao: meta.descricao,
      progressoMaximo: meta.progressoMaximo,
      progressoItem: meta.progressoItem,
      foto: meta.foto,
      ativo: meta.ativo,
      idModalidadeEsportiva: meta.idModalidadeEsportiva,
    },
  }

  const response = await axios.put(
    `http://localhost:8081/conquista/atualizarConquista`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )

  if (response.status !== 200) {
    console.error('Erro ao atualizar Meta Esportiva:', response.data)
    throw new Error(`Erro ao atualizar Meta Esportiva: ${response.data}`)
  }

  return response.data
}
