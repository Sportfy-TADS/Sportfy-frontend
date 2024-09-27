'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; 
import { Home, User, Trophy, Heart, Settings, BarChart, Activity } from 'lucide-react'; // Importando ícones do lucide-react

interface Post {
  id: number;
  author: string;
  date: string;
  content: string;
  image?: string;
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`);
        const postsData = await postsResponse.json();
        setPosts(postsData);
      } catch (error) {
        console.error('Erro ao buscar posts:', error);
      }
    };

    fetchPosts();
  }, []);

  const handleNewPost = async () => {
    if (newPostContent.trim() === '') return;

    const newPost = {
      id: posts.length + 1,
      author: 'Usuário Atual', // Exemplo, você pode pegar o usuário logado
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

  // Função para postar usando a tecla Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleNewPost();
    }
  };

  // Barra lateral de navegação com ícones (estilo Twitter)
  const Sidebar = () => (
    <nav className="w-full max-w-xs bg-gray-200 dark:bg-gray-800 p-4 rounded-lg shadow-lg">
      <ul className="space-y-6">
        <li className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push('/feed')}>
          <Home className="w-6 h-6 text-blue-500" />
          <span className="text-lg font-semibold">Home</span>
        </li>
        <li className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push('/profile')}>
          <User className="w-6 h-6 text-blue-500" />
          <span className="text-lg font-semibold">Perfil</span>
        </li>
        <li className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push('/goals')}>
          <Activity className="w-6 h-6 text-blue-500" />
          <span className="text-lg font-semibold">Metas</span>
        </li>
        <li className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push('/achievements')}>
          <Trophy className="w-6 h-6 text-blue-500" />
          <span className="text-lg font-semibold">Conquistas</span>
        </li>
        <li className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push('/healthWarning')}>
          <Heart className="w-6 h-6 text-blue-500" />
          <span className="text-lg font-semibold">Saúde</span>
        </li>
        <li className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push('/settings')}>
          <Settings className="w-6 h-6 text-blue-500" />
          <span className="text-lg font-semibold">Configurações</span>
        </li>
      </ul>
    </nav>
  );

  return (
    <div>
      <Header />
      <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 dark:bg-gray-900 p-4 lg:p-6">
        {/* Barra lateral de navegação com ícones */}
        <div className="lg:w-1/4 lg:pr-6">
          <Sidebar />
        </div>

        {/* Feed de Posts */}
        <div className="lg:w-3/4 space-y-4">
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
  );
}
