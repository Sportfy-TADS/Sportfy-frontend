'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; // Supondo que você tenha componentes de UI para Input e Button
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  email: string;
  gender?: string;
}

interface Achievement {
  id: number;
  userId: string;
  title: string;
  description: string;
}

interface Goal {
  id: number;
  title: string;
  description: string;
  status: string;
  userId: string;
}

interface Post {
  id: number;
  author: string;
  date: string;
  content: string;
  image?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem('userId'); // Ajuste conforme necessário para identificar o usuário atual
      if (!userId) {
        return; // Adicione tratamento de erro se necessário
      }

      try {
        const userResponse = await fetch(`http://localhost:3001/users/${userId}`);
        const userData = await userResponse.json();
        setUser(userData);

        const achievementsResponse = await fetch(`http://localhost:3001/achievements?userId=${userId}`);
        const achievementsData = await achievementsResponse.json();
        setAchievements(achievementsData);

        const goalsResponse = await fetch(`http://localhost:3001/goals?userId=${userId}`);
        const goalsData = await goalsResponse.json();
        setGoals(goalsData);

        const postsResponse = await fetch(`http://localhost:3001/posts`);
        const postsData = await postsResponse.json();
        setPosts(postsData.filter((post: Post) => post.author === userData.email.split('@')[0]));
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleNewPost = async () => {
    if (newPostContent.trim() === '') return;

    const newPost = {
      id: posts.length + 1,
      author: user?.email.split('@')[0] || 'Anônimo',
      date: new Date().toISOString(),
      content: newPostContent,
    };

    try {
      await fetch('http://localhost:3001/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost),
      });

      setPosts([newPost, ...posts]);
      setNewPostContent('');
    } catch (error) {
      console.error('Erro ao criar novo post:', error);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 bg-gray-100 dark:bg-gray-900 min-h-screen">
        
        {/* Coluna Lateral Direita - Conquistas e Metas */}
        <div className="lg:col-span-1 hidden lg:block">
          <Card className="shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Conquistas</CardTitle>
            </CardHeader>
            <CardContent>
              {achievements.map(achievement => (
                <div key={achievement.id} className="mb-4">
                  <h3 className="font-semibold">{achievement.title}</h3>
                  <p>{achievement.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Metas</CardTitle>
            </CardHeader>
            <CardContent>
              {goals.map(goal => (
                <div key={goal.id} className="mb-4">
                  <h3 className="font-semibold">{goal.title}</h3>
                  <p>{goal.description}</p>
                  <p>Status: {goal.status === "completed" ? "Concluída" : "Em Andamento"}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        
        {/* Feed de Posts */}
        <div className="lg:col-span-2 space-y-4">
          {/* Área de Texto para Criar Novo Post */}
          <Card className="shadow-lg">
            <CardContent>
              <Input
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="No que você está pensando?"
                className="w-full mb-2 -"
              />
              <Button onClick={handleNewPost} className="w-full">Publicar</Button>
            </CardContent>
          </Card>

          {/* Lista de Posts */}
          {posts.map(post => (
            <Card key={post.id} className="shadow-md">
              <CardHeader>
                <CardTitle className="text-sm text-gray-500">{new Date(post.date).toLocaleDateString()}</CardTitle>
              </CardHeader>
              <CardContent>
                {post.image && (
                  <img src={post.image} alt="Post image" className="w-full h-48 object-cover rounded-md mb-4" />
                )}
                <p className="text-gray-800 dark:text-gray-200">{post.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
      </div>
    </div>
  );
}
