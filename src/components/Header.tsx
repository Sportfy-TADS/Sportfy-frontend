'use client'

import { useEffect, useState } from 'react'

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
  username: string
  role: string
}

export default function Header() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const [userImage, setUserImage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])

  // Carregar os dados do usuário logado
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token')
      console.log('Token:', token) // Log do token

      if (!token) {
        router.push('/auth')
        return
      }

      let decoded: DecodedToken
      try {
        decoded = jwtDecode(token)
        console.log('Decoded Token:', decoded) // Log do token decodificado
      } catch (error) {
        console.error('Erro ao decodificar o token:', error)
        router.push('/auth')
        return
      }

      setIsLoggedIn(true)
      const userId = decoded.idUsuario
      setUserName(decoded.username)

      try {
        let userResponse

        if (decoded.role === 'ADMINISTRADOR') {
          const adminResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/administrador/listar`,
          )
          const adminData = await adminResponse.json()
          console.log('Admin Data:', adminData) // Log dos dados do administrador

          const matchedAdmin = adminData.find(
            (admin: any) => admin.username === decoded.sub,
          )
          console.log('Matched Admin:', matchedAdmin) // Log do administrador correspondente

          if (!matchedAdmin) {
            router.push('/auth')
            return
          }
          userResponse = { nome: matchedAdmin.nome, foto: matchedAdmin.foto }
        } else {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/academico/consultar/${userId}`,
          )
          if (!response.ok) throw new Error('Erro ao buscar dados do acadêmico')
          userResponse = await response.json()
          console.log('User Data:', userResponse) // Log dos dados do usuário
        }

        setUserName(userResponse.nome)
        setUserImage(userResponse.foto || '')
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error)
        router.push('/auth')
      }
    }

    fetchUserData()
  }, [router])

  // Função para realizar a busca de acadêmicos
  const handleSearch = async (term: string) => {
    setSearchTerm(term)
    if (term.length > 2) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/academico/listar?nome_like=${term}`,
        )
        if (response.ok) {
          const data = await response.json()
          setSearchResults(data)
          console.log('Search Results:', data) // Log dos resultados da busca
        }
      } catch (error) {
        console.error('Erro ao buscar acadêmicos:', error)
      }
    } else {
      setSearchResults([])
    }
  }

  // Redireciona para o perfil de um acadêmico
  const handleUserSelect = (userId: string) => {
    setSearchResults([])
    router.push(`/profile/${userId}`)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    localStorage.removeItem('token')
    localStorage.removeItem('academicoId')
    localStorage.removeItem('adminId') // Remover também o adminId ao fazer logout
    router.push('/auth')
  }

  const goToFeed = () => {
    router.push('/feed')
  }

  // Função para pegar as iniciais do nome
  const getInitials = (name: string) => {
    if (!name) return '' // Se o nome for undefined, retorna uma string vazia
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
                Logout
                <LogOut className="ml-2" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </header>
  )
}
