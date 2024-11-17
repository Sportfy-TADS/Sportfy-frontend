'use client'

import { useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { fetchAchievements } from '@/http/achievements'
import { Achievement } from '@/interface/types'
import { useTheme } from 'next-themes'

export default function AchievementsPage() {
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([])
  const [userId, setUserId] = useState<number | null>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token')

      if (token) {
        try {
          const decodedToken: any = jwtDecode(token)
          console.log('Token decodificado:', decodedToken)
          const idUsuario = decodedToken.idUsuario || decodedToken.idAcademico

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/academico/consultar/${idUsuario}`,
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            },
          )

          if (!response.ok) {
            throw new Error('Erro ao obter dados do usuário.')
          }

          const userData = await response.json()
          const idAcademico = userData.idAcademico
          console.log('idAcademico obtido:', idAcademico)

          setUserId(idAcademico)

          const achievementsData = await fetchAchievements(idAcademico, token)

          console.log('Dados das conquistas:', achievementsData)

          setUserAchievements(achievementsData)
        } catch (error) {
          console.error('Erro ao carregar conquistas:', error)
        }
      } else {
        console.error('Erro: Nenhum usuário logado encontrado no localStorage')
      }
    }

    fetchData()
  }, [])

  return (
    <>
      <Header />
      <div className="flex min-h-screen bg-white dark:bg-gray-900">
        <Sidebar />
        <div className="container mx-auto p-4 flex-1">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
            Suas Conquistas
          </h1>

          {userAchievements.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userAchievements.map((achievement) => (
                <Card
                  key={achievement.idConquista}
                  className="shadow-lg border border-emerald-500 dark:border-emerald-400 transition-colors duration-200"
                >
                  <CardHeader className="bg-emerald-50 dark:bg-emerald-900">
                    <CardTitle className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                      {achievement.metaEsportiva.titulo}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="bg-emerald-100 dark:bg-emerald-800 dark:text-emerald-100">
                    <p>{achievement.metaEsportiva.descricao}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">
              Nenhuma conquista encontrada.
            </p>
          )}
        </div>
      </div>
    </>
  )
}