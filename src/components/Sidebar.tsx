'use client'

import { useState, useEffect } from 'react'

import { useRouter, usePathname } from 'next/navigation'

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
  Star,
} from 'lucide-react'

interface DecodedToken {
  roles: string
}

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [visitedRoutes, setVisitedRoutes] = useState<string[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('visitedRoutes')
    if (stored) {
      setVisitedRoutes(JSON.parse(stored))
    }

    const token = localStorage.getItem('token')
    if (token) {
      const decoded: DecodedToken = jwtDecode(token)
      setIsAdmin(decoded.roles.includes('ADMINISTRADOR'))
    }
  }, [])

  const handleRouteClick = (route: string) => {
    if (!visitedRoutes.includes(route)) {
      const newVisitedRoutes = [...visitedRoutes, route]
      setVisitedRoutes(newVisitedRoutes)
      localStorage.setItem('visitedRoutes', JSON.stringify(newVisitedRoutes))
    }
    router.push(route)
  }

  const getItemStyle = (route: string) => {
    return `flex items-center space-x-3 cursor-pointer 
    ${visitedRoutes.includes(route) ? 'hover:bg-blue-500' : 'hover:bg-gray-400'} 
    hover:text-white transition-colors duration-200 p-2 rounded-md
    ${pathname === route ? 'opacity-75' : ''}
    ${!visitedRoutes.includes(route) ? 'opacity-50' : ''}`
  }

  const prefetchRoute = (route: string) => {
    router.prefetch(route)
  }

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
          {!isAdmin && (
            <>
              <li
                className={getItemStyle('/feed')}
                onClick={() => handleRouteClick('/feed')}
                onMouseEnter={() => prefetchRoute('/feed')}
              >
                <Home
                  className={`w-6 h-6 ${visitedRoutes.includes('/feed') ? 'text-blue-500' : 'text-gray-500'}`}
                />
                <span className="text-lg font-semibold">Início</span>
              </li>
              <li
                className={getItemStyle('/profile')}
                onClick={() => handleRouteClick('/profile')}
                onMouseEnter={() => prefetchRoute('/profile')}
              >
                <User
                  className={`w-6 h-6 ${visitedRoutes.includes('/profile') ? 'text-blue-500' : 'text-gray-500'}`}
                />
                <span className="text-lg font-semibold">Perfil</span>
              </li>
              <li
                className={getItemStyle('/goals')}
                onClick={() => handleRouteClick('/goals')}
                onMouseEnter={() => prefetchRoute('/goals')}
              >
                <Target
                  className={`w-6 h-6 ${visitedRoutes.includes('/goals') ? 'text-blue-500' : 'text-gray-500'}`}
                />
                <span className="text-lg font-semibold">Metas</span>
              </li>
              <li
                className={getItemStyle('/achievements')}
                onClick={() => handleRouteClick('/achievements')}
                onMouseEnter={() => prefetchRoute('/achievements')}
              >
                <Award
                  className={`w-6 h-6 ${visitedRoutes.includes('/achievements') ? 'text-blue-500' : 'text-gray-500'}`}
                />
                <span className="text-lg font-semibold">Conquistas</span>
              </li>
              <li
                className={getItemStyle('/healthWarning')}
                onClick={() => handleRouteClick('/healthWarning')}
                onMouseEnter={() => prefetchRoute('/healthWarning')}
              >
                <HeartPulse
                  className={`w-6 h-6 ${visitedRoutes.includes('/healthWarning') ? 'text-blue-500' : 'text-gray-500'}`}
                />
                <span className="text-lg font-semibold">Saúde</span>
              </li>
              <li
                className={getItemStyle('/Modality')}
                onClick={() => handleRouteClick('/Modality')}
                onMouseEnter={() => prefetchRoute('/Modality')}
              >
                <Activity
                  className={`w-6 h-6 ${visitedRoutes.includes('/Modality') ? 'text-blue-500' : 'text-gray-500'}`}
                />
                <span className="text-lg font-semibold">Modalidade</span>
              </li>
              <li
                className={getItemStyle('/championships')}
                onClick={() => handleRouteClick('/championships')}
                onMouseEnter={() => prefetchRoute('/championships')}
              >
                <Trophy
                  className={`w-6 h-6 ${visitedRoutes.includes('/championships') ? 'text-blue-500' : 'text-gray-500'}`}
                />
                <span className="text-lg font-semibold">Campeonato</span>
              </li>
              <li
                className={getItemStyle('/statistics')}
                onClick={() => handleRouteClick('/statistics')}
                onMouseEnter={() => prefetchRoute('/statistics')}
              >
                <Layers
                  className={`w-6 h-6 ${visitedRoutes.includes('/statistics') ? 'text-blue-500' : 'text-gray-500'}`}
                />
                <span className="text-lg font-semibold">Estatísticas</span>
              </li>
              <li
                className={getItemStyle('/playerRatings')}
                onClick={() => handleRouteClick('/playerRatings')}
                onMouseEnter={() => prefetchRoute('/playerRatings')}
              >
                <Star
                  className={`w-6 h-6 ${visitedRoutes.includes('/playerRatings') ? 'text-blue-500' : 'text-gray-500'}`}
                />
                <span className="text-lg font-semibold">Avaliar</span>
              </li>
              <li
                className={getItemStyle('/settings')}
                onClick={() => handleRouteClick('/settings')}
                onMouseEnter={() => prefetchRoute('/settings')}
              >
                <Settings
                  className={`w-6 h-6 ${visitedRoutes.includes('/settings') ? 'text-blue-500' : 'text-gray-500'}`}
                />
                <span className="text-lg font-semibold">Configurações</span>
              </li>
            </>
          )}

          {isAdmin && (
            <>
              <li
                className={getItemStyle('/feed')}
                onClick={() => handleRouteClick('/feed')}
                onMouseEnter={() => prefetchRoute('/feed')}
              >
                <Home
                  className={`w-6 h-6 ${visitedRoutes.includes('/feed') ? 'text-red-500' : 'text-gray-500'}`}
                />
                <span className="text-lg font-semibold">Início</span>
              </li>
              <li
                className={getItemStyle('/admin')}
                onClick={() => handleRouteClick('/admin')}
                onMouseEnter={() => prefetchRoute('/admin')}
              >
                <Shield className="w-6 h-6 text-red-500" />
                <span className="text-lg font-semibold">
                  Gerenciar Administradores
                </span>
              </li>
              <li
                className={getItemStyle('/admin/modality')}
                onClick={() => handleRouteClick('/admin/modality')}
                onMouseEnter={() => prefetchRoute('/admin/modality')}
              >
                <Layers className="w-6 h-6 text-red-500" />
                <span className="text-lg font-semibold">
                  Gerenciar Modalidades
                </span>
              </li>
              <li
                className={getItemStyle('/admin/health')}
                onClick={() => handleRouteClick('/admin/health')}
                onMouseEnter={() => prefetchRoute('/admin/health')}
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
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-25 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  )
}
