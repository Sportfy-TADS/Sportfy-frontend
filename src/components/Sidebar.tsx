'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {jwtDecode} from 'jwt-decode'
import {
  Home,
  User,
  Target,
  Award,
  HeartPulse,
  Settings,
  Trophy,
  Flag,
  Shield,
  Layers,
  Hospital,
  Activity,
} from 'lucide-react'

interface DecodedToken {
  roles: string
}

export default function Sidebar() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      const decoded: DecodedToken = jwtDecode(token)
      // Check if the roles string includes 'ADMINISTRADOR'
      setIsAdmin(decoded.roles.includes('ADMINISTRADOR'))
    }
  }, [])

  return (
    <nav className="flex-none h-screen w-full max-w-xs bg-gray-200 dark:bg-gray-900 p-4 border-none shadow-none">
      <ul className="space-y-6">
        <li
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => router.push('/feed')}
        >
          <Home className="w-6 h-6 text-blue-500" />
          <span className="text-lg font-semibold">Início</span>
        </li>
        <li
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => router.push('/profile')}
        >
          <User className="w-6 h-6 text-blue-500" />
          <span className="text-lg font-semibold">Perfil</span>
        </li>
        <li
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => router.push('/goals')}
        >
          <Target className="w-6 h-6 text-blue-500" />
          <span className="text-lg font-semibold">Metas</span>
        </li>
        <li
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => router.push('/achievements')}
        >
          <Award className="w-6 h-6 text-blue-500" />
          <span className="text-lg font-semibold">Conquistas</span>
        </li>
        <li
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => router.push('/healthWarning')}
        >
          <HeartPulse className="w-6 h-6 text-blue-500" />
          <span className="text-lg font-semibold">Saúde</span>
        </li>
        <li
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => router.push('/Modality')}
        >
          <Activity className="w-6 h-6 text-blue-500" />
          <span className="text-lg font-semibold">Modalidade</span>
        </li>
        <li
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => router.push('/matches')}
        >
          <Flag className="w-6 h-6 text-blue-500" />
          <span className="text-lg font-semibold">Partida</span>
        </li>
        <li
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => router.push('/championships')}
        >
          <Trophy className="w-6 h-6 text-blue-500" />
          <span className="text-lg font-semibold">Campeonato</span>
        </li>
        <li
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => router.push('/statistics')}
        >
          <Layers className="w-6 h-6 text-blue-500" />
          <span className="text-lg font-semibold">Estatísticas</span>
        </li>
        <li
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => router.push('/settings')}
        >
          <Settings className="w-6 h-6 text-blue-500" />
          <span className="text-lg font-semibold">Configurações</span>
        </li>

        {isAdmin && (
          <>
            <li
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => router.push('/admin')}
            >
              <Shield className="w-6 h-6 text-red-500" />
              <span className="text-lg font-semibold">
                Gerenciar Administradores
              </span>
            </li>
            <li
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => router.push('/admin/modality')}
            >
              <Layers className="w-6 h-6 text-red-500" />
              <span className="text-lg font-semibold">
                Gerenciar Modalidades
              </span>
            </li>
            <li
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => router.push('/admin/health')}
            >
              <Hospital className="w-6 h-6 text-red-500" />
              <span className="text-lg font-semibold">
                Gerenciar Casas de Saúde
              </span>
            </li>
          </>
        )}
      </ul>
    </nav>
  )
}
