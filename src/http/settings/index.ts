export const fetchSettings = async (userId: number) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/settings/${userId}`,
  )
  if (!response.ok) {
    throw new Error('Erro ao buscar configurações')
  }
  return response.json()
}

export const saveSettings = async (userId: number, settings: any) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/settings/${userId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    },
  )
  if (!response.ok) {
    throw new Error('Erro ao salvar configurações')
  }
}

export const deleteSettings = async (userId: number) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/settings/${userId}`,
    {
      method: 'DELETE',
    },
  )
  if (!response.ok) {
    throw new Error('Erro ao deletar configurações')
  }
}
