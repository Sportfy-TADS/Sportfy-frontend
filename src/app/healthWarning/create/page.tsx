'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from '@/components/Header';

export default function AddHealthCenterPage() {
  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');
  const [horario, setHorario] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin'); // Supondo que você tenha salvo esse dado ao fazer o login
  
    if (!isAdmin) {
      alert("Você não tem permissão para acessar esta página.");
      router.push('/auth'); // Redireciona para o login ou outra página
    }
  }, [router]);

  const handleAdd = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/casasDeSaude`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, endereco, telefone, horario }),
      });
      if (res.ok) {
        alert('Casa de Saúde adicionada com sucesso!');
        router.push('/admin/health-centers');
      } else {
        setError('Erro ao adicionar casa de saúde');
      }
    } catch (error) {
      setError('Erro ao adicionar casa de saúde');
    }
  };

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-md shadow-md p-8">
          <h2 className="mb-6 text-2xl font-semibold text-center text-black dark:text-white">Adicionar Casa de Saúde</h2>
          {error && <div className="mb-4 text-red-500">{error}</div>}
          <Input
            type="text"
            className="w-full p-2 mb-4"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <Input
            type="text"
            className="w-full p-2 mb-4"
            placeholder="Endereço"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
          />
          <Input
            type="text"
            className="w-full p-2 mb-4"
            placeholder="Telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />
          <Input
            type="text"
            className="w-full p-2 mb-4"
            placeholder="Horário"
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
          />
          <Button
            onClick={handleAdd}
            className="w-full p-2 font-semibold text-white bg-green-500 hover:bg-green-600"
          >
            Adicionar
          </Button>
        </div>
      </div>
    </>
  );
}
