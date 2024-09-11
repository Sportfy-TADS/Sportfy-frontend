'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';

interface Achievement {
  id: number;
  userId: string | null;
  title: string;
  description: string;
  category: string;
}

export default function AchievementsPage() {
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);
  const [globalAchievements, setGlobalAchievements] = useState<Achievement[]>([]);
  const [userId, setUserId] = useState<string | null>(null); // Para armazenar o ID do usuário logado

  useEffect(() => {
    const fetchAchievements = async () => {
      const storedUserId = localStorage.getItem('userId'); // Obtém o ID do usuário logado do localStorage
      setUserId(storedUserId);

      try {
        // Buscando todas as conquistas
        const response = await fetch('http://localhost:3001/achievements');
        const achievementsData = await response.json();

        // Separando conquistas do usuário e conquistas globais
        const userSpecific = achievementsData.filter((ach: Achievement) => ach.userId === storedUserId);
        const global = achievementsData.filter((ach: Achievement) => ach.userId === null);

        setUserAchievements(userSpecific);
        setGlobalAchievements(global);
      } catch (error) {
        console.error('Erro ao carregar conquistas:', error);
      }
    };

    fetchAchievements();
  }, []);

  return (
    <>
      <Header />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Suas Conquistas</h1>

        {/* Conquistas do Usuário */}
        {userAchievements.length > 0 ? (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Conquistas Pessoais</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userAchievements.map((achievement) => (
                <Card key={achievement.id} className="shadow-lg border border-emerald-500">
                  <CardHeader className="bg-emerald-50">
                    <CardTitle className="text-xl font-bold text-emerald-700">
                      {achievement.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="bg-emerald-100">
                    <p>{achievement.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">Nenhuma conquista pessoal encontrada.</p>
        )}

        {/* Conquistas Globais */}
        {globalAchievements.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Conquistas do Sistema</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {globalAchievements.map((achievement) => (
                <Card key={achievement.id} className="shadow-lg border border-blue-500">
                  <CardHeader className="bg-blue-50">
                    <CardTitle className="text-xl font-bold text-blue-700">
                      {achievement.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="bg-blue-100">
                    <p>{achievement.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
