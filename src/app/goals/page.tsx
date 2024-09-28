'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import Header from '@/components/Header';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 
import { useRouter } from 'next/navigation'; // Para navegação

interface Goal {
  id: number;
  title: string;
  description: string;
  status: string;
  userId: string;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [filteredGoals, setFilteredGoals] = useState<Goal[]>([]);
  const [filter, setFilter] = useState('all'); 
  const router = useRouter();

  useEffect(() => {
    const fetchGoals = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/goals?userId=${userId}`);
      const data = await res.json();
      setGoals(data);
      setFilteredGoals(data);
    };

    fetchGoals();
  }, []);

  useEffect(() => {
    if (filter === 'completed') {
      setFilteredGoals(goals.filter((goal) => goal.status === 'completed'));
    } else if (filter === 'in_progress') {
      setFilteredGoals(goals.filter((goal) => goal.status === 'in_progress'));
    } else {
      setFilteredGoals(goals); 
    }
  }, [filter, goals]);

  const goToCreateGoalPage = () => {
    router.push('/goals/create'); 
  };

  const goToEditGoalPage = (id: number) => {
    router.push(`/goals/edit/${id}`); 
  };

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
        <div className="w-full max-w-7xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Minhas Metas</h1>
            <div className="flex space-x-4">
              <div className="w-48">
                <Select onValueChange={(value) => setFilter(value)} defaultValue="all">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filtrar metas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="completed">Concluídas</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={goToCreateGoalPage} className="bg-blue-500 hover:bg-blue-600">
                Criar Nova Meta
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGoals.length > 0 ? (
              filteredGoals.map((goal) => (
                <Card key={goal.id} className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">{goal.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-800 dark:text-gray-200 mb-2">{goal.description}</p>
                    <p className="font-semibold">
                      Status: <span className={goal.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}>
                        {goal.status === 'completed' ? 'Concluída' : 'Em Andamento'}
                      </span>
                    </p>
                    <Button onClick={() => goToEditGoalPage(goal.id)} className="mt-4 w-full">
                      Editar Meta
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center col-span-full text-gray-700 dark:text-gray-300">Nenhuma meta encontrada.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
