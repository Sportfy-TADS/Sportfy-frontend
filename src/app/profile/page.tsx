  'use client';

  import { useState, useEffect } from 'react';
  import Header from '@/components/Header';
  import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
  import { Input } from "@/components/ui/input";
  import { Button } from "@/components/ui/button";
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; 
  import { useRouter } from 'next/navigation';

  interface User {
    id: string;
    username: string;
    email: string;
    gender?: string;
    profileImage?: string;
  }

  interface Achievement {
    id: number;
    userId: string;
    title: string;
    description: string;
  }

  interface Goal {
    id: number;
    title: string;
    description: string;
    status: string;
    userId: string;
  }

  interface Post {
    id: number;
    author: string;
    date: string;
    content: string;
    image?: string;
  }

  export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPostContent, setNewPostContent] = useState('');
    const router = useRouter();

    useEffect(() => {
      const fetchUserData = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          return;
        }

        try {
          const userResponse = await fetch(`http://localhost:3001/users/${userId}`);
          const userData = await userResponse.json();
          setUser(userData);

          const achievementsResponse = await fetch(`http://localhost:3001/achievements?userId=${userId}`);
          const achievementsData = await achievementsResponse.json();
          setAchievements(achievementsData);

          const goalsResponse = await fetch(`http://localhost:3001/goals?userId=${userId}`);
          const goalsData = await goalsResponse.json();
          setGoals(goalsData);

          const postsResponse = await fetch(`http://localhost:3001/posts`);
          const postsData = await postsResponse.json();
          setPosts(postsData.filter((post: Post) => post.author === userData.username));
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
        }
      };

      fetchUserData();
    }, []);

    const handleNewPost = async () => {
      if (newPostContent.trim() === '') return;

      const newPost = {
        id: posts.length + 1,
        author: user?.username || 'Anônimo',
        date: new Date().toISOString(),
        content: newPostContent,
      };

      try {
        await fetch(`http://localhost:3001/posts/${user}`, {
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

    const handleEditProfile = () => {
      router.push('/profile/edit');
    };

    if (!user) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <p>Carregando...</p>
        </div>
      );
    }

    return (
      <div>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4 lg:p-6">
          <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Seção de informações do usuário */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="shadow-lg">
                <CardHeader className="flex items-center space-x-4">
                  <Avatar className="w-20 h-20">
                    {user.profileImage ? (
                      <AvatarImage src={user.profileImage} alt="Profile Image" />
                    ) : (
                      <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl font-bold">{user.username}</CardTitle>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-sm text-gray-500">{user.gender?.charAt(0).toUpperCase() + user.gender?.slice(1)}</p>
                    <Button onClick={handleEditProfile} className="mt-2">Editar Perfil</Button>
                  </div>
                </CardHeader>
              </Card>

              {/* Conquistas */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Conquistas</CardTitle>
                </CardHeader>
                <CardContent>
                  {achievements.map(achievement => (
                    <div key={achievement.id} className="mb-2">
                      <h3 className="font-semibold">{achievement.title}</h3>
                      <p className="text-sm">{achievement.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Metas */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Metas</CardTitle>
                </CardHeader>
                <CardContent>
                  {goals.map(goal => (
                    <div key={goal.id} className="mb-2">
                      <h3 className="font-semibold">{goal.title}</h3>
                      <p className="text-sm">{goal.description}</p>
                      <p className="text-sm">Status: {goal.status === "completed" ? "Concluída" : "Em Andamento"}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Feed de Posts */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="shadow-lg">
                <CardContent>
                  <Input
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="No que você está pensando?"
                    className="w-full mb-2"
                  />
                  <Button onClick={handleNewPost} className="w-full">Publicar</Button>
                </CardContent>
              </Card>

              {posts.map(post => (
                <Card key={post.id} className="shadow-md">
                  <CardHeader>
                    <CardTitle className="text-sm text-gray-500">{new Date(post.date).toLocaleDateString()}</CardTitle>
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
      </div>
    );
  }
