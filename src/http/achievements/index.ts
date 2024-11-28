// index.ts
export const fetchAchievements = async (
  idAcademico: number,
  token: string | null,
) => {
  try {
    console.log('Fetching achievements for idAcademico:', idAcademico)
    console.log('Using token:', token)
    
    const url = `${process.env.NEXT_PUBLIC_API_URL}/conquista/listarConquistas/${idAcademico}`
    console.log('Request URL:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    console.log('Response status:', response.status)
    
    if (!response.ok) {
      console.error('Error response:', response)
      throw new Error('Erro ao carregar conquistas')
    }

    const achievementsData = await response.json()
    console.log('Achievement data received:', achievementsData)
    return achievementsData
  } catch (error) {
    console.error('Error in fetchAchievements:', error)
    throw error
  }
}