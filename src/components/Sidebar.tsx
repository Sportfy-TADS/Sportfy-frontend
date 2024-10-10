'use client';

import { useRouter } from 'next/navigation';
import { Home, User, Trophy, Heart, Settings, Activity } from 'lucide-react'; // Ícones do lucide-react

const Sidebar = () => {
  const router = useRouter();

  return (
    <nav className="w-full max-w-xs bg-gray-200 dark:bg-gray-800 p-4 rounded-lg shadow-lg">
      <ul className="space-y-6">
        <li className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push('/feed')}>
          <Home className="w-6 h-6 text-blue-500" />
          <span className="text-lg font-semibold">Home</span>
        </li>
        <li className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push('/profile')}>
          <User className="w-6 h-6 text-blue-500" />
          <span className="text-lg font-semibold">Perfil</span>
        </li>
        <li className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push('/goals')}>
          <Activity className="w-6 h-6 text-blue-500" />
          <span className="text-lg font-semibold">Metas</span>
        </li>
        <li className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push('/achievements')}>
          <Trophy className="w-6 h-6 text-blue-500" />
          <span className="text-lg font-semibold">Conquistas</span>
        </li>
        <li className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push('/healthWarning')}>
          <Heart className="w-6 h-6 text-blue-500" />
          <span className="text-lg font-semibold">Saúde</span>
        </li>
        <li className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push('/Modality')}>
          <Heart className="w-6 h-6 text-blue-500" />
          <span className="text-lg font-semibold">Modalidade</span>
        </li>
        <li className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push('/settings')}>
          <Settings className="w-6 h-6 text-blue-500" />
          <span className="text-lg font-semibold">Configurações</span>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;
