// Função para buscar dados de apoio à saúde
export async function getApoioSaude() {
  const token = localStorage.getItem('token')

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/apoioSaude`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )

  if (!response.ok) {
    throw new Error('Erro ao buscar apoio à saúde')
  }

  return await response.json()
}

export async function fetchApoioSaude() {
  const response = await fetch('http://localhost:8081/apoio-saude/listar')
  if (!response.ok) {
    throw new Error('Erro ao buscar apoios à saúde')
  }
  return response.json()
}

export async function createApoioSaude(data: {
  nome: string
  email: string
  telefone: string
  descricao: string
}): Promise<any> {
  const response = await fetch('http://localhost:8081/apoio-saude/cadastrar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Erro ao cadastrar apoio à saúde')
  }
  return response.json()
}

export async function updateApoioSaude(
  id: string,
  data: { nome: string; email: string; telefone: string; descricao: string },
) {
  const response = await fetch(
    `http://localhost:8081/apoio-saude/atualizar/${id}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
  )
  if (!response.ok) {
    throw new Error('Erro ao atualizar apoio à saúde')
  }
  return response.json()
}

export async function inactivateApoioSaude(id: string) {
  const response = await fetch(
    `http://localhost:8081/apoio-saude/inativar/${id}`,
    {
      method: 'PUT',
    },
  )
  if (!response.ok) {
    throw new Error('Erro ao inativar apoio à saúde')
  }
  return response.json()
}
