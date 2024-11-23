'use client'

import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Medal } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'

import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signInSchema } from '@/schemas'
import { authenticateUser } from '@/http/auth'

type SignInSchema = z.infer<typeof signInSchema>

export default function SignInPage() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
  })

  const { mutateAsync: authenticate } = useMutation({
    mutationFn: authenticateUser,
    onSuccess: () => {
      toast.success('Login bem-sucedido!')
      router.push('/feed')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao fazer login.')
    },
  })

  const handleLogin = async (data: SignInSchema) => {
    try {
      await authenticate(data)
    } catch (err) {
      console.error('Erro no login:', err)
    }
  }

  return (
    <div className="container relative min-h-screen flex flex-col items-center justify-center antialiased lg:flex-row lg:px-0 w-full">
      <div className="relative hidden h-full flex-col border-r border-foreground/5 bg-muted p-10 text-muted-foreground dark:border-r lg:flex lg:h-screen lg:w-1/2">
        <div className="flex items-center gap-3 text-lg font-medium text-foreground">
          <Medal className="h-5 w-5" />
          <span className="font-semibold">sportfy.app</span>
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <footer className="text-sm mt-auto">
            Painel do usuário &copy; sportfy.app - {new Date().getFullYear()}
          </footer>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center lg:w-1/2 lg:p-8">
        <a
          href="/register"
          className={twMerge(
            buttonVariants({ variant: 'ghost' }),
            'absolute right-4 top-4 md:right-8 md:top-8',
          )}
        >
          Criar conta
        </a>

        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
            <p className="text-sm text-muted-foreground">
              Acesse sua conta Sportfy
            </p>
          </div>

          <div className="grid gap-6">
            <form onSubmit={handleSubmit(handleLogin)}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Nome de Usuário</Label>
                  <Input
                    id="username"
                    type="text"
                    autoCapitalize="none"
                    autoComplete="username"
                    autoCorrect="off"
                    {...register('username')}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">Sua senha</Label>
                  <Input
                    id="password"
                    type="password"
                    autoCapitalize="none"
                    autoComplete="current-password"
                    autoCorrect="off"
                    {...register('password')}
                  />
                </div>

                <Button type="submit" disabled={isSubmitting}>
                  Entrar
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}