'use client'

import React from 'react'
import { Toaster } from 'sonner'

import Header from '@/components/Header'
import { Skeleton } from '@/components/ui/skeleton'
import { useStatistics } from '@/hooks/useStatistics'
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  Tooltip,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart'
import Sidebar from '@/components/Sidebar'

export default function Statistics() {
  const {
    usoAcademico,
    isLoadingUsoAcademico,
    errorUsoAcademico,
  } = useStatistics()

  // Prepare chart data based on usoAcademico
  const chartData = usoAcademico
    ? [
        {
          name: 'Campeonatos',
          total: usoAcademico.totalCampeonatosParticipados,
        },
        {
          name: 'Modalidades Inscritas',
          total: usoAcademico.totalModalidadesInscritas,
        },
      ]
    : []

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
        <Sidebar className="flex-none w-64" />
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
          ) : usoAcademico ? (
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
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
            </ChartContainer>
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
