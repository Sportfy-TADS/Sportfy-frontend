'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { useQuery } from '@tanstack/react-query'
import { jwtDecode } from 'jwt-decode'
import { toast, Toaster } from 'sonner'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Função para buscar informações de uso do acadêmico
async function fetchUsoAcademico(id: string | null) {
  const response = await fetch(`http://localhost:8081/academico/uso/${id}`)
  if (!response.ok) {
    throw new Error('Erro ao buscar informações de uso do acadêmico')
  }
  return response.json()
}

export default function Statistics() {
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      const decodedToken = jwtDecode<{ idUsuario: string }>(token)
      setUserId(decodedToken.idUsuario)
    } else {
      toast.error('Usuário não está logado.')
      router.push('/auth')
    }
  }, [router])

  const { data: usoAcademico, isLoading } = useQuery({
    queryKey: ['usoAcademico', userId],
    queryFn: () => fetchUsoAcademico(userId),
    enabled: !!userId,
  })

  return (
    <>
      <Header />
      <Toaster richColors />
      <div className="flex h-screen">
        <Sidebar className="flex-none" />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-6">
            <div className="container mx-auto">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                Estatísticas do Jogador
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  <Skeleton className="w-full h-32 rounded-lg" />
                ) : usoAcademico ? (
                  <Card className="shadow-md bg-white dark:bg-gray-800">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100">
                        Informações de Uso do Acadêmico
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col space-y-2">
                      <span className="text-gray-700 dark:text-gray-300">
                        Total de Campeonatos Participados:{' '}
                        {usoAcademico.totalCampeonatosParticipados}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        Total de Modalidades Inscritas:{' '}
                        {usoAcademico.totalModalidadesInscritas}
                      </span>
                    </CardContent>
                  </Card>
                ) : (
                  <p className="text-gray-700 dark:text-gray-300">
                    Nenhuma informação de uso disponível.
                  </p>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
