'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Sidebar from '@/components/Sidebar';  // Importando o Sidebar

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

  return (
    <div>
      <Header />
      <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 dark:bg-gray-900 p-4 lg:p-6">
        {/* Barra lateral de navegação com ícones */} 
        <div className="lg:w-1/4 lg:pr-6">
          <Sidebar /> {/* Utilizando o Sidebar */}
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
