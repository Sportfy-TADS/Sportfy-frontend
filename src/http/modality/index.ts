import { jwtDecode } from 'jwt-decode'

export interface Modalidade {
  idModalidadeEsportiva: number
  nome: string
  descricao: string
  status: boolean
}

export async function getModalidades() {
  const token = localStorage.getItem('token')
  if (!token) {
    console.error('Token não encontrado')
    throw new Error('Token não encontrado')
  }

  const idAcademico = getIdAcademico()
  console.log('Buscando modalidades para idAcademico:', idAcademico)

  const url = `${process.env.NEXT_PUBLIC_API_URL}/modalidadeEsportiva/listar`
  console.log('URL da API:', url)

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    console.log('Status da resposta:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erro na resposta da API:', errorText)
      throw new Error(`Erro ao buscar modalidades: ${errorText}`)
    }

    const data = await response.json()
    console.log('Dados recebidos da API:', data)
    return data
  } catch (error) {
    console.error('Erro ao buscar modalidades:', error)
    throw error
  }
}

export async function createModalidade(
  data: Partial<Modalidade>,
  token: string,
) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/modalidadeEsportiva`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    },
  )
  if (!res.ok) {
    throw new Error('Erro ao cadastrar modalidade')
  }
  return res.json()
}

export async function updateModalidade(data: Modalidade, token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/modalidadeEsportiva`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    },
  )
  if (!res.ok) {
    throw new Error('Erro ao editar modalidade')
  }
  return res.json()
}

export async function desativarModalidade(id: number, token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/modalidadeEsportiva/desativar/${id}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )
  if (!res.ok) {
    throw new Error('Erro ao desativar modalidade')
  }
  return res.json()
}

export async function searchModalidade(nome: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/modalidadeEsportiva/buscar/${nome}`,
  )
  if (!res.ok) {
    throw new Error('Erro ao buscar modalidade')
  }
  return await res.json()
}

export async function inscreverModalidade(
  idAcademico: number,
  idModalidadeEsportiva: number,
  token: string,
) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/modalidadeEsportiva/inscrever/${idAcademico}/${idModalidadeEsportiva}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )
  if (!res.ok) {
    throw new Error('Erro ao se inscrever na modalidade')
  }
  return res.json()
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

    console.log('Status da resposta:', response.status)

    if (!response.ok) {
      const error = await response.text()
      console.error('Erro na resposta da API:', error)
      throw new Error(`Erro ao realizar inscrição: ${error}`)
    }

    const data = await response.json()
    console.log('Dados recebidos da API após inscrição:', data)
    return data
  } catch (error) {
    console.error('Erro na inscrição:', error)
    throw error
  }
}

function getIdAcademico(): number {
  const userDataStr = localStorage.getItem('userData')
  console.log('Dados do usuário no localStorage:', userDataStr)
  if (!userDataStr) throw new Error('Dados do usuário não encontrados')

  const userData: UserData = JSON.parse(userDataStr)
  console.log('Dados do usuário após parse:', userData)
  return userData.idAcademico
}

function decodeToken(token: string): TokenPayload {
  const decoded = jwtDecode<TokenPayload>(token)
  console.log('Token decodificado:', decoded)
  return decoded
}

interface TokenPayload {
  sub: string
  roles: string
  idUsuario: number
  iss: string
  exp: number
}

interface UserData {
  idAcademico: number
  curso: string
  username: string
  email: string
  nome: string
}
