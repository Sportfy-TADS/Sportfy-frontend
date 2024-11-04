'use client'

import { useEffect, useState } from 'react'

import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Team {
  id: number
  name: string
  members: string[]
  competition: string
  status: string
}

export default function CompetitionsPage() {
  const [teams, setTeams] = useState<Team[]>([]) // Especificando o tipo Team[]

  useEffect(() => {
    const fetchTeams = async () => {
      const response = await fetch('http://localhost:3001/teams')
      const data = await response.json()
      setTeams(data)
    }

    fetchTeams()
  }, [])

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-emerald-600">
          Competições de Equipes
        </h1>
        <div className="mt-8 w-full max-w-2xl space-y-4">
          {teams.map((team) => (
            <Card key={team.id} className="shadow-md">
              <CardHeader>
                <CardTitle>{team.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  <strong>Competição:</strong> {team.competition}
                </p>
                <p>
                  <strong>Membros:</strong> {team.members.join(', ')}
                </p>
                <p>
                  <strong>Status:</strong> {team.status}
                </p>
                <Button variant="outline" className="mt-4">
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}
