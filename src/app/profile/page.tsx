'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface User {
  idAcademico?: number
  idUsuario?: number
  curso?: string
  username: string
  email: string
  nome: string
  genero?: string | null
  telefone?: string
  dataNascimento?: string
  foto?: string | null
  dataCriacao?: string
  ativo?: boolean
  permissao: string
  [key: string]: string | number | boolean | null | undefined
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('Erro: Nenhum usuário logado encontrado no localStorage')
        router.push('/auth')
        return
      }

      try {
        interface DecodedToken {
          idUsuario?: number
          idAcademico?: number
          role?: string
          permissao?: string
        }

        const decodedToken: DecodedToken = jwtDecode(token)

        const userId = decodedToken.idUsuario || decodedToken.idAcademico
        const userRole =
          decodedToken.role || decodedToken.permissao || 'ACADEMICO'

        const userEndpoint =
          userRole === 'ADMINISTRADOR'
            ? `${process.env.NEXT_PUBLIC_API_URL}/administrador/consultar/${userId}`
            : `${process.env.NEXT_PUBLIC_API_URL}/academico/consultar/${userId}`

        const response = await axios.get(userEndpoint, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setUser(response.data)
      } catch (error: unknown) {
        console.error('Erro ao carregar dados do usuário logado:', error)
        router.push('/auth')
      } finally {
        setLoading(false)
      }
    }

    loadUser()
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
          {/* Banner e Foto do Usuário */}
          <div className="relative mb-6">
            <div className="w-full h-48 bg-gray-300 dark:bg-gray-700 rounded-lg" />
            <div className="absolute -bottom-12 left-4">
              <img
                src={user?.foto || '/default-avatar.png'}
                alt={user?.nome}
                className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-900"
              />
            </div>
          </div>
          {/* Informações do Usuário (Agora lado a lado com a foto) */}
          <div className="flex items-center space-x-6 mb-6">
            <div className="flex flex-col space-y-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user?.nome}
              </h1>
              <p className="text-gray-500">@{user?.username}</p>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <p>
                  <strong>Email:</strong> {user?.email}
                </p>
                {user?.curso && (
                  <p>
                    <strong>Curso:</strong> {user.curso}
                  </p>
                )}
                {user?.telefone && (
                  <p>
                    <strong>Telefone:</strong> {user.telefone}
                  </p>
                )}
                {user?.dataNascimento && (
                  <p>
                    <strong>Data de Nascimento:</strong>{' '}
                    {new Date(user.dataNascimento).toLocaleDateString('pt-BR')}
                  </p>
                )}
                <p>
                  <strong>Gênero:</strong> {user?.genero || 'Não informado'}
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/profile/edit')}
              className="mt-2 bg-blue-500 hover:bg-blue-600 text-white"
            >
              Editar Perfil
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
