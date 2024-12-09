import { QueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { fetchWithAuth, getToken } from '@/utils/apiUtils'
import { getUserIdFromToken } from '@/utils/auth'

// Interfaces
interface TokenPayload {
  sub: string
  roles: string
  idUsuario: number
  iss: string
  exp: number
}

export interface UserData {
  idAcademico: number
  curso: string
  username: string
  email: string
  nome: string
}

export interface Modalidade {
  idModalidadeEsportiva: number
  nome: string
  descricao: string
  dataCriacao: string
  inscrito: boolean
}

// Utility Functions
export function decodeToken(token: string): TokenPayload {
  const decoded = getUserIdFromToken()
  if (!decoded) {
    throw new Error('Token inválido')
  }
  console.log('Token decodificado:', decoded)
  return decoded
}

export function getIdAcademico(): number {
  const userDataStr = localStorage.getItem('userData')
  console.log('Dados do usuário no localStorage:', userDataStr)
  if (!userDataStr) throw new Error('Dados do usuário não encontrados')

  const userData: UserData = JSON.parse(userDataStr)
  console.log('Dados do usuário após parse:', userData)
  console.log('ID Acadêmico:', userData.idAcademico)
  return userData.idAcademico
}

// API Calls
export async function getModalidades(): Promise<Modalidade[]> {
  const token = localStorage.getItem('token')
  if (!token) {
    console.error('Token não encontrado')
    throw new Error('Token não encontrado')
  }

  const idAcademico = getIdAcademico()
  console.log('Buscando modalidades para idAcademico:', idAcademico)

  const allModalidadesUrl = `${process.env.NEXT_PUBLIC_API_URL}/modalidadeEsportiva/listar`
  const inscritasUrl = `${process.env.NEXT_PUBLIC_API_URL}/modalidadeEsportiva/listar/${idAcademico}`

  try {
    const [allModalidadesResponse, inscritasResponse] = await Promise.all([
      fetch(allModalidadesUrl, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }),
      fetch(inscritasUrl, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }),
    ])

    if (!allModalidadesResponse.ok) {
      const errorText = await allModalidadesResponse.text()
      console.error(
        'Erro na resposta da API para todas modalidades:',
        errorText,
      )
      throw new Error(`Erro ao buscar todas modalidades: ${errorText}`)
    }

    if (!inscritasResponse.ok) {
      const errorText = await inscritasResponse.text()
      console.error(
        'Erro na resposta da API para modalidades inscritas:',
        errorText,
      )
      throw new Error(`Erro ao buscar modalidades inscritas: ${errorText}`)
    }

    const allModalidades = await allModalidadesResponse.json()
    const inscritas = await inscritasResponse.json()

    // Mark modalidades as inscrito
    const modalidadesWithInscrito = allModalidades.map(
      (modalidade: Modalidade) => ({
        ...modalidade,
        inscrito: inscritas.some(
          (inscrita: { idModalidadeEsportiva: number }) =>
            inscrita.idModalidadeEsportiva === modalidade.idModalidadeEsportiva,
        ),
      }),
    )

    return modalidadesWithInscrito
  } catch (error) {
    console.error('Erro ao buscar modalidades:', error)
    throw error
  }
}

export async function inscreverUsuario(modalidadeId: number) {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('Token não encontrado')

  try {
    const idAcademico = getIdAcademico()
    console.log('Inscrevendo usuário:', { idAcademico, modalidadeId })

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/modalidadeEsportiva/inscrever/${idAcademico}/${modalidadeId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Erro na resposta da API:', error)
      throw new Error(`Erro ao realizar inscrição: ${error}`)
    }

    // Handle empty response body
    const data =
      response.status === 204 || response.status === 200
        ? null
        : await response.json()
    console.log('Dados recebidos da API após inscrição:', data)
    return data
  } catch (error) {
    console.error('Erro na inscrição:', error)
    throw error
  }
}

export async function desinscreverUsuario(modalidadeId: number) {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('Token não encontrado')

  try {
    const idAcademico = getIdAcademico()
    console.log('Desinscrevendo usuário:', { idAcademico, modalidadeId })

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/modalidadeEsportiva/remover/${idAcademico}/${modalidadeId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Erro na resposta da API:', error)
      throw new Error(`Erro ao realizar desinscrição: ${error}`)
    }

    // Handle empty response body
    const data =
      response.status === 204 || response.status === 200
        ? null
        : await response.json()
    console.log('Dados recebidos da API após desinscrição:', data)
    return data
  } catch (error) {
    console.error('Erro na desinscrição:', error)
    throw error
  }
}

export async function fetchModalidades() {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/modalidadeEsportiva/listar`
  return fetchWithAuth(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
  })
}

export async function createModalidade(data: Partial<Modalidade>) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/modalidadeEsportiva`
  console.log('Enviando dados para criar modalidade:', data) // Adicione esta linha para verificar os dados enviados
  const response = await fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  console.log('Resposta da API ao criar modalidade:', response) // Adicione esta linha para verificar a resposta da API
  return response
}

export async function updateModalidade(data: Modalidade) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/modalidadeEsportiva`
  console.log('Enviando dados para atualizar modalidade:', data)
  const response = await fetchWithAuth(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  console.log('Resposta da API ao atualizar modalidade:', response)
  return response
}

export async function desativarModalidade(id: number) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/modalidadeEsportiva/desativar/${id}`
  return fetchWithAuth(url, { method: 'PUT' })
}

export async function searchModalidade(nome: string) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/modalidadeEsportiva/buscar/${nome}`
  return fetchWithAuth(url)
}

export async function inscreverModalidade(
  idAcademico: number,
  idModalidadeEsportiva: number,
) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/modalidadeEsportiva/inscrever/${idAcademico}/${idModalidadeEsportiva}`
  return fetchWithAuth(url, { method: 'POST' })
}

export async function fetchAdmins() {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/administrador/listar`
  return fetchWithAuth(url)
}

interface NewAdmin {
  nome: string
  email: string
  senha: string
}

export async function createAdmin(newAdmin: NewAdmin) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/administrador/cadastrar`
  return fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(newAdmin),
  })
}

export async function inactivateAdmin(id: number) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/administrador/inativar/${id}`
  return fetchWithAuth(url, { method: 'PATCH' })
}

export const useModalidades = () => {
  return useQuery<Modalidade[], Error>({
    queryKey: ['modalidades'],
    queryFn: fetchModalidades,
    onSuccess: (data: Modalidade[]) => {
      console.log('Modalidades carregadas com sucesso:', data)
    },
    onError: (error: Error) => {
      console.error('Erro ao carregar modalidades:', error)
    },
  })
}

export const useInscreverUsuario = (queryClient: QueryClient) => {
  return useMutation({
    mutationFn: inscreverUsuario,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['modalidades'] })
      toast.success('Inscrição realizada com sucesso!')
      console.log('Inscrição realizada com sucesso:', data)
    },
    onError: (error: Error) => {
      console.error('Erro detalhado:', error)
      toast.error(`Erro ao realizar inscrição: ${error.message}`)
    },
  })
}
