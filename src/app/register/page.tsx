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
import { format } from 'date-fns';

// Esquema de validação
const signUpSchema = z.object({
  curso: z.string().min(3, "O curso deve ter pelo menos 3 caracteres"),
  username: z.string().min(3, "Nome de usuário deve ter pelo menos 3 caracteres"),
  email: z.string().email().regex(/@ufpr\.br$/, "Email deve ser do domínio @ufpr.br"),
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  telefone: z.string().min(10, "Telefone deve ter pelo menos 10 caracteres"),
  dataNascimento: z.string(),
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

  // Mutação para registrar o acadêmico
  const { mutateAsync: registerAcademico } = useMutation({
    mutationFn: async ({ curso, username, email, nome, telefone, dataNascimento }: SignUpSchema) => {
      const payload = {
        curso,
        nome,
        username,
        telefone,
        dataNascimento: format(new Date(dataNascimento), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
        email,
        foto: null,
      };

      // Log dos dados enviados ao backend
      console.log("Enviando dados ao backend:", payload);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/academico/cadastrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("Erro ao registrar:", error);
        throw new Error('Erro no registro');
      }

      console.log("Registro realizado com sucesso.");
    },
  });

  const handleRegister = async (data: SignUpSchema) => {
    try {
      // Envio dos dados para o backend
      await registerAcademico(data);

      // Exibe notificação de sucesso com o Sonner
      toast.success('Registro bem-sucedido!', {
        action: {
          label: 'Login',
          onClick: () => router.push(`/auth?username=${data.username}`),  // Redireciona para login
        },
      });

      // Redireciona para a página de login
      setTimeout(() => {
        router.push('/auth');
      }, 2000);  // Espera 2 segundos antes de redirecionar
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro inesperado');
    }
  };

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
                    onClick={() => console.log("Botão de registro clicado!")}
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
  );
}
