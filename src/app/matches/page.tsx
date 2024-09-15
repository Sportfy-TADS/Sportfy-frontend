'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Tipagem para Modalidade Esportiva
interface Modalidade {
  id: number;
  nome: string;
}

export default function CreateMatchPage() {
  const [modalidades, setModalidades] = useState<Modalidade[]>([]);
  const [selectedModalidade, setSelectedModalidade] = useState('');
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Buscar modalidades esportivas do json-server
  useEffect(() => {
    const fetchModalidades = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/modalidades`);
      const data = await res.json();
      setModalidades(data);
    };

    fetchModalidades();
  }, []);

  // Função para criar a partida
  const handleCreateMatch = async () => {
    if (!nome || !descricao || !localizacao || !selectedModalidade) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('Usuário não autenticado.');
      return;
    }

    const newMatch = {
      nome,
      descricao,
      localizacao,
      modalidade: selectedModalidade,
      userId,
      date: new Date().toISOString(),
    };

    try {
      // Enviar a partida para o json-server
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMatch),
      });

      if (res.ok) {
        // Após a criação, envie para o feed da comunidade
        const feedPost = {
          author: userId,
          content: `Partida criada: ${nome} na modalidade ${selectedModalidade}. Descrição: ${descricao}. Localização: ${localizacao}`,
          date: new Date().toISOString(),
        };

        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/feed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(feedPost),
        });

        alert('Partida criada e enviada para o feed da comunidade!');
        router.push('/feed'); // Redireciona para o feed
      } else {
        setError('Erro ao criar a partida.');
      }
    } catch (e) {
      setError('Erro ao criar a partida.');
    }
  };

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
        <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-center text-emerald-600 dark:text-emerald-400 mb-6">
            Criar Nova Partida
          </h1>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2 text-black dark:text-white">Modalidade Esportiva</label>
            <Select onValueChange={setSelectedModalidade} value={selectedModalidade}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Escolha uma modalidade" />
              </SelectTrigger>
              <SelectContent>
                {modalidades.map(modalidade => (
                  <SelectItem key={modalidade.id} value={modalidade.nome}>
                    {modalidade.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Input
            type="text"
            className="w-full p-2 mb-4 text-black dark:text-white"
            placeholder="Nome da Partida"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <Textarea
            className="w-full p-2 mb-4 text-black dark:text-white"
            placeholder="Descrição da Partida"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />

          <Input
            type="text"
            className="w-full p-2 mb-4 text-black dark:text-white"
            placeholder="Localização"
            value={localizacao}
            onChange={(e) => setLocalizacao(e.target.value)}
          />

          <Button
            onClick={handleCreateMatch}
            className="w-full p-2 font-semibold text-white bg-blue-500 hover:bg-blue-600"
          >
            Criar Partida
          </Button>
        </div>
      </div>
    </>
  );
}
