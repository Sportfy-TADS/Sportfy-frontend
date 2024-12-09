type ApoioSaudeData = {
  nome: string
  email: string
  telefone: string
  descricao: string
}

function getToken(): string | null {
  return localStorage.getItem('token')
}

async function checkResponse(response: Response) {
  if (!response.ok) {
    const errorMessage = await response.text()
    throw new Error(errorMessage || 'Erro ao processar a solicitação')
  }
  return response.json()
}

export async function fetchApoioSaude() {
  const token = getToken()
  const response = await fetch('http://localhost:8081/apoio-saude/listar', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  return checkResponse(response)
}

export async function createApoioSaude(
  data: ApoioSaudeData,
): Promise<ApoioSaudeData> {
  const token = getToken()
  const response = await fetch('http://localhost:8081/apoio-saude/cadastrar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  return checkResponse(response)
}

export async function updateApoioSaude(id: string, data: ApoioSaudeData) {
  const token = getToken()
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
  return checkResponse(response)
}

export async function inactivateApoioSaude(id: string) {
  const token = getToken()
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
  return checkResponse(response)
}
