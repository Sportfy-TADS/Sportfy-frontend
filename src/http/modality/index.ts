'use server'

import { Modalidade, UserData } from '@/interface/types'
import { fetchWithAuth, getToken } from '@/utils/apiUtils'
import { useQuery, useMutation, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import axios from 'axios'

export async function fetchModalidades() {
  const token = getToken()
  const idAcademico = getIdAcademico()
  const url = `${process.env.NEXT_PUBLIC_API_URL}/modalidadeEsportiva/listar`
  return fetchWithAuth(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
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

export async function inscreverUsuario(modalidadeId: number) {
  const token = getToken()
  const idAcademico = getIdAcademico()
  const url = `${process.env.NEXT_PUBLIC_API_URL}/modalidadeEsportiva/inscrever/${idAcademico}/${modalidadeId}`
  return fetchWithAuth(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
}

function getIdAcademico(): number {
  const userDataStr = localStorage.getItem('userData')
  if (!userDataStr) throw new Error('Dados do usuário não encontrados')
  const userData: UserData = JSON.parse(userDataStr)
  return userData.idAcademico
}

export async function fetchAdmins() {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/administrador/listar`
  return fetchWithAuth(url)
}

interface NewAdmin {
  nome: string;
  email: string;
  senha: string;
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
