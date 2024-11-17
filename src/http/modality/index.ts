import { Modalidade, UserData } from '@/interface/types'
import { fetchWithAuth, getToken } from '@/utils/apiUtils'

export async function getModalidades() {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/modalidadeEsportiva/listar`
  return fetchWithAuth(url)
}

export async function createModalidade(data: Partial<Modalidade>) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/modalidadeEsportiva`
  return fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateModalidade(data: Modalidade) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/modalidadeEsportiva`
  return fetchWithAuth(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
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
  const idAcademico = getIdAcademico()
  const url = `${process.env.NEXT_PUBLIC_API_URL}/modalidadeEsportiva/inscrever/${idAcademico}/${modalidadeId}`
  return fetchWithAuth(url, { method: 'POST' })
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

export async function createAdmin(newAdmin) {
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
