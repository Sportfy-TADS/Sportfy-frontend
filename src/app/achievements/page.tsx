'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { getUserData } from '@/utils/auth'
import { fetchAchievements } from '@/http/achievements'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Target, CircleDashed, SignalHigh } from 'lucide-react'

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

const AchievementsPage = () => {
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
        const achievementsData = await fetchAchievements(userData.idAcademico, localStorage.getItem('token'))
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

  if (loading) {
    return (
      <div>
        <Header />
        <div className="flex">
          <Sidebar />
          <div className="container mx-auto p-4">
            <Skeleton className="w-full h-48 bg-gray-300" />
            <div className="mt-4 space-y-4">
              <Skeleton className="h-8 w-48 bg-gray-300" />
              <Skeleton className="w-full h-32 bg-gray-300" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isBlocked) {
    return (
      <div>
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

  return (
    <div>
      <Header />
      <div className="flex">
        <Sidebar />
        <div className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-6">Conquistas</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <Card
                key={achievement.id}
                className={`${
                  achievement.conquistado ? 'bg-green-100' : 'bg-red-100'
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{achievement.metaEsportiva.titulo}</span>
                    <span className="text-sm text-gray-500">
                      {getModalidadeName(achievement.metaEsportiva.idModalidadeEsportiva)}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-2">
                    <Target className={`w-5 h-5 ${achievement.conquistado ? 'text-green-500' : 'text-red-500'}`} />
                    <p className="ml-2">{achievement.metaEsportiva.descricao}</p>
                  </div>
                  <div className="flex items-center mb-2">
                    <CircleDashed className={`w-5 h-5 ${achievement.conquistado ? 'text-green-500' : 'text-red-500'}`} />
                    <p className="ml-2">
                      Progresso: {achievement.progressoAtual} / {achievement.metaEsportiva.progressoMaximo}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <SignalHigh className={`w-5 h-5 ${achievement.conquistado ? 'text-green-500' : 'text-red-500'}`} />
                    <p className="ml-2">
                      Desempenho: {((achievement.progressoAtual / achievement.metaEsportiva.progressoMaximo) * 100).toFixed(0)}% da conquista completa
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AchievementsPage