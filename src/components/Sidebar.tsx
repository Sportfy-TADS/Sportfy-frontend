'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation' // Added usePathname
import { jwtDecode } from 'jwt-decode'
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
  Menu,
  X,
} from 'lucide-react'

interface DecodedToken {
  roles: string
}

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname() // Added to get current path
  const [isAdmin, setIsAdmin] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      const decoded: DecodedToken = jwtDecode(token)
      setIsAdmin(decoded.roles.includes('ADMINISTRADOR'))
    }
  }, [])

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      <button
        className="lg:hidden p-4 focus:outline-none"
        onClick={toggleSidebar}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
      <nav
        className={`fixed lg:static top-0 left-0 h-full lg:h-screen w-64 bg-gray-200 dark:bg-gray-900 p-4 border-r border-gray-300 dark:border-gray-700 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-200 ease-in-out lg:translate-x-0 z-50`}
      >
        <ul className="space-y-6">
          <li
            className={`flex items-center space-x-3 cursor-pointer hover:bg-blue-500 hover:text-white transition-colors duration-200 p-2 rounded-md ${
              pathname === '/feed' ? 'opacity-75' : ''
            }`}
            onClick={() => router.push('/feed')}
          >
            <Home className="w-6 h-6 text-blue-500" />
            <span className="text-lg font-semibold">Início</span>
          </li>
          <li
            className={`flex items-center space-x-3 cursor-pointer hover:bg-blue-500 hover:text-white transition-colors duration-200 p-2 rounded-md ${
              pathname === '/profile' ? 'opacity-75' : ''
            }`}
            onClick={() => router.push('/profile')}
          >
            <User className="w-6 h-6 text-blue-500" />
            <span className="text-lg font-semibold">Perfil</span>
          </li>
          <li
            className={`flex items-center space-x-3 cursor-pointer hover:bg-blue-500 hover:text-white transition-colors duration-200 p-2 rounded-md ${
              pathname === '/goals' ? 'opacity-50' : ''
            }`}
            onClick={() => router.push('/goals')}
          >
            <Target className="w-6 h-6 text-blue-500" />
            <span className="text-lg font-semibold">Metas</span>
          </li>
          <li
            className={`flex items-center space-x-3 cursor-pointer hover:bg-blue-500 hover:text-white transition-colors duration-200 p-2 rounded-md ${
              pathname === '/achievements' ? 'opacity-50' : ''
            }`}
            onClick={() => router.push('/achievements')}
          >
            <Award className="w-6 h-6 text-blue-500" />
            <span className="text-lg font-semibold">Conquistas</span>
          </li>
          <li
            className={`flex items-center space-x-3 cursor-pointer hover:bg-blue-500 hover:text-white transition-colors duration-200 p-2 rounded-md ${
              pathname === '/healthWarning' ? 'opacity-50' : ''
            }`}
            onClick={() => router.push('/healthWarning')}
          >
            <HeartPulse className="w-6 h-6 text-blue-500" />
            <span className="text-lg font-semibold">Saúde</span>
          </li>
          <li
            className={`flex items-center space-x-3 cursor-pointer hover:bg-blue-500 hover:text-white transition-colors duration-200 p-2 rounded-md ${
              pathname === '/Modality' ? 'opacity-50' : ''
            }`}
            onClick={() => router.push('/Modality')}
          >
            <Activity className="w-6 h-6 text-blue-500" />
            <span className="text-lg font-semibold">Modalidade</span>
          </li>
          <li
            className={`flex items-center space-x-3 cursor-pointer hover:bg-blue-500 hover:text-white transition-colors duration-200 p-2 rounded-md ${
              pathname === '/championships' ? 'opacity-50' : ''
            }`}
            onClick={() => router.push('/championships')}
          >
            <Trophy className="w-6 h-6 text-blue-500" />
            <span className="text-lg font-semibold">Campeonato</span>
          </li>
          <li
            className={`flex items-center space-x-3 cursor-pointer hover:bg-blue-500 hover:text-white transition-colors duration-200 p-2 rounded-md ${
              pathname === '/statistics' ? 'opacity-50' : ''
            }`}
            onClick={() => router.push('/statistics')}
          >
            <Layers className="w-6 h-6 text-blue-500" />
            <span className="text-lg font-semibold">Estatísticas</span>
          </li>
          <li
            className={`flex items-center space-x-3 cursor-pointer hover:bg-blue-500 hover:text-white transition-colors duration-200 p-2 rounded-md ${
              pathname === '/settings' ? 'opacity-50' : ''
            }`}
            onClick={() => router.push('/settings')}
          >
            <Settings className="w-6 h-6 text-blue-500" />
            <span className="text-lg font-semibold">Configurações</span>
          </li>

          {isAdmin && (
            <>
              <li
                className={`flex items-center space-x-3 cursor-pointer hover:bg-red-500 hover:text-white transition-colors duration-200 p-2 rounded-md ${
                  pathname === '/admin' ? 'opacity-75' : ''
                }`}
                onClick={() => router.push('/admin')}
              >
                <Shield className="w-6 h-6 text-red-500" />
                <span className="text-lg font-semibold">
                  Gerenciar Administradores
                </span>
              </li>
              <li
                className={`flex items-center space-x-3 cursor-pointer hover:bg-red-500 hover:text-white transition-colors duration-200 p-2 rounded-md ${
                  pathname === '/admin/modality' ? 'opacity-50' : ''
                }`}
                onClick={() => router.push('/admin/modality')}
              >
                <Layers className="w-6 h-6 text-red-500" />
                <span className="text-lg font-semibold">
                  Gerenciar Modalidades
                </span>
              </li>
              <li
                className={`flex items-center space-x-3 cursor-pointer hover:bg-red-500 hover:text-white transition-colors duration-200 p-2 rounded-md ${
                  pathname === '/admin/health' ? 'opacity-50' : ''
                }`}
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
      {/* Overlay para telas pequenas */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-25 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  )
}