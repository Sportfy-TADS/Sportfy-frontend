'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';  
import { Textarea } from "@/components/ui/textarea"; 
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import {jwtDecode} from 'jwt-decode';
import { User, Post } from '@/interface/types';

export default function FeedPage() {
  const [canal, setCanal] = useState<Post[]>([]);  
  const [newPostTitle, setNewPostTitle] = useState('');  
  const [newPostContent, setNewPostContent] = useState('');
  const [loggedUser, setLoggedUser] = useState<User | null>(null); 
  const [loading, setLoading] = useState(true); 
  const router = useRouter();

  // Carregar os dados do usuário logado
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Erro: Nenhum usuário logado encontrado no localStorage');
        router.push('/auth');
        return;
      }

      const decoded: User = jwtDecode(token);
      setLoggedUser(decoded);

      const userId = decoded.idUsuario;
      let userEndpoint = '';

      // Escolhe o endpoint correto com base no tipo de usuário
      if (decoded.role === 'ADMINISTRADOR') {
        userEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/administrador/listar`;
      } else if (decoded.role === 'ACADEMICO') {
        userEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/academico/consultar/${userId}`;
      }

      try {
        const response = await fetch(userEndpoint);
        if (response.ok) {
          const userData = await response.json();
          setLoggedUser(userData);
        } else {
          console.error('Falha ao buscar os dados do usuário:', response.statusText);
          router.push('/auth');
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário logado:', error);
        router.push('/auth');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <Header />
      <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 dark:bg-gray-900 p-4 lg:p-6">
        <div className="lg:w-1/4 lg:pr-6">
          <Sidebar />
        </div>

        <div className="lg:w-3/4 space-y-4">
          <div className="bg-transparent mb-4">
            <Textarea
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              placeholder="Título do post"
              className="w-full p-4 mb-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={1}
            />
            <Textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="No que você está pensando?"
              className="w-full p-4 mb-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
              Publicar
            </Button>
          </div>

          {/* Posts */}
          {canal.map(post => (
            <div key={post.idPublicacao} className="border-b border-gray-300 dark:border-gray-700 py-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Image
                    src={`https://via.placeholder.com/50`}
                    alt="Avatar"
                    className="w-12 h-12 rounded-full"
                  />
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-bold">{post.Usuario.username}</span> • {new Date(post.idPublicacao).toLocaleDateString()}
                  </div>
                  <h3 className="font-semibold mt-2">{post.titulo}</h3>
                  <p className="text-gray-800 dark:text-gray-200 mt-2">
                    {post.descricao}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
