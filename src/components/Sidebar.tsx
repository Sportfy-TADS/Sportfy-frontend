'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Home, User, Trophy, Heart, Settings, Activity, Shield } from 'lucide-react'; // Ícones

async function fetchIsAdmin(userId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`);
  const user = await res.json();
  return user.isAdmin;
}

const Sidebar = () => {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        try {
          const adminStatus = await fetchIsAdmin(storedUserId);
          setIsAdmin(adminStatus);
        } catch (error) {
          console.error('Erro ao verificar status de administrador:', error);
        }
      }
    };

    checkAdminStatus();
  }, []);

  return (
    <nav className="w-full max-w-xs bg-gray-200 dark:bg-gray-900 p-4 border-none shadow-none">
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

        {/* Opções de Admin - Visível apenas para Administradores */}
        {isAdmin && (
          <>
            <li className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push('/admin')}>
              <Shield className="w-6 h-6 text-red-500" />
              <span className="text-lg font-semibold">Gerenciar Administradores</span>
            </li>
            <li className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push('/admin/modalidades')}>
              <Shield className="w-6 h-6 text-red-500" />
              <span className="text-lg font-semibold">Gerenciar Modalidades</span>
            </li>
            <li className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push('/admin/health-centers')}>
              <Shield className="w-6 h-6 text-red-500" />
              <span className="text-lg font-semibold">Gerenciar Casas de Saúde</span>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Sidebar;
