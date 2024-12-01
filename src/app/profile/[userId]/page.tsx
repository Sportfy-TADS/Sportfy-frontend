'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Skeleton } from "@/components/ui/skeleton";
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

interface Sport {
  id: string;
  name: string;
  description: string;
  schedule: string;
  location: string;
}

interface Post {
  id: string;
  author: string;
  date: string;
  content: string;
  image?: string;
}

interface Match {
  id: string;
  sport: string;
  opponent: string;
  date: string;
  result: string;
}

export default function UserProfile() {
  const { userId } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      console.error('ID do usuário não encontrado.');
      return;
    }

    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Buscar dados do usuário
        const resUser = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`);
        if (!resUser.ok) {
          throw new Error('Falha ao carregar o perfil do usuário.');
        }
        const userData = await resUser.json();
        setUser(userData);

        // Buscar posts do usuário
        const resPosts = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts?author=${userData.username}`);
        const postsData = await resPosts.json();
        setPosts(postsData);

        // Buscar modalidades do usuário
        const resSports = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sports?userId=${userId}`);
        const sportsData = await resSports.json();
        setSports(sportsData);

        // Buscar histórico de partidas do usuário
        const resMatches = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches?userId=${userId}`);
        const matchesData = await resMatches.json();
        setMatches(matchesData);
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      }
      setLoading(false);
    };

    fetchUserData();
  }, [userId]);

  if (loading) {
    return (
      <div>
        <Header />
        <div className="container mx-auto p-4">
          <div className="space-y-4">
            <Skeleton className="w-full h-48 bg-gray-300" />
            <Skeleton className="w-24 h-24 rounded-full bg-gray-300" />
            <Skeleton className="h-8 w-48 bg-gray-300" />
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
        {/* Perfil do Usuário */}
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
        <div className="flex flex-col items-start space-y-4 mb-6">
          <h1 className="text-2xl font-bold">{user?.name}</h1>
          <p className="text-gray-500">@{user?.username}</p>
          <p className="text-gray-600 dark:text-gray-300"><strong>Email:</strong> {user?.email}</p>
          <p className="text-gray-600 dark:text-gray-300"><strong>Gênero:</strong> {user?.gender}</p>
        </div>

        {/* Modalidades Inscritas (HU15) */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Modalidades Inscritas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sports.length > 0 ? (
              sports.map((sport) => (
                <Card key={sport.id} className="shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">{sport.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-800 dark:text-gray-200 mb-2">{sport.description}</p>
                    <p className="text-gray-600 dark:text-gray-400"><strong>Horário:</strong> {sport.schedule}</p>
                    <p className="text-gray-600 dark:text-gray-400"><strong>Local:</strong> {sport.location}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-gray-600 dark:text-gray-300">Nenhuma modalidade inscrita.</p>
            )}
          </div>
        </div>

        {/* Histórico de Partidas (HU16) */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Histórico de Partidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.length > 0 ? (
              matches.map((match) => (
                <Card key={match.id} className="shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">{match.sport}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-800 dark:text-gray-200 mb-2"><strong>Oponente:</strong> {match.opponent}</p>
                    <p className="text-gray-600 dark:text-gray-400"><strong>Data:</strong> {new Date(match.date).toLocaleDateString()}</p>
                    <p className="text-gray-600 dark:text-gray-400"><strong>Resultado:</strong> {match.result}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-gray-600 dark:text-gray-300">Nenhuma partida encontrada.</p>
            )}
          </div>
        </div>

        {/* Postagens do Usuário (HU17) */}
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