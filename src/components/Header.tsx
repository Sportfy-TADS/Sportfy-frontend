'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from 'lucide-react';
import { ModeToggle } from './theme';

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [userName, setUserName] = useState(''); // Nome do usuário
  const [userImage, setUserImage] = useState(''); // URL da imagem de perfil do usuário

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setIsLoggedIn(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:3001/users/${userId}`);
        if (response.ok) {
          const userData = await response.json();
          setUserName(userData.name);
          setUserImage(userData.profileImage);
        } else {
          console.error('Erro ao buscar dados do usuário:', response.statusText);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('userId');
    router.push('/auth');
  };

  const goToFeed = () => {
    router.push('/feed');
  };

  const goToProfile = () => {
    router.push('/profile');
  };

  const goToSettings = () => {
    router.push('/settings');
  };

  const goToAchievements = () => {
    router.push('/achievements');
  };

  const goToHealth = () => {
    router.push('/healthWarning');
  };

  const goToGoals = () => {
    router.push('/goals');
  };

  // Função para pegar as iniciais do nome
  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('');
  };

  return (
    <header className="w-full p-4 flex justify-between items-center bg-gray-300 text-black dark:bg-gray-900 dark:text-white shadow-md">
      <h1 className="text-xl font-bold" onClick={goToFeed}>Sportfy</h1>
      {isLoggedIn && (
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer w-10 h-10 rounded-lg">
                {userImage ? (
                  <AvatarImage src={userImage} />
                ) : (
                  <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                )}
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white text-black dark:bg-gray-800 dark:text-white border border-gray-200 shadow-lg w-56 rounded-md">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={goToProfile}>Perfil</DropdownMenuItem>
              <DropdownMenuItem onClick={goToSettings}>Configurações</DropdownMenuItem>
              <DropdownMenuItem onClick={goToAchievements}>Conquistas</DropdownMenuItem>
              <DropdownMenuItem onClick={goToGoals}>Metas</DropdownMenuItem>
              <DropdownMenuItem onClick={goToHealth}>Saúde</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                Logout
                <LogOut className="ml-2" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </header>
  );
}
