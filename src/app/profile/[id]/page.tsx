'use client'

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from '@/components/Header';

interface User {
  id: string;
  name: string;
  username: string;
  profileImage: string;
  gender: string;
  email: string;
}

interface Post {
  id: string;
  author: string;
  date: string;
  content: string;
  image?: string;
}

export default function UserProfile() {
  const router = useRouter();
  const { userId } = useParams(); // Pega o ID do usuário buscado da URL
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Carrega os dados do usuário buscado
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const resUser = await fetch(`http://localhost:3001/users/${userId}`);
        const userData = await resUser.json();
        setUser(userData);

        const resPosts = await fetch(`http://localhost:3001/posts?author=${userData.username}`);
        const postsData = await resPosts.json();
        setPosts(postsData);
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      }
      setLoading(false);
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  if (loading) {
    return (
      <div>
        <Header />
        <div className="container mx-auto p-4">
          <div className="space-y-4">
            {/* Skeleton para imagem de capa */}
            <Skeleton className="w-full h-48 bg-gray-300" />

            {/* Skeleton para informações do usuário */}
            <div className="flex items-center space-x-4">
              <Skeleton className="w-24 h-24 rounded-full bg-gray-300" />
              <Skeleton className="h-8 w-48 bg-gray-300" />
              <Skeleton className="h-8 w-32 bg-gray-300" />
            </div>

            {/* Skeleton para posts */}
            <Skeleton className="w-full h-32 bg-gray-300" />
            <Skeleton className="w-full h-32 bg-gray-300" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="container mx-auto p-4">
        {/* Imagem de capa e perfil */}
        <div className="relative mb-6">
          <div className="w-full h-48 bg-gray-300 dark:bg-gray-700 rounded-lg" />
          <div className="absolute -bottom-12 left-4">
            <img
              src={user?.profileImage || 'https://via.placeholder.com/150'}
              alt={user?.name}
              className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-900"
            />
          </div>
        </div>

        {/* Informações do usuário */}
        <div className="flex items-center space-x-4 mb-6">
          <h1 className="text-2xl font-bold">{user?.name}</h1>
          <p className="text-gray-500">@{user?.username}</p>
          <Button onClick={() => router.push(`/profile/${userId}/edit`)}>Editar Perfil</Button>
        </div>

        {/* Feed de posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.length > 0 ? (
            posts.map((post) => (
              <Card key={post.id} className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-sm text-gray-500">
                    {new Date(post.date).toLocaleDateString()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {post.image && (
                    <img
                      src={post.image}
                      alt="Post image"
                      className="w-full h-48 object-cover rounded-md mb-4"
                    />
                  )}
                  <p className="text-gray-800 dark:text-gray-200">{post.content}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center col-span-full text-gray-700 dark:text-gray-300">Nenhum post encontrado.</p>
          )}
        </div>
      </div>
    </div>
  );
}
