'use client'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { Medal } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'

import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRegister } from '@/hooks/useRegister'
import { signUpSchema } from '@/schemas'

type SignUpSchema = z.infer<typeof signUpSchema>

export default function RegisterPage() {
  const router = useRouter()
  const { mutateAsync: handleRegister, isLoading: isSubmitting } = useRegister()

  const { register, handleSubmit } = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
  })

  return (
    <div className="container relative min-h-screen flex flex-col items-center justify-center antialiased lg:grid lg:grid-cols-2 lg:px-0">
      {/* Barra lateral esquerda para telas maiores */}
      <div className="relative hidden h-full flex-col border-r border-foreground/5 bg-muted p-10 text-muted-foreground dark:border-r lg:flex">
        <div className="flex items-center gap-3 text-lg font-medium text-foreground">
          <Medal className="h-5 w-5" />
          <span className="font-semibold">sportfy.app</span>
        </div>
        <div className="mt-auto">
          <footer className="text-sm">
            Painel do usuário &copy; sportfy.app - {new Date().getFullYear()}
          </footer>
        </div>
      </div>

      {/* Área de registro */}
      <div className="relative flex min-h-screen flex-col items-center justify-center lg:py-12">
        <div className="lg:p-8">
          <a
            href="/auth"
            className={twMerge(
              buttonVariants({ variant: 'ghost' }),
              'absolute right-4 top-4 md:right-8 md:top-8',
            )}
          >
            Fazer login
          </a>

          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Criar conta
              </h1>
              <p className="text-sm text-muted-foreground">
                Participe do <span className="font-semibold">Sportfy</span> e
                descubra novas modalidades!
              </p>
            </div>

            <div className="grid gap-6">
              <form onSubmit={handleSubmit(handleRegister)}>
                <div className="grid gap-4">
                  {/* Curso */}
                  <div className="grid gap-2">
                    <Label htmlFor="curso">Curso</Label>
                    <Input
                      id="curso"
                      type="text"
                      autoCapitalize="none"
                      autoComplete="curso"
                      autoCorrect="off"
                      {...register('curso')}
                    />
                  </div>

                  {/* Nome de usuário */}
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

                  {/* Email */}
                  <div className="grid gap-2">
                    <Label htmlFor="email">Seu e-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      {...register('email')}
                    />
                  </div>

                  {/* Nome completo */}
                  <div className="grid gap-2">
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input
                      id="nome"
                      type="text"
                      autoCapitalize="none"
                      autoComplete="nome"
                      autoCorrect="off"
                      {...register('nome')}
                    />
                  </div>

                  {/* Telefone */}
                  <div className="grid gap-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      type="tel"
                      autoCapitalize="none"
                      autoComplete="telefone"
                      autoCorrect="off"
                      {...register('telefone')}
                    />
                  </div>

                  {/* Data de nascimento */}
                  <div className="grid gap-2">
                    <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                    <Input
                      id="dataNascimento"
                      type="date"
                      {...register('dataNascimento')}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    onClick={() => console.log('Botão de registro clicado!')}
                  >
                    Registrar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
