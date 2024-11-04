'use client'

import { useState, useEffect } from 'react'

import Header from '@/components/Header'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select' // Importando o Select do shadcnUI
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'

// Tipagem para Competição e Confrontos
interface Competition {
  id: number
  name: string
  date: string
  type: string
  teams?: number
  people?: number
  confrontos: { fase: string; time1: string; time2: string }[]
}

export default function ChavesGeradasPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [filteredCompetitions, setFilteredCompetitions] = useState<
    Competition[]
  >([])
  const [filter, setFilter] = useState('all') // Adicionando estado de filtro

  // Buscar todas as competições do json-server
  useEffect(() => {
    const fetchCompetitions = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/competitions`)
      const data = await res.json()
      setCompetitions(data)
      setFilteredCompetitions(data) // Inicialmente mostrar todas as competições
    }

    fetchCompetitions()
  }, [])

  // Atualizar lista de competições quando o filtro mudar
  useEffect(() => {
    if (filter === 'all') {
      setFilteredCompetitions(competitions)
    } else {
      setFilteredCompetitions(
        competitions.filter((comp) => comp.type === filter),
      )
    }
  }, [filter, competitions])

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100 dark:bg-gray-900">
        <div className="w-full max-w-6xl bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-center mb-8 text-emerald-600 dark:text-emerald-400">
            Chaves Geradas das Competições
          </h1>

          {/* Filtro de competições */}
          <div className="mb-6 flex justify-end">
            <div className="w-48">
              <Select
                onValueChange={(value) => setFilter(value)}
                defaultValue="all"
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filtrar Competições" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="individual">Individuais</SelectItem>
                  <SelectItem value="grupo">Em Grupo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredCompetitions.length > 0 ? (
            <div className="space-y-8">
              {filteredCompetitions.map((competition) => (
                <Card key={competition.id}>
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">
                      {competition.name}
                    </CardTitle>
                    <p className="text-gray-600 dark:text-gray-300">
                      Data: {new Date(competition.date).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      Tipo:{' '}
                      {competition.type === 'individual'
                        ? 'Individual'
                        : 'Em Grupo'}
                    </p>
                    {competition.type === 'grupo' && (
                      <p className="text-gray-600 dark:text-gray-300">
                        Times: {competition.teams}
                      </p>
                    )}
                    {competition.type === 'individual' && (
                      <p className="text-gray-600 dark:text-gray-300">
                        Participantes: {competition.people}
                      </p>
                    )}
                  </CardHeader>

                  <CardContent>
                    <div className="border rounded-lg overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fase</TableHead>
                            <TableHead>Participante 1</TableHead>
                            <TableHead>Participante 2</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {competition.confrontos.map((confronto, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                {confronto.fase}
                              </TableCell>
                              <TableCell>{confronto.time1}</TableCell>
                              <TableCell>{confronto.time2}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-700 dark:text-gray-300">
              Nenhuma competição encontrada.
            </p>
          )}
        </div>
      </div>
    </>
  )
}
