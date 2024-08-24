'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import Header from '@/components/Header';

interface Goal {
  id: number;
  title: string;
  description: string;
  status: 'in_progress' | 'completed';
  userId: number;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  const router = useRouter();

  useEffect(() => {
    const fetchGoals = async () => {
      const userId = localStorage.getItem('userId'); // Obtém o ID do usuário do localStorage
      if (!userId) {
        router.push('/auth'); // Redireciona para login se não houver ID do usuário
        return;
      }
      
      try {
        const res = await fetch(`http://localhost:3001/goals?userId=${userId}`);
        const data = await res.json();
        setGoals(data);
      } catch (e) {
        console.error('Erro ao carregar as metas do usuário', e);
      }
    };

    fetchGoals();
  }, [router]);

  const filteredGoals = goals.filter(goal => filter === 'all' || goal.status === filter);

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <h1 className="text-2xl font-bold text-emerald-600 mb-4">Minhas Metas</h1>
        <div className="mb-4">
          <Button variant="outline" onClick={() => setFilter('all')}>Todas</Button>
          <Button variant="outline" onClick={() => setFilter('in_progress')}>Em andamento</Button>
          <Button variant="outline" onClick={() => setFilter('completed')}>Concluídas</Button>
        </div>
        <ul className="w-full max-w-md">
          {filteredGoals.map(goal => (
            <li key={goal.id} className="mb-4 p-4 bg-white dark:bg-gray-800 rounded shadow-md">
              <h2 className="text-lg font-semibold">{goal.title}</h2>
              <p>{goal.description}</p>
              <span className={`mt-2 block text-sm ${goal.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}`}>
                {goal.status === 'completed' ? 'Concluída' : 'Em andamento'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
