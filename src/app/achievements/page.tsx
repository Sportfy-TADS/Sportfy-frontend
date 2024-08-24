// app/achievements/page.tsx

'use client';

import { useState, useEffect } from 'react';
import AchievementCard from '@/components/AchievementCard';
import Header from '@/components/Header';

interface Achievement {
  id: number;
  title: string;
  description: string;
  achieved: boolean;
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    // Suponha que você tenha uma API ou um json-server que retorna as conquistas do usuário
    const fetchAchievements = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      
      try {
        const res = await fetch(`http://localhost:3001/achievements?userId=${userId}`);
        const data = await res.json();
        setAchievements(data);
      } catch (error) {
        console.error('Erro ao carregar as conquistas:', error);
      }
    };

    fetchAchievements();
  }, []);

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <h1 className="text-2xl font-bold text-center mb-4">Suas Conquistas</h1>
        <div className="w-full max-w-2xl space-y-4">
          {achievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              title={achievement.title}
              description={achievement.description}
              achieved={achievement.achieved}
            />
          ))}
        </div>
      </div>
    </>
  );
}
