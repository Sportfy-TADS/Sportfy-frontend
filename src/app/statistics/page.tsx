'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { useQuery } from '@tanstack/react-query'
import { jwtDecode } from 'jwt-decode' // Importação padrão correta
import { toast, Toaster } from 'sonner'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Função para buscar informações de uso do acadêmico
async function fetchUsoAcademico(idAcademico: number) {
  console.log('Chamando fetchUsoAcademico com idAcademico:', idAcademico)
  const response = await fetch(
    `http://localhost:8081/academico/uso/${idAcademico}`,
  )
  if (!response.ok) {
    throw new Error('Erro ao buscar informações de uso do acadêmico')
  }
  const data = await response.json()
  console.log('Dados de uso do acadêmico:', data)
  return data
}

// Função para buscar dados do usuário
async function fetchUserData(idUsuario: number) {
  console.log('Chamando fetchUserData com idUsuario:', idUsuario)
  const response = await fetch(
    `http://localhost:8081/academico/consultar/${idUsuario}`,
  )
  if (!response.ok) {
    throw new Error('Erro ao buscar dados do usuário')
  }
  const data = await response.json()
  console.log('Dados do usuário:', data)
  return data
}

export default function Statistics() {
  const [userId, setUserId] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    console.log('Token encontrado:', token)
    if (token) {
      try {
        const decodedToken: { idUsuario: number } = jwtDecode(token)
        console.log('Token decodificado:', decodedToken)
        setUserId(decodedToken.idUsuario)
      } catch (error) {
        console.error('Erro ao decodificar o token:', error)
        toast.error('Erro ao decodificar o token.')
      }
    } else {
      toast.error('Usuário não está logado.')
      router.push('/auth')
    }
  }, [router])

  // Query para buscar os dados do usuário
  const {
    data: userData,
    isLoading: isLoadingUserData,
    error: errorUserData,
  } = useQuery({
    queryKey: ['userData', userId],
    queryFn: () => fetchUserData(userId!),
    enabled: !!userId,
    onError: (error: any) => {
      console.error('Erro ao buscar dados do usuário:', error)
      toast.error('Erro ao buscar dados do usuário.')
    },
  })

  // Deriva o academicoId a partir de userData
  const academicoId = userData?.idAcademico

  // Query para buscar as estatísticas usando o academicoId
  const {
    data: usoAcademico,
    isLoading: isLoadingUsoAcademico,
    error: errorUsoAcademico,
  } = useQuery({
    queryKey: ['usoAcademico', academicoId],
    queryFn: () => fetchUsoAcademico(academicoId!),
    enabled: !!academicoId,
    onError: (error: any) => {
      console.error('Erro ao buscar uso acadêmico:', error)
      toast.error('Erro ao buscar uso acadêmico.')
    },
  })

  console.log('Estado userId:', userId)
  console.log('Estado academicoId:', academicoId)
  console.log('Estado usoAcademico:', usoAcademico)

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
                {isLoadingUserData || isLoadingUsoAcademico ? (
                  <Skeleton className="w-full h-32 rounded-lg" />
                ) : errorUserData ? (
                  <p className="text-red-500">
                    Erro ao carregar os dados do usuário:{' '}
                    {errorUserData.message}
                  </p>
                ) : errorUsoAcademico ? (
                  <p className="text-red-500">
                    Erro ao carregar os dados de uso acadêmico:{' '}
                    {errorUsoAcademico.message}
                  </p>
                ) : usoAcademico ? (
                  <>
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
                  </>
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
