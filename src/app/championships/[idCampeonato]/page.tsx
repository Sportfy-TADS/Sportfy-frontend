'use client'

import { useState, useEffect, use } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { CalendarIcon, LockIcon, UnlockIcon } from 'lucide-react'
import { toast } from 'sonner'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

interface Campeonato {
  idCampeonato: number
  titulo: string
  descricao: string
  privacidadeCampeonato: 'PUBLICO' | 'PRIVADO'
  dataInicio: string
  dataFim: string
}

async function fetchCampeonato(idCampeonato: string): Promise<Campeonato> {
  const token = localStorage.getItem('token')
  const res = await fetch(
    `http://localhost:8081/campeonatos/filtrar?idCampeonato=${idCampeonato}`,
    {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )
  if (!res.ok) throw new Error('Falha ao carregar o campeonato.')
  const campeonatos = await res.json()
  return campeonatos.find(
    (campeonato: Campeonato) =>
      campeonato.idCampeonato === parseInt(idCampeonato),
  )
}

export default function CampeonatoDetailsPage(props: {
  params: Promise<{ idCampeonato: string }>
}) {
  const params = use(props.params)
  const [campeonato, setCampeonato] = useState<Campeonato | null>(null)
  const [teamName, setTeamName] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [password, setPassword] = useState('')
  const router = useRouter()

  useEffect(() => {
    const loadCampeonato = async () => {
      try {
        const data = await fetchCampeonato(params.idCampeonato)
        setCampeonato(data)
      } catch (error) {
        console.error('Erro ao carregar o campeonato:', error)
        toast.error('Erro ao carregar o campeonato.')
        router.push('/championships')
      }
    }
    loadCampeonato()
  }, [params.idCampeonato, router])

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        document.querySelector('body > nextjs-portal')?.remove()
      }, 10)
    }
  }, [])

  const handleCreateTeam = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const token = localStorage.getItem('token')
    const teamData = {
      name: teamName,
      isPrivate,
      password: isPrivate ? password : undefined,
    }
    try {
      const res = await fetch('http://localhost:8081/times', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(teamData),
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Falha ao criar o time.')
      }
      toast.success('Time criado com sucesso!')
      // Optionally, redirect or update the UI
    } catch (error) {
      console.error('Erro ao criar o time:', error)
      toast.error('Erro ao criar o time.')
    }
  }

  if (!campeonato) {
    return <div>Carregando...</div>
  }

  return (
    <>
      <Header />
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 p-4 overflow-y-auto">
          {/*
          <Breadcrumb>
            <BreadcrumbItem href="/championships">Campeonatos</BreadcrumbItem>
            <BreadcrumbItem>{campeonato.titulo}</BreadcrumbItem>
          </Breadcrumb>
          */}
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold">{campeonato.titulo}</h1>
            <div className="space-x-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button>Criar Time</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Criar Novo Time</SheetTitle>
                  </SheetHeader>
                  <form onSubmit={handleCreateTeam} className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="teamName">
                        Nome do Time <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="teamName"
                        name="teamName"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isPrivate"
                        name="isPrivate"
                        checked={isPrivate}
                        onChange={(e) => setIsPrivate(e.target.checked)}
                      />
                      <Label htmlFor="isPrivate" className="ml-2">
                        Time Privado
                      </Label>
                    </div>
                    {isPrivate && (
                      <div>
                        <Label htmlFor="password">
                          Senha <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    )}
                    <Button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      Salvar
                    </Button>
                  </form>
                </SheetContent>
              </Sheet>
              <Link href={`/championships/${campeonato.idCampeonato}/times`}>
                <Button variant="outline">Ver Times</Button>
              </Link>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informações do Campeonato</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Descrição</h2>
                  <p className="text-gray-600">{campeonato.descricao}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    {campeonato.privacidadeCampeonato === 'PUBLICO' ? (
                      <UnlockIcon className="h-5 w-5 text-green-500" />
                    ) : (
                      <LockIcon className="h-5 w-5 text-red-500" />
                    )}
                    <span>
                      {campeonato.privacidadeCampeonato === 'PUBLICO'
                        ? 'Público'
                        : 'Privado'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-5 w-5 text-blue-500" />
                    <span>
                      Início:{' '}
                      {new Date(campeonato.dataInicio).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-5 w-5 text-blue-500" />
                    <span>
                      Fim: {new Date(campeonato.dataFim).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
