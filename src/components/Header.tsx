'use client';

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
import { Input } from "@/components/ui/input";
import { LogOut } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [userName, setUserName] = useState(''); // Nome do acadêmico logado
  const [userImage, setUserImage] = useState(''); // URL da imagem de perfil do acadêmico logado
  const [searchTerm, setSearchTerm] = useState(''); // Para armazenar o valor da busca
  const [searchResults, setSearchResults] = useState<any[]>([]); // Resultados da busca

  // Carregar os dados do acadêmico logado
  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem('academicoId');
      console.log("ID do usuário logado no localStorage:", userId); // Verificar se o userId foi recuperado corretamente

      if (!userId) {
        setIsLoggedIn(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/academico/consultar/${userId}`);
        if (response.ok) {
          const userData = await response.json();
          console.log("Dados do usuário logado:", userData); // Verificar os dados do usuário
          setUserName(userData.nome);
          setUserImage(userData.foto || ''); // Definir uma URL de imagem ou deixar vazio se não houver
        } else {
          console.error('Erro ao buscar dados do acadêmico:', response.statusText);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do acadêmico:', error);
      }
    };

    fetchUserData();
  }, []);

  // Função para realizar a busca de acadêmicos
  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length > 2) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/academico/listar?nome_like=${term}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
        }
      } catch (error) {
        console.error('Erro ao buscar acadêmicos:', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  // Redireciona para o perfil de um acadêmico
  const handleUserSelect = (userId: string) => {
    setSearchResults([]);
    router.push(`/profile/${userId}`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('token'); // Remove o token JWT
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('academicoId');
    router.push('/auth');
  };

  const goToFeed = () => {
    router.push('/feed');
  };

  // Função para pegar as iniciais do nome
  const getInitials = (name: string) => {
    console.log("Nome recebido para as iniciais:", name); // Verifique o nome recebido
    if (!name) return ''; // Evita erro caso o nome não esteja disponível
    return name.split(' ').map((n) => n[0]).join('');
  };

  return (
    <header className="w-full p-4 flex justify-between items-center bg-gray-300 text-black dark:bg-gray-900 dark:text-white shadow-md">
      <h1 className="text-xl font-bold cursor-pointer" onClick={goToFeed}>Sportfy</h1>

      {/* Campo de busca */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Buscar acadêmico..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-64"
        />
        {searchResults.length > 0 && (
          <div className="absolute bg-white dark:bg-gray-800 text-black dark:text-white mt-2 w-full max-h-60 overflow-y-auto shadow-lg rounded-md">
            {searchResults.map((user) => (
              <div
                key={user.id}
                onClick={() => handleUserSelect(user.id)}
                className="px-4 py-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {user.nome} ({user.username})
              </div>
            ))}
          </div>
        )}
      </div>

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
              <DropdownMenuItem onClick={() => router.push('/profile')}>Perfil</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')}>Configurações</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/achievements')}>Conquistas</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/goals')}>Metas</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/healthWarning')}>Saúde</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/championships')}>Campeonatos</DropdownMenuItem> {/* Nova opção para Campeonato */}
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
