'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import Header from '@/components/Header';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Trash2 } from 'lucide-react'; // Ícone de lixeira para remover posts

interface Post {
  id: number;
  author: string;
  date: string;
  content: string;
  image?: string;
}

export default function FeedPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        router.push('/auth'); // Redireciona para login se não houver ID do usuário
        return;
      }

      try {
        // Verifica se o usuário é administrador
        const userResponse = await fetch(`http://localhost:3001/users/${userId}`);
        const userData = await userResponse.json();
        setIsAdmin(userData.isAdmin);

        // Carrega os posts do feed
        const postsResponse = await fetch('http://localhost:3001/posts');
        const postsData = await postsResponse.json();
        setPosts(postsData);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    fetchUserData();
  }, [router]);

  // Função para remover um post (somente administradores)
  const handleRemovePost = async (postId: number) => {
    if (!isAdmin) return;

    try {
      await fetch(`http://localhost:3001/posts/${postId}`, {
        method: 'DELETE',
      });

      // Remove o post localmente
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Erro ao remover o post:', error);
    }
  };

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <h1 className="text-2xl font-bold text-black dark:text-white mb-4">Bem-vindo ao Feed!</h1>
        
        {/* Lista de Posts */}
        {posts.map(post => (
          <Card key={post.id} className="w-full max-w-xl mb-4">
            <CardHeader>
              <CardTitle className="text-gray-700 dark:text-gray-300">{post.author}</CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(post.date).toLocaleDateString()}</p>
            </CardHeader>
            <CardContent>
              {post.image && (
                <img src={post.image} alt="Post image" className="w-full h-48 object-cover rounded-md mb-4" />
              )}
              <p className="text-gray-800 dark:text-gray-200">{post.content}</p>
            </CardContent>

            {/* Exibir botão de remover se o usuário for admin */}
            {isAdmin && (
              <CardFooter className="flex justify-end">
                <Button
                  variant="destructive"
                  onClick={() => handleRemovePost(post.id)}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Remover Post
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}
