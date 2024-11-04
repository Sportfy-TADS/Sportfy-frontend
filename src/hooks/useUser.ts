import { useQuery } from '@tanstack/react-query'

async function getUserData(userId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`,
  )
  if (!response.ok) {
    throw new Error('Erro ao buscar dados do usuário')
  }
  return await response.json()
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUserData(userId),
  })
}
