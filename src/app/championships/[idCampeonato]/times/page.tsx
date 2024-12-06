'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { UsersIcon, KeyIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
// import { Breadcrumb, Breadcrumb, BreadcrumbItem } from '@/components/ui/breadcrumb'

async function fetchTimes(idCampeonato: string) {
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
  const [times, setTimes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {times.map((time: any) => (
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
