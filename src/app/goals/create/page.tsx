'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CreateGoalPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('in_progress');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleCreateGoal = async () => {
    const userId = localStorage.getItem('userId'); // Obtém o ID do usuário
    if (!userId) {
      setError('Usuário não autenticado');
      return;
    }

    const newGoal = {
      title,
      description,
      status,
      userId,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGoal),
      });

      if (res.ok) {
        alert('Meta criada com sucesso!');
        router.push('/goals'); // Redireciona para a página de metas
      } else {
        setError('Erro ao criar meta');
      }
    } catch (e) {
      setError('Erro ao criar meta');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="w-full max-w-lg bg-white p-8 rounded-md shadow-md dark:bg-gray-800">
        <h2 className="mb-4 text-2xl font-semibold text-center text-black dark:text-white">Criar Nova Meta</h2>
        {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
        
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 text-black dark:text-white"
          />
        </div>
        
        <div className="mb-4">
          <Textarea
            placeholder="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 text-black dark:text-white"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2 text-black dark:text-white">Status:</label>
          <Select onValueChange={setStatus} value={status}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Escolha o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="completed">Concluída</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleCreateGoal} className="w-full p-2 font-semibold text-white bg-blue-500 hover:bg-blue-600">
          Criar Meta
        </Button>
      </div>
    </div>
  );
}
