'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface User {
  idAcademico: number
  curso: string
  username: string
  email: string
  password: string | null
  nome: string
  genero: string | null
  telefone: string
  dataNascimento: string
  foto: string | null
  dataCriacao: string
  ativo: boolean
  permissao: string
}

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Simulando a obtenção dos dados do usuário logado
    const fetchUserData = async () => {
      setLoading(true)
      try {
        const userData: User = {
          idAcademico: 1,
          curso: 'Análise e Desenvolvimento de Sistemas',
          username: 'math_aa',
          email: 'matheus@ufpr.br',
          password: null,
          nome: 'Matheus Antônio Augusto',
          genero: null,
          telefone: '41987213343',
          dataNascimento: '2002-03-03T00:00:00Z',
          foto: null,
          dataCriacao: '2024-11-04T14:21:42Z',
          ativo: true,
          permissao: 'ACADEMICO',
        }
        setUser(userData)
      } catch (error) {
        console.error('Erro ao carregar perfil:', error)
        router.push('/login') // Redirecionar para login se houver erro
      }
      setLoading(false)
    }

    fetchUserData()
  }, [router])

  if (loading) {
    return (
      <div>
        <Header />
        <div className="flex">
          <Sidebar />
          <div className="container mx-auto p-4">
            <Skeleton className="w-full h-48 bg-gray-300" />
            <Skeleton className="w-24 h-24 rounded-full bg-gray-300 mt-4" />
            <Skeleton className="h-8 w-48 bg-gray-300 mt-2" />
            <Skeleton className="w-full h-32 bg-gray-300 mt-4" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header />
      <div className="flex">
        <Sidebar />
        <div className="container mx-auto p-4">
          {/* Perfil do Usuário */}
          <div className="relative mb-6">
            <div className="w-full h-48 bg-gray-300 dark:bg-gray-700 rounded-lg" />
            <div className="absolute -bottom-12 left-4">
              <img
                src={user?.foto || 'https://via.placeholder.com/150'}
                alt={user?.nome}
                className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-900"
              />
            </div>
          </div>
          <div className="flex flex-col items-start space-y-4 mb-6">
            <h1 className="text-2xl font-bold">{user?.nome}</h1>
            <p className="text-gray-500">@{user?.username}</p>
            <p className="text-gray-600 dark:text-gray-300">
              <strong>Email:</strong> {user?.email}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              <strong>Curso:</strong> {user?.curso}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              <strong>Telefone:</strong> {user?.telefone}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              <strong>Data de Nascimento:</strong>{' '}
              {new Date(user?.dataNascimento).toLocaleDateString()}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              <strong>Gênero:</strong> {user?.genero || 'Não informado'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
