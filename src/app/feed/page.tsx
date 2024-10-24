'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';  
import { Textarea } from "@/components/ui/textarea"; 
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';  

interface Comment {
  idComentario: number;
  descricao: string;
  Usuario: {
    idUsuario: number;
    username: string;
  };
  listaUsuarioCurtida: number[];
}

interface Post {
  idPublicacao: number;
  titulo: string;
  descricao: string;
  Usuario: {
    idUsuario: number;
    username: string;
  };
  listaUsuarioCurtida: number[];
  listaComentario: Comment[];
}

interface User {
  idUsuario: number;
  username: string;
}

export default function FeedPage() {
  const [canal, setCanal] = useState<Post[]>([]);  
  const [newPostTitle, setNewPostTitle] = useState('');  
  const [newPostContent, setNewPostContent] = useState('');
  const [newCommentContent, setNewCommentContent] = useState<{ [key: number]: string }>({}); 
  const [openComments, setOpenComments] = useState<{ [key: number]: boolean }>({}); 
  const [loggedUser, setLoggedUser] = useState<User | null>(null); 
  const [loading, setLoading] = useState(true); 
  const router = useRouter();

  // Carregar os dados do usuário logado
  useEffect(() => {
    console.log('Iniciando o carregamento do usuário logado...');
    const storedUser = localStorage.getItem('loggedUser');
    
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        console.log('Usuário logado encontrado:', parsedUser);
        setLoggedUser(parsedUser);
      } catch (error) {
        console.error('Erro ao analisar dados do usuário logado:', error);
      }
    } else {
      console.error('Erro: Nenhum usuário logado encontrado no localStorage');
      router.push('/auth'); // Redirecionar para a página de login se o usuário não estiver logado
    }
  }, [router]);

  // Carregar os dados do canal
  useEffect(() => {
    const fetchChannelData = async () => {
      console.log('Iniciando o carregamento dos dados do canal...');
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/canal/listar`);
        const channelData = await response.json();

        console.log('Dados do canal recebidos:', channelData);
        if (channelData && channelData.length > 0) {
          setCanal(channelData[0].listaPublicacao || []);
        } else {
          console.error('Nenhum dado do canal encontrado.');
        }
      } catch (error) {
        console.error('Erro ao buscar dados do canal:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChannelData();
  }, []);

  // Adiciona um novo post
  const handleNewPost = async () => {
    if (newPostContent.trim() === '' || newPostTitle.trim() === '') return;

    if (!loggedUser) {
      console.error('Erro: Usuário não logado');
      return;
    }

    const newPost = {
      idPublicacao: canal.length + 1,
      titulo: newPostTitle,
      descricao: newPostContent,
      Usuario: { idUsuario: loggedUser.idUsuario, username: loggedUser.username },
      listaUsuarioCurtida: [],
      listaComentario: [],
    };

    console.log('Tentando criar um novo post:', newPost);

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cadastrarPublicacao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost),
      });

      setCanal([newPost, ...canal]);
      setNewPostContent('');
      setNewPostTitle('');
      console.log('Novo post criado com sucesso.');
    } catch (error) {
      console.error('Erro ao criar novo post:', error);
    }
  };

  if (loading) {
    // Skeleton Loading
    return (
      <div>
        <Header />
        <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 dark:bg-gray-900 p-4 lg:p-6">
          <div className="lg:w-1/4 lg:pr-6">
            <Sidebar />
          </div>

          <div className="lg:w-3/4 space-y-4">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="border-b border-gray-300 dark:border-gray-700 py-4 animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!canal.length) {
    return <div>Nenhuma publicação disponível.</div>;
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
            <Button onClick={handleNewPost} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
              Publicar
            </Button>
          </div>

          {/* Lista de Posts */}
          {canal.map(post => (
            <div key={post.idPublicacao} className="border-b border-gray-300 dark:border-gray-700 py-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <img
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
