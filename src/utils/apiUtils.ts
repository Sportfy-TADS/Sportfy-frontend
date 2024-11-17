import { jwtDecode } from 'jwt-decode'

export function getToken() {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('Token não encontrado')
  return token
}

export function decodeToken(token: string) {
  return jwtDecode(token)
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers,
  }
  const response = await fetch(url, { ...options, headers })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Erro na resposta da API: ${errorText}`)
  }
  return response.json()
}
