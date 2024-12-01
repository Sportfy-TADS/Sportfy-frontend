'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import { getUserData } from '@/utils/auth'
import { Trophy, Target, Medal } from 'lucide-react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { getGoals } from '@/http/goals'
import { fetchAchievements } from '@/http/achievements'
import { getChampionships } from '@/services/championshipService' // Add this import

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
  metas?: Array<{
    titulo: string
    progresso: string
    status: string
  }>
  conquistas?: string[]
  campeonatos?: Array<{
    nome: string
    posicao: string
    data: string
  }>
  [key: string]: string | number | boolean | null | undefined | any[]
}

function formatPhoneNumber(phoneNumber: string) {
  const cleaned = phoneNumber.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phoneNumber;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [bannerUrl, setBannerUrl] = useState<string | null>(null)
  const [recentGoals, setRecentGoals] = useState<any[]>([])
  const [campeonatos, setCampeonatos] = useState<Array<{ nome: string; posicao: string; data: string }>>([]) // Add state for campeonatos
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      const userData = getUserData()
      console.log('User Data:', userData)
      if (!userData) {
        console.error('Erro: Nenhum usuário logado encontrado no localStorage')
        router.push('/auth')
        return
      }

      try {
        const username = userData.username
        const userRole = userData.roles || userData.permissao || 'ACADEMICO'

        const userEndpoint =
          userRole === 'ADMINISTRADOR'
            ? `${process.env.NEXT_PUBLIC_API_URL}/administrador/consultar/${userData.idUsuario}`
            : `${process.env.NEXT_PUBLIC_API_URL}/academico/buscar/${username}`

        const response = await axios.get(userEndpoint, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        
        // Fetch goals and format them correctly
        const goals = await getGoals(response.data.idAcademico)
        const sortedGoals = goals
          .sort((a: any, b: any) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime())
          .slice(0, 2) // Get only 2 most recent goals

        // Fetch achievements
        const achievements = await fetchAchievements(response.data.idAcademico, localStorage.getItem('token'))
        const sortedAchievements = achievements
          .sort((a: any, b: any) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime())
          .slice(0, 2)
        
        // Fetch campeonatos using championshipService
        const fetchedCampeonatos = await getChampionships()

        const userDataWithExtras = {
          ...response.data,
          metas: sortedGoals.map((goal: any) => ({
            titulo: goal.titulo || 'Sem Título',
            progresso: `${goal.quantidadeConcluida ?? 0}/${goal.quantidadeObjetivo ?? 0} ${goal.itemQuantificado || ''}`,
            status: (goal.quantidadeConcluida !== undefined && goal.quantidadeObjetivo !== undefined)
              ? (goal.quantidadeConcluida >= goal.quantidadeObjetivo ? 'Concluída' : 'Em andamento')
              : 'Em andamento',
          })),
          conquistas: sortedAchievements.map((achievement: any) => 
            `${achievement.metaEsportiva.titulo} - ${achievement.conquistado ? 'Conquistado' : 'Em andamento'}`
          ),
          campeonatos: fetchedCampeonatos.map((campeonato: any) => ({
            nome: campeonato.titulo,
            posicao: campeonato.posicao,
            data: campeonato.dataFim,
          })),
        }
        
        setUser(userDataWithExtras)
        setCampeonatos(userDataWithExtras.campeonatos) // Set campeonatos state
      } catch (error: unknown) {
        console.error('Erro ao carregar dados do usuário logado:', error)
        router.push('/auth')
      } finally {
        setLoading(false)
      }
    }

    const fetchBannerImage = async () => {
      try {
        const response = await fetch('https://source.unsplash.com/random/1600x400')
        setBannerUrl(response.url)
      } catch (error) {
        console.error('Erro ao carregar imagem do banner:', error)
      }
    }

    loadUser()
    fetchBannerImage()
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
            <div
              className="w-full h-48 bg-gray-300 dark:bg-gray-700 rounded-lg"
              style={{
                backgroundImage: `url(${bannerUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            
            {/* Foto e Botão Editar */}
            <div className="flex justify-between items-start px-4">
              <img
                src={user?.foto || `https://via.placeholder.com/50`}
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
                  {user?.telefone && <p><strong>Telefone:</strong> {formatPhoneNumber(user.telefone)}</p>}
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
                {/* Metas */}
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <Link href="/goals">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-500" />
                        Metas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {user?.metas?.length > 0 ? (
                          user.metas.map((meta, index) => (
                            <li key={index} className="text-sm">
                              {meta.titulo} - {meta.status || 'Em andamento'}
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-gray-500">Nenhuma meta cadastrada</li>
                        )}
                      </ul>
                      <p className="text-blue-500 mt-2">Ver todas as metas</p>
                    </CardContent>
                  </Link>
                </Card>

                {/* Conquistas */}
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <Link href="/achievements">
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
                      <p className="text-yellow-500 mt-2">Ver todas as conquistas</p>
                    </CardContent>
                  </Link>
                </Card>

                {/* Campeonatos */}
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <Link href="profile/tournament">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Trophy  className="w-5 h-5 text-purple-500" />
                        Campeonatos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {campeonatos.slice(0, 2).map((campeonato, index) => (
                          <li key={index} className="text-sm">
                            {campeonato.nome}
                          </li>
                        ))}
                      </ul>
                      <p className="text-purple-500 mt-2">Ver todos os campeonatos</p>
                    </CardContent>
                  </Link>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}