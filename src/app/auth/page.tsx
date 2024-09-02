'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Medal } from 'lucide-react';

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'A senha é obrigatória'), // Adiciona senha para maior segurança
});

type SignInSchema = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
    },
  });

  // Função para autenticar o usuário
  async function handleAuthenticate({ email, password }: SignInSchema) {
    try {
      // Fetch para obter os usuários do json-server
      const res = await fetch('http://localhost:3001/users');
      const users = await res.json();

      // Encontrar o usuário com o email e senha correspondentes
      const user = users.find(
        (user: { email: string; password: string }) => user.email === email && user.password === password
      );

      if (user) {
        localStorage.setItem('userId', user.id); // Salvar o ID do usuário
        toast.success('Login realizado com sucesso!', {
          action: {
            label: 'Ir para o painel',
            onClick: () => router.push('/feed'),
          },
        });
        router.push('/feed');      
      } else {
        throw new Error('Credenciais inválidas');
      }
    } catch (err) {
      toast.error('Credenciais inválidas');
    }
  }

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

      {/* Área de login */}
      <div className="relative flex min-h-screen flex-col items-center justify-center lg:py-12">
        <div className="lg:p-8">
          <a
            href="/register"
            className={twMerge(
              buttonVariants({ variant: 'ghost' }),
              'absolute right-4 top-4 md:right-8 md:top-8'
            )}
          >
            Novo cadastro
          </a>

          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Acessar Painel
              </h1>
              <p className="text-sm text-muted-foreground">
                Entre com suas credenciais para acessar o painel de controle!
              </p>
            </div>

            <div className="grid gap-6">
              <form onSubmit={handleSubmit(handleAuthenticate)}>
                <div className="grid gap-4">
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
                    Acessar Painel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
