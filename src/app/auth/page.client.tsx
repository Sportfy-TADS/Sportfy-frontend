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
import { Medal } from 'lucide-react'; // Ícone Medal para o estilo
import {jwtDecode} from 'jwt-decode';  // Importação correta de jwt-decode

// Esquema de validação usando zod para username e password
const signInSchema = z.object({
  username: z.string().min(3, 'Nome de usuário deve ter pelo menos 3 caracteres'),
  password: z.string().min(2, 'A senha deve ter pelo menos 6 caracteres'),
});

type SignInSchema = z.infer<typeof signInSchema>;

interface DecodedToken {
  sub: string;
  role: string;
  idUsuario: number;
  exp: number;
}

export default function SignInPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
  });

// Durante o login, decodifique o token JWT e armazene o ID do usuário
const { mutateAsync: authenticateAcademico } = useMutation({
  mutationFn: async ({ username, password }: SignInSchema) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login/efetuarLogin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      throw new Error('Nome de usuário ou senha inválidos');
    }

    // Extrair e decodificar o token JWT
    const { token } = await res.json();
    const decoded = jwtDecode(token);

    // Verifique os dados decodificados
    console.log('Usuário logado encontrado:', decoded);

    // Salve o ID do usuário e outros dados no localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('academicoId', decoded.idUsuario.toString()); // Certifique-se de salvar o ID como string
    console.log('Usuário logado salvo no localStorage:', decoded.idUsuario);

    // Redirecionar com base na role
    if (decoded.role === 'ADMIN') {
      router.push('/admin-dashboard');
    } else if (decoded.role === 'ACADEMICO') {
      router.push('/feed');
    }
  },
});


// Após o login bem-sucedido:
const handleLogin = async (data: SignInSchema) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login/efetuarLogin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error('Nome de usuário ou senha inválidos');
    }

    const { token } = await res.json();
    console.log('Token JWT recebido:', token);

    // Decodificar o token JWT
    const decoded: DecodedToken = jwtDecode(token);
    console.log('Dados decodificados do token:', decoded);

    // Salvar o ID do usuário e outros dados no localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('academicoId', decoded.idUsuario.toString());
    console.log('Usuário logado salvo no localStorage:', decoded.idUsuario);

    // Redirecionar para a página correta
    router.push('/feed');
  } catch (err) {
    console.error('Erro no login:', err);
  }
};



  return (
    <div className="container relative min-h-screen flex flex-col items-center justify-center antialiased lg:grid lg:grid-cols-2 lg:px-0">
      {/* Barra lateral esquerda para telas maiores */}
      <div className="relative hidden h-full flex-col border-r border-foreground/5 bg-muted p-10 text-muted-foreground dark:border-r lg:flex">
        <div className="flex items-center gap-3 text-lg font-medium text-foreground">
          <Medal className="h-5 w-5" /> {/* Ícone Medal */}
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
            Criar conta
          </a>

          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
              <p className="text-sm text-muted-foreground">Acesse sua conta Sportfy</p>
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
    </div>
  );
}
