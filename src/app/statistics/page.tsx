'use client'

import { Toaster } from 'sonner'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useStatistics } from '@/hooks/useStatistics'

export default function Statistics() {
  const {
    userId,
    userData,
    isLoadingUserData,
    errorUserData,
    academicoId,
    usoAcademico,
    isLoadingUsoAcademico,
    errorUsoAcademico,
  } = useStatistics()

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
