export const fetchSettings = async (userId: number) => {
  const token = localStorage.getItem('token')
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/settings/${userId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )
  if (!response.ok) {
    throw new Error('Erro ao buscar configurações')
  }
  return response.json()
}

export const saveSettings = async (userId: number, settings: any) => {
  const token = localStorage.getItem('token')
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
  if (!response.ok) {
    throw new Error('Erro ao salvar configurações')
  }
}

export const deleteSettings = async (userId: number) => {
  const token = localStorage.getItem('token')
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
  if (!response.ok) {
    throw new Error('Erro ao deletar configurações')
  }
}
