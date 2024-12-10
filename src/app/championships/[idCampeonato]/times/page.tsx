'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import { UsersIcon, KeyIcon } from 'lucide-react'
import { toast } from 'sonner'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// import { Breadcrumb, Breadcrumb, BreadcrumbItem } from '@/components/ui/breadcrumb'

interface Time {
  idTime: number
  nome: string
  campeonato: string
  senhaCampeonato?: string
}

async function fetchTimes(idCampeonato: string): Promise<Time[]> {
  try {
    const token = localStorage.getItem('token')
    console.log('Fetching teams with token:', token)
    const res = await fetch(
      `http://localhost:8081/campeonatos/${idCampeonato}/times`,
      {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    )
    console.log('Response status:', res.status)
    if (!res.ok)
      throw new Error(`Falha ao carregar os times: ${res.statusText}`)
    const times = await res.json()
    console.log('Fetched teams:', times)
    return times
  } catch (error) {
    console.error('Error fetching teams:', error)
    throw new Error('Erro desconhecido ao carregar os times.')
  }
}

export default function TimesPage({
  params,
}: {
  params: { idCampeonato: string }
}) {
  const [times, setTimes] = useState<Time[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<Time | null>(null)
  const [teamPassword, setTeamPassword] = useState<string>('')
  const [joinedTeams, setJoinedTeams] = useState<Set<number>>(new Set())
  const [currentTeam, setCurrentTeam] = useState<number | null>(null)

  const handleJoinTeam = (team: Time) => {
    if (currentTeam) {
      toast.error('Você já está em um time.')
      return
    }
    if (team.senhaCampeonato) {
      setSelectedTeam(team)
    } else {
      // Logic to join the team without password
      console.log(`Joining team ${team.nome} without password`)
      setJoinedTeams((prev) => new Set(prev).add(team.idTime))
      setCurrentTeam(team.idTime)
      toast.success(`Você entrou no time ${team.nome}`)
    }
  }

  const handleSubmitPassword = () => {
    if (selectedTeam && teamPassword === selectedTeam.senhaCampeonato) {
      // Logic to join the team with password
      console.log(`Joining team ${selectedTeam.nome} with password`)
      setJoinedTeams((prev) => new Set(prev).add(selectedTeam.idTime))
      setCurrentTeam(selectedTeam.idTime)
      toast.success(`Você entrou no time ${selectedTeam.nome}`)
      setSelectedTeam(null)
      setTeamPassword('')
    } else {
      console.error('Incorrect password')
      toast.error('Senha incorreta')
    }
  }

  const handleLeaveTeam = (teamId: number) => {
    setJoinedTeams((prev) => {
      const newSet = new Set(prev)
      newSet.delete(teamId)
      return newSet
    })
    setCurrentTeam(null)
    toast.info('Você saiu do time')
  }

  useEffect(() => {
    const loadTimes = async () => {
      try {
        const fetchedTimes = await fetchTimes(params.idCampeonato)
        setTimes(fetchedTimes)
      } catch (err: any) {
        setError(err.message || 'Erro desconhecido ao carregar os times.')
      } finally {
        setLoading(false)
      }
    }

    loadTimes()
  }, [params.idCampeonato])

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        document.querySelector('body > nextjs-portal')?.remove()
      }, 10)
    }
  }, [])

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="text-center py-4">
              <p className="text-muted-foreground">Carregando times...</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="text-center py-4">
              <p className="text-red-500">{error}</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 p-4 overflow-y-auto">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">
                Times do Campeonato
              </CardTitle>
              <UsersIcon className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {Array.isArray(times) && times.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome do Time</TableHead>
                        <TableHead>ID do Time</TableHead>
                        <TableHead>ID do Campeonato</TableHead>
                        <TableHead>Senha do Campeonato</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {times.map((time: Time) => (
                        <TableRow key={time.idTime}>
                          <TableCell className="font-medium">
                            {time.nome}
                          </TableCell>
                          <TableCell>{time.idTime}</TableCell>
                          <TableCell>{time.campeonato}</TableCell>
                          <TableCell>
                            {time.senhaCampeonato ? (
                              <Badge variant="secondary">
                                {time.senhaCampeonato}
                              </Badge>
                            ) : (
                              <Badge variant="outline">não precisa</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {joinedTeams.has(time.idTime) ? (
                              <Button
                                onClick={() => handleLeaveTeam(time.idTime)}
                              >
                                Sair
                              </Button>
                            ) : (
                              <Button onClick={() => handleJoinTeam(time)}>
                                Entrar
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {selectedTeam && (
                    <div className="mt-4">
                      <p>
                        Digite a senha para entrar no time {selectedTeam.nome}:
                      </p>
                      <Input
                        type="password"
                        value={teamPassword}
                        onChange={(e) => setTeamPassword(e.target.value)}
                        placeholder="Senha do Campeonato"
                      />
                      <Button onClick={handleSubmitPassword} className="ml-2">
                        Enviar
                      </Button>
                    </div>
                  )}
                  <div className="mt-4 flex justify-end">
                    <Link
                      href={`/championships/${params.idCampeonato}/times/tablekeys`}
                    >
                      <Button
                        variant="outline"
                        className="flex items-center space-x-2"
                      >
                        <KeyIcon className="h-4 w-4" />
                        <span>Ver Chaveamento</span>
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">
                    Nenhum time encontrado.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
