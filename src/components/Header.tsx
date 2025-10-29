'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useRouter } from 'next/navigation'

import { jwtDecode } from 'jwt-decode'
import { LogOut } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'

interface DecodedToken {
  idUsuario: number
  sub: string
  roles: string
}

interface User {
  id: number
  nome: string
  username: string
  tipo: 'ACADEMICO' | 'ADMINISTRADOR'
}

interface CachedUserData {
  nome: string
  foto?: string
  timestamp: number
}

// Cache para dados do usuário (5 minutos)
const CACHE_DURATION = 5 * 60 * 1000
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'

export default function Header() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const [userImage, setUserImage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  
  // Refs para controle de requisições
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)
  const searchAbortController = useRef<AbortController | null>(null)
  const userDataAbortController = useRef<AbortController | null>(null)

  // Função para verificar se o cache ainda é válido
  const isCacheValid = useCallback((timestamp: number): boolean => {
    return Date.now() - timestamp < CACHE_DURATION
  }, [])

  // Função otimizada para buscar dados do usuário
  const fetchUserData = useCallback(async () => {
    const token = localStorage.getItem('token')
    const storedUserData = localStorage.getItem('userData')

    if (!token) {
      setIsLoggedIn(false)
      return
    }

    // Verificar cache primeiro
    if (storedUserData) {
      try {
        const cachedData: CachedUserData = JSON.parse(storedUserData)
        if (isCacheValid(cachedData.timestamp)) {
          setIsLoggedIn(true)
          setUserName(cachedData.nome)
          setUserImage(cachedData.foto || '')
          return
        }
      } catch (error) {
        console.warn('Cache inválido, removendo...', error)
        localStorage.removeItem('userData')
      }
    }

    // Cancelar requisição anterior se existir
    if (userDataAbortController.current) {
      userDataAbortController.current.abort()
    }

    userDataAbortController.current = new AbortController()

    try {
      const decoded: DecodedToken = jwtDecode(token)
      const username = decoded.sub
      let userResponse

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }

      if (decoded.roles.includes('ADMINISTRADOR')) {
        const response = await fetch(`${API_BASE_URL}/administrador/listar`, {
          headers,
          signal: userDataAbortController.current.signal,
        })
        
        if (!response.ok) throw new Error('Erro ao buscar administrador')
        
        const adminData = await response.json()
        const matchedAdmin = adminData.content.find(
          (admin: { username: string }) => admin.username === decoded.sub,
        )
        
        if (!matchedAdmin) throw new Error('Admin não encontrado')
        userResponse = { nome: matchedAdmin.nome, foto: matchedAdmin.foto }
      } else {
        const response = await fetch(
          `${API_BASE_URL}/academico/buscar/${username}`,
          {
            headers,
            signal: userDataAbortController.current.signal,
          },
        )
        
        if (!response.ok) throw new Error('Erro ao buscar dados do acadêmico')
        userResponse = await response.json()
      }

      // Salvar no cache com timestamp
      const cachedData: CachedUserData = {
        ...userResponse,
        timestamp: Date.now(),
      }
      localStorage.setItem('userData', JSON.stringify(cachedData))
      
      setIsLoggedIn(true)
      setUserName(userResponse.nome)
      setUserImage(userResponse.foto || '')
    } catch (error: any) {
      if (error.name === 'AbortError') return // Requisição cancelada
      
      console.error('Erro ao carregar dados do usuário:', error)
      setIsLoggedIn(false)
      // Limpar dados inválidos
      localStorage.removeItem('userData')
      localStorage.removeItem('token')
    }
  }, [isCacheValid])

  // Função otimizada para realizar a busca de usuários
  const performSearch = useCallback(async (term: string) => {
    if (term.length <= 2) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    // Cancelar busca anterior
    if (searchAbortController.current) {
      searchAbortController.current.abort()
    }

    searchAbortController.current = new AbortController()
    setIsSearching(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setSearchResults([])
        setIsSearching(false)
        return
      }

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }

      const [academicosResponse, adminsResponse] = await Promise.all([
        fetch(
          `${API_BASE_URL}/academico/listar?page=0&size=10&sort=curso,desc&nome_like=${encodeURIComponent(term)}`,
          {
            headers,
            signal: searchAbortController.current.signal,
          },
        ),
        fetch(
          `${API_BASE_URL}/administrador/listar?page=0&size=10&sort=idAdministrador,desc`,
          {
            headers,
            signal: searchAbortController.current.signal,
          },
        ),
      ])

      if (!academicosResponse.ok || !adminsResponse.ok) {
        throw new Error('Erro ao buscar usuários')
      }

      const [academicosData, adminsData] = await Promise.all([
        academicosResponse.json(),
        adminsResponse.json(),
      ])

      const academicos = academicosData.content.map(
        (user: { idAcademico: number; nome: string; username: string }) => ({
          id: user.idAcademico,
          nome: user.nome,
          username: user.username,
          tipo: 'ACADEMICO' as const,
        }),
      )

      const lowerTerm = term.toLowerCase()
      const admins = adminsData.content
        .filter(
          (admin: { nome: string; username: string }) =>
            admin.nome.toLowerCase().includes(lowerTerm) ||
            admin.username.toLowerCase().includes(lowerTerm),
        )
        .map(
          (admin: {
            idAdministrador: number
            nome: string
            username: string
          }) => ({
            id: admin.idAdministrador,
            nome: admin.nome,
            username: admin.username,
            tipo: 'ADMINISTRADOR' as const,
          }),
        )

      const combinedResults = [...academicos, ...admins]
        .sort((a, b) => a.nome.localeCompare(b.nome))
        .slice(0, 10) // Limitar resultados para melhor performance

      setSearchResults(combinedResults)
    } catch (error: any) {
      if (error.name === 'AbortError') return // Requisição cancelada
      
      console.error('Erro ao buscar usuários:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Função otimizada para busca com debounce
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
    
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current)
    }
    
    debounceTimeout.current = setTimeout(() => {
      performSearch(term)
    }, 300)
  }, [performSearch])

  // Carregar dados do usuário na montagem do componente
  useEffect(() => {
    fetchUserData()
  }, [fetchUserData])

  // Limpar timeouts e cancelar requisições ao desmontar
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current)
      }
      if (searchAbortController.current) {
        searchAbortController.current.abort()
      }
      if (userDataAbortController.current) {
        userDataAbortController.current.abort()
      }
    }
  }, [])

  // Função otimizada para seleção de usuário
  const handleUserSelect = useCallback((username: string) => {
    setSearchResults([])
    setSearchTerm('')
    router.push(`/profile/${username}`)
  }, [router])

  // Função otimizada para logout
  const handleLogout = useCallback(() => {
    setIsLoggedIn(false)
    localStorage.removeItem('token')
    localStorage.removeItem('userData')
    localStorage.removeItem('academicoId')
    localStorage.removeItem('adminId')
    router.push('/auth')
  }, [router])

  // Função otimizada para navegar ao feed
  const goToFeed = useCallback(() => {
    router.push('/feed')
  }, [router])

  // Função memoizada para obter iniciais
  const getInitials = useCallback((name: string) => {
    if (!name || name.trim() === '') return 'U'
    return name.trim().charAt(0).toUpperCase()
  }, [])

  // Memoizar as iniciais do usuário
  const userInitials = useMemo(() => getInitials(userName), [userName, getInitials])

  return (
    <header className="w-full p-4 flex justify-between items-center bg-gray-300 text-black dark:bg-gray-900 dark:text-white shadow-md">
      <h1 className="text-xl font-bold cursor-pointer" onClick={goToFeed}>
        Sportfy
      </h1>

      {/* Campo de busca otimizado */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Buscar usuário..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current)
              }
              performSearch(searchTerm)
            }
            if (e.key === 'Escape') {
              setSearchResults([])
              setSearchTerm('')
            }
          }}
          className="w-64"
          disabled={isSearching}
        />
        {(searchResults.length > 0 || isSearching) && (
          <div className="absolute bg-white dark:bg-gray-800 text-black dark:text-white mt-2 w-full max-h-60 overflow-y-auto shadow-lg rounded-md z-50">
            {isSearching ? (
              <div className="px-4 py-2 text-center text-gray-500">
                Buscando...
              </div>
            ) : (
              searchResults.map((user) => (
                <div
                  key={`${user.tipo}-${user.id}`}
                  onClick={() => handleUserSelect(user.username)}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 flex justify-between items-center"
                >
                  <span>
                    {user.nome} (@{user.username})
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      user.tipo === 'ADMINISTRADOR'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}
                  >
                    {user.tipo}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {isLoggedIn && (
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer w-10 h-10 rounded-lg">
                {userImage && userImage.trim() !== '' ? (
                  <AvatarImage src={userImage} alt={userName} />
                ) : (
                  <AvatarFallback>{userInitials}</AvatarFallback>
                )}
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white text-black dark:bg-gray-800 dark:text-white border border-gray-200 shadow-lg w-56 rounded-md"
            >
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                Configurações
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/achievements')}>
                Conquistas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/goals')}>
                Metas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/healthWarning')}>
                Saúde
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/championships')}>
                Campeonatos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/statistics')}>
                Estatística
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                <LogOut className="ml-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </header>
  )
}
