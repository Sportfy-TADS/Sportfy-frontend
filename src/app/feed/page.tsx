'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';  // Importando Sidebar
import { Textarea } from "@/components/ui/textarea"; 
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';  // Ícone para curtidas

interface Comment {
  id: number;
  postId: number;
  author: string;
  content: string;
  likes: number;
  likedByCurrentUser?: boolean; // Para verificar se o usuário atual já curtiu
}

interface Post {
  id: number;
  author: string;
  date: string;
  content: string;
  image?: string;
  comments: Comment[];
  likes: number;
  likedByCurrentUser?: boolean; // Para verificar se o usuário atual já curtiu
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [newCommentContent, setNewCommentContent] = useState<{ [key: number]: string }>({});
  const router = useRouter();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`);
        const postsData = await postsResponse.json();

        // Garante que todos os posts tenham uma lista de comentários e inicializa as curtidas
        const postsWithComments = postsData.map((post: Post) => ({
          ...post,
          comments: post.comments || [], // Inicializa como lista vazia se estiver indefinido
          likes: post.likes || 0, // Garante que likes seja um número
        }));

        setPosts(postsWithComments);
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
      comments: [], // Inicializa a lista de comentários
      likes: 0, // Inicializa curtidas
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

  const handleNewComment = async (postId: number) => {
    if (!newCommentContent[postId]?.trim()) return;

    const newComment = {
      id: Date.now(),
      postId,
      author: 'Usuário Atual',
      content: newCommentContent[postId],
      likes: 0, // Inicializa curtidas do comentário
      likedByCurrentUser: false, // Inicializa como não curtido pelo usuário
    };

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComment),
      });

      setPosts(posts.map(post => 
        post.id === postId
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      ));
      setNewCommentContent({ ...newCommentContent, [postId]: '' });
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
    }
  };

  const handleLikePost = async (postId: number) => {
    const updatedPosts = posts.map(post =>
      post.id === postId ? { ...post, likes: post.likes + 1, likedByCurrentUser: true } : post
    );
    setPosts(updatedPosts);

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/like`, { method: 'POST' });
    } catch (error) {
      console.error('Erro ao curtir post:', error);
    }
  };

  const handleLikeComment = async (postId: number, commentId: number) => {
    const updatedPosts = posts.map(post => 
      post.id === postId
        ? {
            ...post,
            comments: post.comments.map(comment =>
              comment.id === commentId ? { ...comment, likes: comment.likes + 1, likedByCurrentUser: true } : comment
            )
          }
        : post
    );
    setPosts(updatedPosts);

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/${commentId}/like`, { method: 'POST' });
    } catch (error) {
      console.error('Erro ao curtir comentário:', error);
    }
  };

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
          {/* Publicação de Novo Post */}
          <div className="bg-transparent mb-4">
            <Textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="No que você está pensando?"
              className="w-full p-4 mb-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleNewPost())}
              rows={4}
            />
            <Button onClick={handleNewPost} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
              Publicar
            </Button>
          </div>

          {/* Lista de Posts */}
          {posts.map(post => (
            <div key={post.id} className="border-b border-gray-300 dark:border-gray-700 py-4">
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
                    <span className="font-bold">{post.author}</span> • {new Date(post.date).toLocaleDateString()}
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 mt-2">
                    {post.content}
                  </p>
                  {post.image && (
                    <img
                      src={post.image}
                      alt="Post image"
                      className="mt-4 rounded-lg max-h-80 object-cover"
                    />
                  )}

                  {/* Curtir Post */}
                  <div className="mt-2 flex items-center space-x-2">
                    <Button onClick={() => handleLikePost(post.id)} variant="ghost">
                      <Heart className="w-5 h-5 text-red-500" /> Curtir {post.likes}
                    </Button>
                  </div>

                  {/* Comentários */}
                  <div className="mt-4 space-y-2">
                    {post.comments.map(comment => (
                      <div key={comment.id} className="border-t border-gray-200 dark:border-gray-700 pt-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold">{comment.author}</span>
                          <Button onClick={() => handleLikeComment(post.id, comment.id)} variant="ghost" className="text-sm">
                            <Heart className="w-4 h-4 text-red-500" /> Curtir {comment.likes}
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{comment.content}</p>
                      </div>
                    ))}
                  </div>

                  {/* Adicionar Comentário */}
                  <div className="mt-4">
                    <Textarea
                      value={newCommentContent[post.id] || ''}
                      onChange={(e) => setNewCommentContent({ ...newCommentContent, [post.id]: e.target.value })}
                      placeholder="Adicione um comentário..."
                      className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none"
                    />
                    <Button onClick={() => handleNewComment(post.id)} className="mt-2 w-full bg-green-500 hover:bg-green-600">
                      Comentar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
