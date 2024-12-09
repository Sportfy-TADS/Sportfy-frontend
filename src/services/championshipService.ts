import { jwtDecode } from 'jwt-decode'

interface TokenPayload {
  sub: string
  roles: string[]
  idUsuario: number
  idAcademico: number
  iss: string
  exp: number
}

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('jwt') || localStorage.getItem('token')
  }
  return null
}

export const getHttpOptions = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
  return { headers }
}

export const getUserIdFromToken = (): number | null => {
  const token = localStorage.getItem('token')
  if (!token) return null

  try {
    const decoded: TokenPayload = jwtDecode(token)
    return decoded.idUsuario
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

export const createChampionship = async (
  championshipData: Record<string, unknown>,
) => {
  console.log('Creating championship with data:', championshipData)

  const token = localStorage.getItem('token')
  if (!token) {
    console.error('No token found in localStorage')
    throw new Error('No token found')
  }

  console.log('API URL:', `${process.env.NEXT_PUBLIC_API_URL}/campeonatos`)
  console.log('Token:', token.substring(0, 20) + '...')

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/campeonatos`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(championshipData),
      },
    )

    console.log('Response status:', response.status)
    const responseText = await response.text()
    console.log('Response body:', responseText)

    if (!response.ok) {
      console.error('Error creating championship:', responseText)
      throw new Error(responseText)
    }

    return JSON.parse(responseText)
  } catch (error) {
    console.error('Error in createChampionship:', error)
    throw error
  }
}
