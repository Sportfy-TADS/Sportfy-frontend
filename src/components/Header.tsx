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
import { ModeToggle } from './theme'; 

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('userId');
    router.push('/auth');
  };

  const goToProfile = () => {
    router.push('/profile/edit');
  };

  const goToSettings = () => {
    router.push('/settings');
  };

  const goToAchievements = () => {
    router.push('/achievements');
  };

  const goToGoals = () => {
    router.push('/goals'); // Nova rota para metas
  };

  return (
    <header className="w-full bg-blue-600 p-4 text-white flex justify-between items-center dark:bg-gray-900">
      <h1 className="text-xl font-bold">Sportfy</h1>
      {isLoggedIn && (
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white text-black dark:bg-gray-800 dark:text-white">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={goToProfile}>Perfil</DropdownMenuItem>
              <DropdownMenuItem onClick={goToSettings}>Configurações</DropdownMenuItem>
              <DropdownMenuItem onClick={goToAchievements}>Conquistas</DropdownMenuItem>
              <DropdownMenuItem onClick={goToGoals}>Metas</DropdownMenuItem> {/* Opção de metas */}
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
