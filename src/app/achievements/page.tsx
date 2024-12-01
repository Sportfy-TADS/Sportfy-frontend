'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { Target, CircleDashed, SignalHigh } from 'lucide-react'
import { toast } from 'sonner'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchAchievements } from '@/http/achievements'
import { getUserData } from '@/utils/auth'

interface Achievement {
  id: number
  metaEsportiva: {
    titulo: string
    descricao: string
    idModalidadeEsportiva: number
    progressoMaximo: number
  }
  progressoAtual: number
  conquistado: boolean
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [isBlocked, setIsBlocked] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loadAchievements = async () => {
      const userData = getUserData()
      console.log('User Data:', userData)
      if (!userData) {
        console.error('Erro: Nenhum usuário logado encontrado no localStorage')
        router.push('/auth')
        return
      }

      try {
        const achievementsData = await fetchAchievements(
          userData.idAcademico,
          localStorage.getItem('token'),
        )
        setAchievements(achievementsData)
      } catch (error: any) {
        if (error.message.includes('403')) {
          setIsBlocked(true)
        } else {
          console.error('Erro ao carregar conquistas:', error)
          toast.error('Erro ao carregar conquistas.')
        }
      } finally {
        setLoading(false)
      }
    }

    loadAchievements()
  }, [router])

  const getModalidadeName = (id: number) => {
    const modalidades: { [key: number]: string } = {
      1: 'Futebol',
      2: 'Vôlei',
      3: 'Basquete',
      4: 'Tênis de Mesa',
      5: 'Handebol',
    }
    return modalidades[id] || 'Desconhecido'
  }

  const getAchievementIcon = (modalidadeId: number) => {
    const icons: { [key: number]: string } = {
      1: '⚽️',
      2: '🏐',
      3: '🏀',
      4: '🏓',
      5: '🤾',
    }
    return icons[modalidadeId] || '🏅'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <div className="flex">
          <Sidebar />
          <div className="container mx-auto p-4">
            <Skeleton className="w-full h-48 bg-gray-800" />
            <div className="mt-4 space-y-4">
              <Skeleton className="h-8 w-48 bg-gray-800" />
              <Skeleton className="w-full h-32 bg-gray-800" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isBlocked) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <div className="flex">
          <Sidebar />
          <div className="container mx-auto p-4">
            <p className="text-center text-red-500">
              O acadêmico bloqueou a visualização das conquistas.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const achievementsByModalidade = achievements.reduce(
    (acc, achievement) => {
      const modalidade = getModalidadeName(
        achievement.metaEsportiva.idModalidadeEsportiva,
      )
      if (!acc[modalidade]) {
        acc[modalidade] = []
      }
      acc[modalidade].push(achievement)
      return acc
    },
    {} as { [key: string]: Achievement[] },
  )

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="flex flex-col lg:flex-row">
        <Sidebar />
        <div className="container mx-auto p-4 flex-1">
          <h1 className="text-4xl font-bold mb-8">Conquistas</h1>

          {Object.entries(achievementsByModalidade).map(
            ([modalidade, modalidadeAchievements]) => (
              <div key={modalidade} className="mb-12">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">{modalidade}</h2>
                  <button className="text-sm text-gray-400 hover:text-white transition-colors">
                    Ver tudo
                  </button>
                </div>

                <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-8">
                  {modalidadeAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex flex-col items-center w-full sm:w-1/2 md:w-1/3 lg:w-1/6"
                    >
                      <div
                        className={`relative w-24 h-24 rounded-full mb-3 ${
                          achievement.conquistado
                            ? 'bg-gradient-to-br from-orange-500 to-yellow-500'
                            : 'bg-gray-800 opacity-50'
                        } before:absolute before:inset-0 before:rounded-full before:border-2 before:border-yellow-500 before:transform before:scale-110`}
                      >
                        <div className="absolute inset-0 flex items-center justify-center text-3xl">
                          {getAchievementIcon(
                            achievement.metaEsportiva.idModalidadeEsportiva,
                          )}
                        </div>
                      </div>
                      <div className="text-center">
                        <h3 className="font-medium text-sm mb-1">
                          {achievement.metaEsportiva.titulo}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {(
                            (achievement.progressoAtual /
                              achievement.metaEsportiva.progressoMaximo) *
                            100
                          ).toFixed(0)}
                          % completo
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {modalidadeAchievements.map((achievement) => (
                    <Card
                      key={achievement.id}
                      className={`border border-gray-800 ${
                        achievement.conquistado ? 'bg-gray-800' : 'bg-gray-900'
                      }`}
                    >
                      <CardHeader>
                        <CardTitle className="flex justify-between items-center text-lg">
                          <span>{achievement.metaEsportiva.titulo}</span>
                          <span className="text-2xl">
                            {getAchievementIcon(
                              achievement.metaEsportiva.idModalidadeEsportiva,
                            )}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center text-sm">
                          <Target
                            className={`w-5 h-5 mr-3 ${achievement.conquistado ? 'text-green-500' : 'text-gray-500'}`}
                          />
                          <p>{achievement.metaEsportiva.descricao}</p>
                        </div>
                        <div className="flex items-center text-sm">
                          <CircleDashed
                            className={`w-5 h-5 mr-3 ${achievement.conquistado ? 'text-green-500' : 'text-gray-500'}`}
                          />
                          <p>
                            Progresso: {achievement.progressoAtual} /{' '}
                            {achievement.metaEsportiva.progressoMaximo}
                          </p>
                        </div>
                        <div className="flex items-center text-sm">
                          <SignalHigh
                            className={`w-5 h-5 mr-3 ${achievement.conquistado ? 'text-green-500' : 'text-gray-500'}`}
                          />
                          <p>
                            {(
                              (achievement.progressoAtual /
                                achievement.metaEsportiva.progressoMaximo) *
                              100
                            ).toFixed(0)}
                            % completo
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  )
}
