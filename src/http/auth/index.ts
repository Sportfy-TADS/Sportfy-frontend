import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { jwtDecode } from 'jwt-decode'
import { z } from 'zod'

import { DecodedToken } from '@/interface/types'
import { signInSchema } from '@/schemas'

type SignInSchema = z.infer<typeof signInSchema>

export const authenticateUser = async (data: SignInSchema) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/login/efetuarLogin`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    const { token } = response.data
    const decoded: DecodedToken = jwtDecode(token)

    console.log('Token recebido:', token)
    console.log('Dados decodificados:', decoded)

    localStorage.setItem('token', token)

    const userIdKey =
      decoded.role === 'ADMINISTRADOR' ? 'adminId' : 'academicoId'
    localStorage.setItem(userIdKey, decoded.idUsuario.toString())

    return decoded
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Erro na autenticação:', error)
      throw new Error(
        error.response?.data?.message || 'Nome de usuário ou senha inválidos',
      )
    }
    throw error
  }
}

export const useAuthenticateUser = (options: {
  onSuccess: () => void
  onError: (error: Error) => void
}) => {
  return useMutation({
    mutationFn: authenticateUser,
    ...options,
  })
}
