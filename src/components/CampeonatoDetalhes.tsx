'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getChampionshipById } from '@/services/championshipService'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Lock, MapPin } from 'lucide-react'

interface Campeonato {
  titulo: string
  descricao: string
  aposta: string
  dataInicio: string
  dataFim: string
  limiteTimes: number
  limiteParticipantes: number
  privacidadeCampeonato: string
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

interface CampeonatoDetalhesProps {
  campeonato: Campeonato
}

const CampeonatoDetalhes: React.FC<CampeonatoDetalhesProps> = ({ campeonato }) => {
  return (
    <div className="campeonato-detalhes">
      <p>
        <strong>Título:</strong> {campeonato.titulo}
      </p>
      <p><strong>Descrição:</strong> {campeonato.descricao}</p>
      <p><strong>Aposta:</strong> {campeonato.aposta}</p>
      <p><strong>Início:</strong> {new Date(campeonato.dataInicio).toLocaleDateString()}</p>
      <p><strong>Fim:</strong> {new Date(campeonato.dataFim).toLocaleDateString()}</p>
      <p><strong>Participantes:</strong> {campeonato.limiteParticipantes}</p>
      <p><strong>Times:</strong> {campeonato.limiteTimes}</p>
      <p>
        <strong>Privacidade:</strong> {campeonato.privacidadeCampeonato === 'PUBLICO' ? 'Público' : 'Privado'}
        <Lock className="inline ml-2" size={16} color={campeonato.privacidadeCampeonato === 'PUBLICO' ? 'green' : 'red'} />
      </p>
      <p><strong>Criador:</strong> {campeonato.usernameCriador}</p>
      <p>
        <strong>Endereço:</strong> {`${campeonato.endereco.rua}, ${campeonato.endereco.numero}, ${campeonato.endereco.bairro}, ${campeonato.endereco.cidade} - ${campeonato.endereco.uf}, CEP: ${campeonato.endereco.cep}`}
        <MapPin className="inline ml-2" size={16} color="blue" />
      </p>
      {/* ...add more details as needed... */}
    </div>
  )
}

export default function ChampionshipDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [campeonato, setCampeonato] = useState<Campeonato | null>(null)

  useEffect(() => {
    const fetchCampeonato = async () => {
      const token = localStorage.getItem('jwt') || localStorage.getItem('token')
      try {
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
          <Card>
            <CardHeader>
              <CardTitle>{campeonato.titulo}</CardTitle>
            </CardHeader>
            <CardContent>
              <CampeonatoDetalhes campeonato={campeonato} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}