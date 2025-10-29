'use client'


import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts'
import { Toaster } from 'sonner'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { useStatistics } from '@/hooks/useStatistics'
import { EstatisticaPorModalidade, UsoAcademico } from '@/interface/types'

export default function Statistics() {
  const { usoAcademico, isLoadingUsoAcademico, errorUsoAcademico } =
    useStatistics()

  // Type assertion to ensure proper typing
  const typedUsoAcademico = usoAcademico as UsoAcademico | undefined

  // Prepare chart data based on usoAcademico
  const chartData = typedUsoAcademico
    ? [
        {
          name: 'Campeonatos Criados',
          total: typedUsoAcademico.totalCampeonatosCriados,
        },
        {
          name: 'Campeonatos Participados',
          total: typedUsoAcademico.totalCampeonatosParticipados,
        },
        {
          name: 'Modalidades Inscritas',
          total: typedUsoAcademico.totalModalidadesEsportivasInscritas,
        },
        {
          name: 'Metas Esportivas Inscritas',
          total: typedUsoAcademico.totalMetasEsportivasInscritas,
        },
        {
          name: 'Conquistas Alcançadas',
          total: typedUsoAcademico.totalConquistasAlcancadas,
        },
      ]
    : []

  // Prepare chart data for each sport modality
  const chartDataByModality =
    typedUsoAcademico?.listaEstatisticaPorModalidadeEsportivaDto.map(
      (modality: EstatisticaPorModalidade) => ({
        name: modality.nomeModalidadeEsportiva,
        metas: modality.totalMetasEsportivasInscritas,
        conquistas: modality.totalConquistasAlcancadas,
        criados: modality.totalCampeonatosCriados,
        participados: modality.totalCampeonatosParticipados,
      }),
    ) || []

  // Define chartConfig for the chart
  const chartConfig: ChartConfig = {
    total: {
      label: 'Total',
      color: '#2563eb',
    },
  }

  return (
    <>
      <Header />
      <Toaster richColors />
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col p-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            Estatísticas do Jogador
          </h1>
          {isLoadingUsoAcademico ? (
            <Skeleton className="w-full h-64 rounded-lg" />
          ) : errorUsoAcademico ? (
            <p className="text-red-500">
              Erro ao carregar os dados de uso acadêmico.
            </p>
          ) : typedUsoAcademico ? (
            <>
              <ChartContainer
                config={chartConfig}
                className="h-[200px] w-full mb-10"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                    />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="total" fill="var(--color-total)" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-6 mb-4">
                Estatísticas por Modalidade Esportiva
              </h2>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartDataByModality} barCategoryGap="20%">
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                    />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="metas" fill="#34d399" radius={4} />
                    <Bar dataKey="conquistas" fill="#fbbf24" radius={4} />
                    <Bar dataKey="criados" fill="#60a5fa" radius={4} />
                    <Bar dataKey="participados" fill="#f87171" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </>
          ) : (
            <p className="text-gray-700 dark:text-gray-300">
              Nenhuma informação de uso disponível.
            </p>
          )}
        </div>
      </div>
    </>
  )
}
