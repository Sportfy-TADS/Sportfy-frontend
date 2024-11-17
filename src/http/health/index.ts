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
