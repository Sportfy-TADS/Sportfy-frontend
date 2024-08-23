'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const emailSchema = z.string().email().regex(/@ufpr\.br$/, "Email deve ser do domínio @ufpr.br");

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      emailSchema.parse(email);
      const res = await fetch('http://localhost:3001/users');
      const users = await res.json();
      const user = users.find((user: any) => user.email === email && user.password === password);
      if (user) {
        localStorage.setItem('userId', user.id); // Armazena o ID do usuário no localStorage
        router.push('/feed');
      } else {
        setError('Credenciais inválidas');
      }
    } catch (e) {
      if (e instanceof z.ZodError) {
        setError(e.errors[0].message);
      }
    }
  };

  const redirectToRegister = () => {
    router.push('/register');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#202024]">
      <div className="">
        <h1 className='text-center font-bold text-emerald-600 text-2xl'>Sportfy</h1>
        <h2 className="mb-4 text-xl font-semibold text-white text-center">Login</h2>
        {error && <div className="mb-4 text-red-500">{error}</div>}
        <Input
          type="email"
          className="w-full p-2 mb-4 text-white"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          className="w-full p-2 mb-4 border rounded"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          onClick={handleLogin}
          className="w-full p-2 mb-2 font-semibold text-white bg-green-500"
        >
          Entrar
        </Button>
        <Button
          onClick={redirectToRegister}
          className="w-full p-2 font-semibold text-white bg-blue-500"
        >
          Cadastro
        </Button>
      </div>
    </div>
  );
}
