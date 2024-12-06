// index.ts
export async function fetchAchievements(idAcademico: number, token: string) {
  if (!idAcademico) {
    throw new Error('ID do acadêmico é obrigatório')
  }

  if (!token) {
    throw new Error('Token é obrigatório')
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/conquista/listarConquistas/${idAcademico}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )

  console.log('Response status:', response.status)

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Acesso negado')
    }
    if (response.status === 404) {
      return [] // Return empty array if no achievements found
    }
    throw new Error('Erro ao carregar conquistas')
  }

  const data = await response.json()
  return data
}
