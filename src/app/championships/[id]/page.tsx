'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getChampionshipById } from '@/services/championshipService'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import CampeonatoDetalhes from '@/components/CampeonatoDetalhes'
import CampeonatoTimes from '@/components/CampeonatoTimes'
import CampeonatoStatus from '@/components/CampeonatoStatus'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs' // Import ShadCN Tabs

interface Campeonato {
  idCampeonato: number
  titulo: string
  descricao: string
  aposta: string
  dataInicio: string
  dataFim: string
  limiteTimes: number
  limiteParticipantes: number
  privacidadeCampeonato: string
  situacaoCampeonato: string
  usernameCriador?: string
  endereco: {
    rua: string
    numero: string
    bairro: string
    cidade: string
    uf: string
    cep: string
  }
}

interface Time {
  id: number
  nome: string
  // ... other fields ...
}

export default function ChampionshipDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const router = useRouter()

  const [campeonato, setCampeonato] = useState<Campeonato | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<number>(0)
  const [times, setTimes] = useState<Time[]>([])

  useEffect(() => {
    const fetchCampeonato = async () => {
      try {
        const token = localStorage.getItem('jwt') || localStorage.getItem('token')
        const data = await getChampionshipById(id, token || undefined)
        setCampeonato(data)
      } catch (err: any) {
        console.error('Erro ao carregar detalhes do campeonato:', err)
        setError('Erro ao carregar detalhes do campeonato.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCampeonato()
  }, [id])

  useEffect(() => {
    const fetchTimes = async () => {
      try {
        const timesData = await getTimesByChampionshipId(id)
        setTimes(timesData)
      } catch (error: any) {
        console.error('Erro ao carregar times:', error)
        setError(error.message || 'Erro ao carregar times.')
      }
    }

    fetchTimes()
  }, [id])

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="flex h-screen">
          <Sidebar className="h-full" />
          <div className="flex-1 p-4 overflow-y-auto">
            <p>Carregando detalhes do campeonato...</p>
          </div>
        </div>
      </>
    )
  }

  if (error || !campeonato) {
    return (
      <>
        <Header />
        <div className="flex h-screen">
          <Sidebar className="h-full" />
          <div className="flex-1 p-4 overflow-y-auto">
            <p>{error || 'Campeonato não encontrado.'}</p>
            <button onClick={() => router.push('/championships')} className="mt-4 text-blue-500 underline">
              Voltar para a lista de campeonatos
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="flex h-screen">
        <Sidebar className="h-full" />
        <div className="flex-1 p-4 overflow-y-auto">
          <Tabs value={selectedTab.toString()} onValueChange={(value) => setSelectedTab(Number(value))}>
            <TabsList className="flex space-x-4 mb-6">
              <TabsTrigger value="0">Detalhes</TabsTrigger>
              <TabsTrigger value="1">Times</TabsTrigger>
              <TabsTrigger value="2">Andamento</TabsTrigger>
            </TabsList>
            <TabsContent value="0">
              <CampeonatoDetalhes campeonato={campeonato} />
            </TabsContent>
            <TabsContent value="1">
              <CampeonatoTimes campeonatoId={campeonato.idCampeonato} times={times} />
            </TabsContent>
            <TabsContent value="2">
              <CampeonatoStatus situacaoCampeonato={campeonato.situacaoCampeonato} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}