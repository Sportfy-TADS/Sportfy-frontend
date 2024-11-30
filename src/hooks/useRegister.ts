import { useRouter } from 'next/navigation'

import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { registerAcademico } from '@/http/register'
import { SignUpSchema } from '@/schemas'

export const useRegister = () => {
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: registerAcademico,
    // Ensure password and foto are not required
    onSuccess: (data, variables) => {
      toast.success('Registro bem-sucedido!', {
        action: {
          label: 'Login',
          onClick: () => router.push(`/auth?username=${variables.username}`),
        },
      })

      setTimeout(() => {
        router.push('/auth')
      }, 2000)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro inesperado')
    },
  })

  return mutation
}
