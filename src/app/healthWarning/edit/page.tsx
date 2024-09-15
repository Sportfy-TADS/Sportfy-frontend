'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from '@/components/Header';

interface CasaDeSaude {
  id: number;
  nome: string;
  endereco: string;
  telefone: string;
  horario: string;
}

export default function EditHealthCenterPage({ params }: { params: { id: string } }) {
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
  

  useEffect(() => {
    const fetchCasaDeSaude = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/casasDeSaude/${params.id}`);
        const data: CasaDeSaude = await res.json();
        setNome(data.nome);
        setEndereco(data.endereco);
        setTelefone(data.telefone);
        setHorario(data.horario);
      } catch (error) {
        setError('Erro ao carregar casa de saúde');
      }
    };

    fetchCasaDeSaude();
  }, [params.id]);

  const handleUpdate = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/casasDeSaude/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, endereco, telefone, horario }),
      });
      if (res.ok) {
        alert('Casa de Saúde atualizada com sucesso!');
        router.push('/admin/health-centers');
      } else {
        setError('Erro ao atualizar casa de saúde');
      }
    } catch (error) {
      setError('Erro ao atualizar casa de saúde');
    }
  };

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-md shadow-md p-8">
          <h2 className="mb-6 text-2xl font-semibold text-center text-black dark:text-white">Editar Casa de Saúde</h2>
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
            onClick={handleUpdate}
            className="w-full p-2 font-semibold text-white bg-blue-500 hover:bg-blue-600"
          >
            Atualizar
          </Button>
        </div>
      </div>
    </>
  );
}
