'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';
import { z } from 'zod';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Medal } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Esquema de validação para username, email, password e gender
const signUpSchema = z.object({
  username: z.string().min(3, "Nome de usuário deve ter pelo menos 3 caracteres"),
  email: z.string().email().regex(/@ufpr\.br$/, "Email deve ser do domínio @ufpr.br"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  gender: z.enum(["masculino", "feminino", "outros"]),
});

type SignUpSchema = z.infer<typeof signUpSchema>;

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
  });

  const { mutateAsync: registerUser } = useMutation({
    mutationFn: async ({ username, email, password, gender }: SignUpSchema) => {
      // Verificar o que está sendo enviado ao servidor
      console.log("Dados enviados para registro:", { username, email, password, gender });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, gender }),
      });

      if (!res.ok) {
        console.error("Erro ao registrar:", await res.text()); // Logar o erro da API
        throw new Error('Erro no registro');
      }

      console.log("Registro realizado com sucesso.");
    },
  });

  const handleRegister = async (data: SignUpSchema) => {
    try {
      console.log("Iniciando registro com os dados:", data);
      await registerUser(data);

      toast.success('Registro bem-sucedido!', {
        action: {
          label: 'Login',
          onClick: () => {
            router.push(`/auth?username=${data.username}`);
          },
        },
      });
    } catch (err) {
      console.error("Erro no processo de registro:", err);
      toast.error(err instanceof Error ? err.message : 'Erro inesperado');
    }
  };

  return (
    <div className="container relative min-h-screen flex flex-col items-center justify-center antialiased lg:grid lg:grid-cols-2 lg:px-0">
      {/* Barra lateral esquerda para telas maiores */}
      <div className="relative hidden h-full flex-col border-r border-foreground/5 bg-muted p-10 text-muted-foreground dark:border-r lg:flex">
        <div className="flex items-center gap-3 text-lg font-medium text-foreground">
          <Medal className="h-5 w-5" /> {/* Ícone Medal do lucide-react */}
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
              'absolute right-4 top-4 md:right-8 md:top-8'
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
                Participe do <span className="font-semibold">Sportfy</span> e descubra novas modalidades!
              </p>
            </div>

            <div className="grid gap-6">
              <form onSubmit={handleSubmit(handleRegister)}>
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

                  <div className="grid gap-2">
                    <Label htmlFor="gender">Gênero</Label>
                    <Select onValueChange={value => register('gender').onChange({ target: { value } })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha seu gênero" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="feminino">Feminino</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" disabled={isSubmitting}>
                    Registrar
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
