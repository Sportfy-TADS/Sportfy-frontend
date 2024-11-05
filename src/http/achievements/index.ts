export const fetchAchievements = async (
  userId: string | null,
  token: string | null,
) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/conquista/listarConquistas/1`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    )

    if (!response.ok) {
      throw new Error('Erro ao carregar conquistas')
    }

    const achievementsData = await response.json()
    return achievementsData
  } catch (error) {
    throw error
  }
}
