'use client'

import { useEffect, useState, useRef } from 'react'

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

export default function Header() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const [userImage, setUserImage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)

  // Carregar os dados do usuário logado
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token')
      const storedUserData = localStorage.getItem('userData')
      console.log('Token:', token, 'Stored User Data:', storedUserData)

      if (!token) {
        setIsLoggedIn(false)
        return
      }

      try {
        const decoded: DecodedToken = jwtDecode(token)
        console.log('Decoded Token:', decoded)

        if (storedUserData) {
          const userData = JSON.parse(storedUserData)
          setIsLoggedIn(true)
          setUserName(userData.nome)
          setUserImage(userData.foto || `https://via.placeholder.com/50`)
          return
        }

        const username = decoded.sub
        let userResponse

        if (decoded.roles.includes('ADMINISTRADOR')) {
          const adminResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/administrador/listar`,
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            },
          )
          const adminData = await adminResponse.json()
          const matchedAdmin = adminData.content.find(
            (admin: { username: string }) => admin.username === decoded.sub,
          )
          if (!matchedAdmin) throw new Error('Admin não encontrado')
          userResponse = { nome: matchedAdmin.nome, foto: matchedAdmin.foto }
        } else {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/academico/buscar/${username}`,
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            },
          )
          if (!response.ok) throw new Error('Erro ao buscar dados do acadêmico')
          userResponse = await response.json()
        }

        localStorage.setItem('userData', JSON.stringify(userResponse))
        setIsLoggedIn(true)
        setUserName(userResponse.nome)
        setUserImage(userResponse.foto || `https://via.placeholder.com/50`)
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error)
        setIsLoggedIn(false)
      }
    }

    fetchUserData()
  }, [])

  // Função para realizar a busca de usuários
  const performSearch = async (term: string) => {
    if (term.length > 2) {
      try {
        const token = localStorage.getItem('token')
        const [academicosResponse, adminsResponse] = await Promise.all([
          fetch(
            `http://localhost:8081/academico/listar?page=0&size=10&sort=curso,desc&nome_like=${term}`,
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            },
          ),
          fetch(
            `http://localhost:8081/administrador/listar?page=0&size=10&sort=idAdministrador,desc`,
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            },
          ),
        ])

        const academicosData = await academicosResponse.json()
        const adminsData = await adminsResponse.json()

        const academicos = academicosData.content.map(
          (user: { idAcademico: number; nome: string; username: string }) => ({
            id: user.idAcademico,
            nome: user.nome,
            username: user.username,
            tipo: 'ACADEMICO' as const,
          }),
        )

        const admins = adminsData.content
          .filter(
            (admin: { nome: string; username: string }) =>
              admin.nome.toLowerCase().includes(term.toLowerCase()) ||
              admin.username.toLowerCase().includes(term.toLowerCase()),
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

        const combinedResults = [...academicos, ...admins].sort((a, b) =>
          a.nome.localeCompare(b.nome),
        )

        setSearchResults(combinedResults)
        console.log('Combined Search Results:', combinedResults)
      } catch (error) {
        console.error('Erro ao buscar usuários:', error)
      }
    } else {
      setSearchResults([])
    }
  }

  // Função para realizar a busca de acadêmicos com debouncing
  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current)
    }
    debounceTimeout.current = setTimeout(() => {
      performSearch(term)
    }, 300)
  }

  // Limpar timeout ao desmontar o componente
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current)
      }
    }
  }, [])

  // Redireciona para o perfil de um acadêmico
  const handleUserSelect = (username: string) => {
    setSearchResults([])
    router.push(`/profile/${username}`)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    localStorage.removeItem('token')
    localStorage.removeItem('userData')
    localStorage.removeItem('academicoId')
    localStorage.removeItem('adminId')
    router.push('/auth')
  }

  const goToFeed = () => {
    router.push('/feed')
  }

  // Função para pegar as iniciais do nome
  const getInitials = (name: string) => {
    if (!name) return ''
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
  }

  return (
    <header className="w-full p-4 flex justify-between items-center bg-gray-300 text-black dark:bg-gray-900 dark:text-white shadow-md">
      <h1 className="text-xl font-bold cursor-pointer" onClick={goToFeed}>
        Sportfy
      </h1>

      {/* Campo de busca */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Buscar usuário..."
          value={searchTerm}
          onChange={(e) => {
            handleSearch(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current)
              }
              performSearch(searchTerm)
            }
          }}
          className="w-64"
        />
        {searchResults.length > 0 && (
          <div className="absolute bg-white dark:bg-gray-800 text-black dark:text-white mt-2 w-full max-h-60 overflow-y-auto shadow-lg rounded-md">
            {searchResults.map((user) => (
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
