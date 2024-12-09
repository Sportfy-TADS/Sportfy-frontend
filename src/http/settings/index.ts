type Settings = {
  // Defina as propriedades de Settings conforme necessário
  theme: string
  notifications: boolean
  // ...outras propriedades...
}

const getToken = (): string | null => localStorage.getItem('token')

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    throw new Error('Erro ao processar a solicitação')
  }
  return response.json()
}

export const fetchSettings = async (userId: number): Promise<Settings> => {
  const token = getToken()
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/settings/${userId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )
  return handleResponse(response)
}

export const saveSettings = async (
  userId: number,
  settings: Settings,
): Promise<void> => {
  const token = getToken()
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/settings/${userId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(settings),
    },
  )
  await handleResponse(response)
}

export const deleteSettings = async (userId: number): Promise<void> => {
  const token = getToken()
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/settings/${userId}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )
  await handleResponse(response)
}
