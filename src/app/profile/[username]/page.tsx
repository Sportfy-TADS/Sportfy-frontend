'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'

interface Estatisticas {
  modalidade: string
  vitorias: number
  derrotas: number
  jogos: number
  avaliacao: {
    media: number
    quantidadeAvaliacoes: number
  }
}

interface Academico {
  idAcademico: number
  curso: string
  username: string
  email: string
  nome: string
  genero: string
  telefone: string
  dataNascimento: string
  modalidades: Array<{
    idModalidade: number
    nomeModalidade: string
  }>
}

interface Campeonato {
  idCampeonato: number
  titulo: string
  descricao: string
  dataInicio: string
  dataFim: string
  situacaoCampeonato: string
  aposta: string | null
}

function formatPhoneNumber(phoneNumber: string) {
  const cleaned = phoneNumber.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phoneNumber;
}

export default function ProfilePage() {
  const { username } = useParams()
  const [user, setUser] = useState<Academico | null>(null)
  const [loading, setLoading] = useState(true)
  const [bannerUrl, setBannerUrl] = useState<string | null>(null)
  const [estatisticas, setEstatisticas] = useState<Estatisticas[]>([])
  const [campeonatos, setCampeonatos] = useState<Campeonato[]>([])

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch(
          `http://localhost:8081/academico/buscar/${username}`
        )
        const data = await response.json()
        setUser(data)

        if (data.modalidades) {
          const statsPromises = data.modalidades.map(async (modalidade) => {
            const statsResponse = await fetch(
              `http://localhost:8081/academico/buscar/estatisticas/${data.idAcademico}/modalidade/${modalidade.idModalidade}`
            )
            return statsResponse.json()
          })
          const stats = await Promise.all(statsPromises)
          setEstatisticas(stats)
        }

        const champResponse = await fetch(
          `http://localhost:8081/campeonatos/historico/academico/${data.idAcademico}?page=0&size=3&sort=dataCriacao,desc`
        )
        if (champResponse.ok) {
          const champData = await champResponse.json()
          setCampeonatos(champData.content)
        }

        const bannerResponse = await fetch('https://source.unsplash.com/random/1600x400')
        setBannerUrl(bannerResponse.url)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [username])

  if (loading) {
    return <div><Header /><div className="flex"><Sidebar /><div className="container mx-auto p-4">Loading...</div></div></div>
  }

  if (!user) {
    return <div><Header /><div className="flex"><Sidebar /><div className="container mx-auto p-4">User not found</div></div></div>
  }

  return (
    <div>
      <Header />
      <div className="flex">
        <Sidebar />
        <div className="container mx-auto p-4">
          {/* Banner Section */}
          <div className="relative mb-16">
            <div
              className="w-full h-48 bg-gray-300 rounded-lg"
              style={{
                backgroundImage: `url(${bannerUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div className="absolute -bottom-12 left-4">
              <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800 border-4 border-white dark:border-gray-800">
                <img
                  src="https://via.placeholder.com/150"
                  alt={user?.nome}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Basic Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* User Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle>{user?.nome}</CardTitle>
                  <p className="text-gray-500">@{user?.username}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Curso:</strong> {user?.curso}</p>
                  <p><strong>Telefone:</strong> {formatPhoneNumber(user?.telefone)}</p>
                  <p><strong>Data de Nascimento:</strong> {new Date(user?.dataNascimento || '').toLocaleDateString('pt-BR')}</p>
                  <p><strong>Gênero:</strong> {user?.genero}</p>
                </CardContent>
              </Card>

              {/* Modalidades Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Modalidades</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {user?.modalidades.map((modalidade) => (
                    <div
                      key={modalidade.idModalidade}
                      className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md"
                    >
                      {modalidade.nomeModalidade}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Stats and Championships side by side */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Statistics Section */}
              <div>
                <h2 className="text-xl font-bold mb-4">Estatísticas por Modalidade</h2>
                <div className="space-y-4">
                  {estatisticas.map((estatistica, index) => (
                    <Card key={index} className="shadow-md">
                      <CardHeader>
                        <CardTitle>{estatistica.modalidade}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span>Jogos:</span>
                          <span className="font-semibold">{estatistica.jogos}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Vitórias:</span>
                          <span className="font-semibold text-green-600">{estatistica.vitorias}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Derrotas:</span>
                          <span className="font-semibold text-red-600">{estatistica.derrotas}</span>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="flex justify-between items-center">
                            <span>Média de Avaliação:</span>
                            <span className="font-semibold">
                              {estatistica.avaliacao.media.toFixed(1)}
                              <span className="text-gray-500 text-xs ml-1">
                                ({estatistica.avaliacao.quantidadeAvaliacoes} {estatistica.avaliacao.quantidadeAvaliacoes === 1 ? 'avaliação' : 'avaliações'})
                              </span>
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Championships Section */}
              <div>
                <h2 className="text-xl font-bold mb-4">Histórico de Campeonatos</h2>
                <div className="space-y-4">
                  {campeonatos.map((campeonato) => (
                    <Card key={campeonato.idCampeonato} className="shadow-md">
                      <CardHeader>
                        <CardTitle>{campeonato.titulo}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <p className="text-gray-600">{campeonato.descricao}</p>
                        <div className="flex justify-between items-center pt-2">
                          <span>Situação:</span>
                          <span className={`font-semibold ${
                            campeonato.situacaoCampeonato === 'EM_ABERTO' 
                              ? 'text-blue-600' 
                              : campeonato.situacaoCampeonato === 'INICIADO'
                              ? 'text-green-600'
                              : 'text-gray-600'
                          }`}>
                            {campeonato.situacaoCampeonato.replace('_', ' ')}
                          </span>
                        </div>
                        {campeonato.aposta && (
                          <div className="flex justify-between items-center">
                            <span>Premiação:</span>
                            <span className="font-semibold">{campeonato.aposta}</span>
                          </div>
                        )}
                        <div className="pt-2 border-t text-xs text-gray-500">
                          <p>Início: {new Date(campeonato.dataInicio).toLocaleDateString('pt-BR')}</p>
                          <p>Fim: {new Date(campeonato.dataFim).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}