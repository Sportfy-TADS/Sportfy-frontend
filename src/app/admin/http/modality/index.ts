export interface Modalidade {
  idModalidadeEsportiva: number
  nome: string
  descricao: string
  status: boolean
}

export async function getModalidades() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/modalidadeEsportiva/listar`,
  )
  if (!res.ok) {
    throw new Error('Erro ao buscar modalidades')
  }
  return await res.json()
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
