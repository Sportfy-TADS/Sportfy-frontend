'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";  // Importando Textarea para melhorar o campo de texto
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Header from '@/components/Header';

const userId = localStorage.getItem('userId');

interface Post {
  id: number;
  author: string;
  date: string;
  content: string;
  image?: string;
}

interface User {
  id: string;
  username: string;
  profileImage?: string;
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [user, setUser] = useState<User | null>(null);

  // Carregar os dados do usuário logado
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`);
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      }
    };

    fetchUserData();
  }, []);

  // Carregar os posts do feed
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`);
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Erro ao carregar posts:", error);
      }
    };

    fetchPosts();
  }, []);

  // Função para criar um novo post
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

  // Função para pegar as iniciais do nome do usuário
  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('');
  };

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100 dark:bg-gray-900">
        <div className="w-full max-w-3xl space-y-6">
          {/* Campo para criar um novo post */}
          <Card className="mb-6 shadow-lg">
            <CardContent className="flex space-x-4">
              <Avatar className="w-12 h-12">
                {user?.profileImage ? (
                  <AvatarImage src={user.profileImage} />
                ) : (
                  <AvatarFallback>{getInitials(user?.username || 'Anônimo')}</AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="O que está acontecendo?"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="w-full resize-none p-4 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
                <Button
                  onClick={handleNewPost}
                  className="mt-2 w-full bg-blue-500 text-white hover:bg-blue-600"
                >
                  Publicar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Listagem de posts estilo Twitter */}
          {posts.map((post) => (
            <Card key={post.id} className="mb-4 shadow-md">
              <CardHeader className="flex items-start space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback>{getInitials(post.author)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg font-bold">{post.author}</CardTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(post.date).toLocaleDateString()} {new Date(post.date).toLocaleTimeString()}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">{post.content}</p>
                {post.image && (
                  <img src={post.image} alt="Post image" className="mt-4 rounded-md" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
