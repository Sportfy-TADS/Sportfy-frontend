export async function fetchApoioSaude() {
  const token = localStorage.getItem('token')
  const response = await fetch('http://localhost:8081/apoio-saude/listar', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
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
  const token = localStorage.getItem('token')
  const response = await fetch('http://localhost:8081/apoio-saude/cadastrar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
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
  const token = localStorage.getItem('token')
  const response = await fetch(
    `http://localhost:8081/apoio-saude/atualizar/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    },
  )
  if (!response.ok) {
    throw new Error('Erro ao atualizar apoio à saúde')
  }
  return response.json()
}

export async function inactivateApoioSaude(id: string) {
  const token = localStorage.getItem('token')
  const response = await fetch(
    `http://localhost:8081/apoio-saude/inativar/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )
  if (!response.ok) {
    throw new Error('Erro ao inativar apoio à saúde')
  }
  return response.json()
}
