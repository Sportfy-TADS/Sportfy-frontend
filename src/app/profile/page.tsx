'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea"; 
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; 
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

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
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const academicoId = localStorage.getItem('academicoId');
      if (!academicoId) return;

      try {
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/academico/consultar/${academicoId}`);
        if (!userResponse.ok) throw new Error("Erro ao buscar dados do acadêmico");
        const userData = await userResponse.json();
        setUser(userData);

        const achievementsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/conquistas?academicoId=${academicoId}`);
        if (!achievementsResponse.ok) throw new Error("Erro ao buscar conquistas");
        const achievementsData = await achievementsResponse.json();
        setAchievements(achievementsData);

        const goalsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/metas?userId=${academicoId}`);
        if (!goalsResponse.ok) throw new Error("Erro ao buscar metas");
        const goalsData = await goalsResponse.json();
        setGoals(goalsData);

        const postsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts?author=${userData.username}`);
        if (!postsResponse.ok) throw new Error("Erro ao buscar posts");
        const postsData = await postsResponse.json();
        setPosts(postsData);

        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao buscar dados do acadêmico:', error);
        setIsLoading(false);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleNewPost();
    }
  };

  return (
    <div>
      <Header />
      <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 dark:bg-gray-900 p-4 lg:p-6">
        <div className="lg:w-1/4 lg:pr-6">
          <Sidebar />
        </div>

        <div className="lg:w-3/4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card className="shadow-lg">
              <CardHeader className="flex items-center space-x-4">
                {isLoading ? (
                  <>
                    <Skeleton className="w-20 h-20 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-8 w-20 mt-2" />
                    </div>
                  </>
                ) : (
                  <>
                    <Avatar className="w-20 h-20">
                      {user?.profileImage ? (
                        <AvatarImage src={user.profileImage} alt="Profile Image" />
                      ) : (
                        <AvatarFallback>{user?.username.charAt(0)}</AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl font-bold">{user?.username}</CardTitle>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                      <Button onClick={() => router.push('/profile/edit')} className="mt-2 bg-blue-500 hover:bg-blue-600 text-white">
                        Editar Perfil
                      </Button>
                    </div>
                  </>
                )}
              </CardHeader>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Conquistas</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading
                  ? Array(3).fill(null).map((_, index) => (
                      <Skeleton key={index} className="h-6 w-full mb-2" />
                    ))
                  : achievements.map(achievement => (
                      <div key={achievement.id} className="mb-2">
                        <h3 className="font-semibold">{achievement.title}</h3>
                        <p className="text-sm">{achievement.description}</p>
                      </div>
                    ))
                }
                <Link href="/achievements">Conquistas</Link>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Metas</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading
                  ? Array(2).fill(null).map((_, index) => (
                      <Skeleton key={index} className="h-6 w-full mb-2" />
                    ))
                  : goals.map(goal => (
                      <div key={goal.id} className="mb-2">
                        <h3 className="font-semibold">{goal.title}</h3>
                        <p className="text-sm">{goal.description}</p>
                        <p className="text-sm">Status: {goal.status === "completed" ? "Concluída" : "Em Andamento"}</p>
                      </div>
                    ))
                }
                <Link href="/profile/goals">Ver Metas</Link>
              </CardContent>
            </Card>
          </div>

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

            {isLoading
              ? Array(3).fill(null).map((_, index) => (
                  <Card key={index} className="shadow-md">
                    <CardHeader>
                      <Skeleton className="h-4 w-24 mb-2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full mb-4" />
                    </CardContent>
                  </Card>
                ))
              : posts.map(post => (
                  <Card key={post.id} className="shadow-md">
                    <CardHeader>
                      <CardTitle className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(post.date).toLocaleString('pt-BR')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-2">{post.content}</p>
                      {post.image && (
                        <Image src={post.image} alt="Post Image" width={500} height={300} className="rounded-md mb-2" />
                      )}
                    </CardContent>
                  </Card>
                ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}
