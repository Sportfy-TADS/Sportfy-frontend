'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const emailSchema = z.string().email().regex(/@ufpr\.br$/, "Email deve ser do domínio @ufpr.br");
const passwordSchema = z.string().min(6, "Senha deve ter pelo menos 6 caracteres");
const genderSchema = z.enum(["masculino", "feminino", "outros"], "Escolha um gênero válido");

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('masculino');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      genderSchema.parse(gender);
      
      const res = await fetch('http://localhost:3001/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, gender }),
      });
      if (res.ok) {
        alert('Registro bem-sucedido!');
        router.push('/auth');
      } else {
        setError('Erro no registro');
      }
    } catch (e) {
      if (e instanceof z.ZodError) {
        setError(e.errors[0].message);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#202024]">
      <div className="">
        <h1 className='text-center font-bold text-emerald-600 text-2xl'>Sportfy</h1>
        <h2 className="mb-4 text-xl font-semibold text-white text-center">Cadastro</h2>
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
          className="w-full p-2 mb-4 text-white"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <select
          className="w-full p-2 mb-4 text-white bg-gray-700"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        >
          <option value="masculino">Masculino</option>
          <option value="feminino">Feminino</option>
          <option value="outros">Outros</option>
        </select>
        <Button
          onClick={handleRegister}
          className="w-full p-2 font-semibold text-white bg-green-500"
        >
          Registrar
        </Button>
      </div>
    </div>
  );
}
