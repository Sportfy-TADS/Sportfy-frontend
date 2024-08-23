'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
import { ModeToggle } from './theme'; // Certifique-se de que este componente existe

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Atualize com a lógica de autenticação real

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('userId'); // Limpa o ID do usuário ao sair
    router.push('/auth'); // Redireciona para a página de login
  };

  const goToProfile = () => {
    router.push('/profile/edit'); // Redireciona para a página de edição de perfil
  };

  const goToSettings = () => {
    router.push('/settings'); // Redireciona para a página de configurações
  };

  return (
    <header className="w-full bg-blue-600 p-4 text-white flex justify-between items-center dark:bg-gray-900">
      <h1 className="text-xl font-bold">Sportfy</h1>
      {isLoggedIn && (
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar>
                <AvatarImage src="https://github.com/IamThiago-IT.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white text-black dark:bg-gray-800 dark:text-white">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={goToProfile}>Perfil</DropdownMenuItem>
              <DropdownMenuItem onClick={goToSettings}>Configurações</DropdownMenuItem>
              <DropdownMenuItem><ModeToggle /></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                Logout
                <LogOut />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </header>
  );
}
