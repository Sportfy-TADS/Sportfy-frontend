'use client';

import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

interface Post {
  id: number;
  author: string;
  date: string;
  content: string;
  image?: string; // Campo opcional para uma imagem
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const response = await fetch('http://localhost:3001/posts'); // Ajuste a URL conforme necessário
      const data = await response.json();
      setPosts(data);
    };

    fetchPosts();
  }, []);

  return (
    <>
      <Header />

      <div className="health-warning-button">
        <Link href="/healthWarning">
          <Button className="bg-emerald-600 hover:bg-emerald-500">
            Saúde + 
          </Button>
        </Link>
      </div>

      <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Bem-vindo ao Feed!</h1>
        <div className="w-full max-w-2xl space-y-6">
          {posts.map(post => (
            <Card key={post.id} className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{post.author}</span>
                  <span className="text-sm text-gray-500">{new Date(post.date).toLocaleDateString()}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {post.image && (
                  <img src={post.image} alt="Post image" className="w-full h-48 object-cover rounded-md mb-4" />
                )}
                <p className="text-gray-800 dark:text-gray-200">{post.content}</p>
                <Button variant="outline" className="mt-4">Curtir</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
