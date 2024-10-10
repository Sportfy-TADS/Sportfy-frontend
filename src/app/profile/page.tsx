'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';  // Importando Sidebar
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea"; 
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; 
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  username: string;
  email: string;
  gender?: string;
  profileImage?: string;
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
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      try {
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`);
        const userData = await userResponse.json();
        setUser(userData);

        const achievementsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/achievements?userId=${userId}`);
        const achievementsData = await achievementsResponse.json();
        setAchievements(achievementsData);

        const goalsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/goals?userId=${userId}`);
        const goalsData = await goalsResponse.json();
        setGoals(goalsData);

        const postsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`);
        const postsData = await postsResponse.json();
        setPosts(postsData.filter((post: Post) => post.author === userData.username));
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
      author: user?.username || 'Anônimo',
      date: new Date().toISOString(),
      content: newPostContent,
    };

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
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

  // Função para publicar o conteúdo ao pressionar "Enter"
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleNewPost();
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
      <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 dark:bg-gray-900 p-4 lg:p-6">
        {/* Barra lateral de navegação */}
        <div className="lg:w-1/4 lg:pr-6">
          <Sidebar /> {/* Usando o Sidebar */}
        </div>

        {/* Conteúdo do perfil */}
        <div className="lg:w-3/4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card className="shadow-lg">
              <CardHeader className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  {user.profileImage ? (
                    <AvatarImage src={user.profileImage} alt="Profile Image" />
                  ) : (
                    <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <CardTitle className="text-xl font-bold">{user.username}</CardTitle>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="text-sm text-gray-500">{user.gender?.charAt(0).toUpperCase() + user.gender?.slice(1)}</p>
                </div>
              </CardHeader>
            </Card>

            {/* Conquistas */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Conquistas</CardTitle>
              </CardHeader>
              <CardContent>
                {achievements.map(achievement => (
                  <div key={achievement.id} className="mb-2">
                    <h3 className="font-semibold">{achievement.title}</h3>
                    <p className="text-sm">{achievement.description}</p>
                  </div>
                ))}
                <Link href="/profile/tournament" >Conquistas</Link>
              </CardContent>
            </Card>

            {/* Competições */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Competições</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href="/profile/tournament" >Ver Competição</Link>
              </CardContent>
            </Card>

            {/* Metas */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Metas</CardTitle>
              </CardHeader>
              <CardContent>
                {goals.map(goal => (
                  <div key={goal.id} className="mb-2">
                    <h3 className="font-semibold">{goal.title}</h3>
                    <p className="text-sm">{goal.description}</p>
                    <p className="text-sm">Status: {goal.status === "completed" ? "Concluída" : "Em Andamento"}</p>
                  </div>
                ))}
                <Link href="/profile/goals" >Ver Metas</Link>
              </CardContent>
            </Card>
          </div>

          {/* Feed de Posts */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="shadow-lg">
              <CardContent>
                <Textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="No que você está pensando?"
                  className="w-full mb-2 p-4 border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={handleKeyDown}
                  rows={4}
                />
                <Button onClick={handleNewPost} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                  Publicar
                </Button>
              </CardContent>
            </Card>

            {posts.map(post => (
              <Card key={post.id} className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(post.date).toLocaleDateString()}
                  </CardTitle>
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
    </div>
  );
}
