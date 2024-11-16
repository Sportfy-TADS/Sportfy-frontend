'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { Trophy, Target, Medal } from 'lucide-react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'

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
  metas?: string[]
  conquistas?: string[]
  campeonatos?: Array<{
    nome: string
    posicao: string
    data: string
  }>
  [key: string]: string | number | boolean | null | undefined | any[]
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
        
        // Mockando dados adicionais temporariamente - substituir pela API real depois
        const userData = {
          ...response.data,
          metas: [
            'Conquistar faixa preta até 2025',
            'Participar de 5 campeonatos em 2024',
            'Alcançar peso ideal para categoria'
          ],
          conquistas: [
            'Faixa roxa em Jiu-jitsu',
            'Campeão estadual 2023',
            'Instrutor certificado'
          ],
          campeonatos: [
            { nome: 'Brasileiro de Jiu-Jitsu 2023', posicao: '2º lugar', data: '2023' },
            { nome: 'Copa São Paulo', posicao: '1º lugar', data: '2023' },
            { nome: 'Campeonato Regional', posicao: '1º lugar', data: '2024' }
          ]
        }
        
        setUser(userData)
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
            <div className="flex justify-between items-start px-4">
              <Skeleton className="w-32 h-32 rounded-full bg-gray-300 -mt-16" />
              <Skeleton className="h-10 w-28 bg-gray-300 mt-4" />
            </div>
            <div className="mt-4 space-y-4">
              <Skeleton className="h-8 w-48 bg-gray-300" />
              <Skeleton className="w-full h-32 bg-gray-300" />
            </div>
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
          {/* Banner e Foto */}
          <div className="relative">
            <div className="w-full h-48 bg-gray-300 dark:bg-gray-700 rounded-lg" />
            
            {/* Foto e Botão Editar */}
            <div className="flex justify-between items-start px-4">
              <img
                src={user?.foto || '/default-avatar.png'}
                alt={user?.nome}
                className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 -mt-16"
              />
              <Button
                onClick={() => router.push('/profile/edit')}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
              >
                Editar Perfil
              </Button>
            </div>

            {/* Informações do Perfil */}
            <div className="mt-4 px-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user?.nome}
              </h1>
              <p className="text-gray-500">@{user?.username}</p>
              
              {/* Bio e Informações Básicas */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <p><strong>Email:</strong> {user?.email}</p>
                  {user?.curso && <p><strong>Curso:</strong> {user.curso}</p>}
                  {user?.telefone && <p><strong>Telefone:</strong> {user.telefone}</p>}
                  {user?.dataNascimento && (
                    <p>
                      <strong>Data de Nascimento:</strong>{' '}
                      {new Date(user.dataNascimento).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                  {user?.genero && <p><strong>Gênero:</strong> {user.genero}</p>}
                </div>
              </div>

              {/* Seções de Metas, Conquistas e Campeonatos */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-500" />
                      Metas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {user?.metas?.map((meta, index) => (
                        <li key={index} className="text-sm">{meta}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Medal className="w-5 h-5 text-yellow-500" />
                      Conquistas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {user?.conquistas?.map((conquista, index) => (
                        <li key={index} className="text-sm">{conquista}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-purple-500" />
                      Campeonatos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {user?.campeonatos?.map((campeonato, index) => (
                        <li key={index} className="text-sm">
                          <p className="font-semibold">{campeonato.nome}</p>
                          <p className="text-gray-600">
                            {campeonato.posicao} • {campeonato.data}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}