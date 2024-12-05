'use client' // Added to enable client-side interactivity

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation' // Added to access route params
import { Card, CardContent } from '@/components/ui/card'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
// import { Breadcrumb, BreadcrumbItem } from '@/components/ui/breadcrumb'

type Team = {
  idTime: number
  nome: string
  campeonato: number
  senhaCampeonato: string
}

type Match = {
  id: string
  team1: Team
  team2: Team
  winner?: Team
}

async function getTimes(idCampeonato: string): Promise<Team[]> {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(
      `http://localhost:8081/campeonatos/${idCampeonato}/times`,
      {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      },
    );
    if (!res.ok) throw new Error('Falha ao carregar os times.');
    const times: Team[] = await res.json();
    return times;
  } catch (error) {
    throw new Error('Erro desconhecido ao carregar os times.');
  }
}

export default function Page() {
  const params = useParams()
  const idCampeonato = params.idCampeonato as string
  const [matches, setMatches] = useState<Match[]>([])
  const [error, setError] = useState<string | null>(null)
  const [hasAdvanced, setHasAdvanced] = useState<boolean>(false) // New state to track advancement

  useEffect(() => {
    async function fetchMatches() {
      try {
        const times = await getTimes(idCampeonato)

        if (times.length < 4) {
          throw new Error(
            'Número insuficiente de equipes para gerar o chaveamento.',
          )
        }

        // Initialize matches without winners
        const semiFinals: Match[] = [
          {
            id: 'SF1',
            team1: times[0],
            team2: times[1],
          },
          {
            id: 'SF2',
            team1: times[2],
            team2: times[3],
          },
        ]

        setMatches([...semiFinals])
      } catch (err: any) {
        setError(err.message)
        console.error(err)
      }
    }

    fetchMatches()
  }, [idCampeonato])

  const handleAdvance = () => {
    // Check if all semifinal matches have winners
    const semiFinals = matches.filter((match) => match.id.startsWith('SF'))
    const allSemiFinalsDecided = semiFinals.every((match) => match.winner)

    if (!allSemiFinalsDecided) {
      alert(
        'Por favor, selecione os vencedores de todas as semifinais antes de avançar.',
      )
      return
    }

    if (!hasAdvanced) {
      // Advance to final
      setHasAdvanced(true)
      alert(
        'Semifinais avançadas. Agora você pode selecionar o vencedor da final.',
      )
      return
    }

    // Check if final match exists and has a winner
    const finalMatch = matches.find((match) => match.id === 'F')
    if (finalMatch) {
      if (finalMatch.winner) {
        alert(`Campeão: ${finalMatch.winner.nome}`)
      } else {
        alert('Selecione o vencedor da final antes de avançar.')
      }
    } else {
      alert('Final ainda não foi configurada.')
    }
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="text-center py-4">
              <p className="text-red-500">
                {error ||
                  'Erro ao carregar os times. Por favor, tente novamente mais tarde.'}
              </p>
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
          {/* 
          <Breadcrumb>
            <BreadcrumbItem href="/championships">Campeonatos</BreadcrumbItem>
            <BreadcrumbItem href={`/championships/${idCampeonato}`}>Detalhes do Campeonato</BreadcrumbItem>
            <BreadcrumbItem href={`/championships/${idCampeonato}/times`}>Times</BreadcrumbItem>
            <BreadcrumbItem>Chaveamento</BreadcrumbItem>
          </Breadcrumb>
          */}
          <h1 className="text-3xl font-bold mb-6">Chaveamento do Campeonato</h1>
          <TournamentBracket
            matches={matches}
            setMatches={setMatches}
            hasAdvanced={hasAdvanced}
          />
          <button
            onClick={handleAdvance}
            className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Avançar
          </button>
        </div>
      </div>
    </>
  )
}

function TournamentBracket({
  matches,
  setMatches,
  hasAdvanced, // New prop
}: {
  matches: Match[]
  setMatches: (matches: Match[]) => void
  hasAdvanced: boolean
}) {
  const handleWinnerSelect = (matchId: string, winner: Team) => {
    const updatedMatches = matches.map((match) =>
      match.id === matchId ? { ...match, winner } : match,
    )

    // Check if both semifinals have winners to create/update the final match
    if (matchId.startsWith('SF')) {
      const semiFinals = updatedMatches.filter((m) => m.id.startsWith('SF'))
      const finalMatchIndex = updatedMatches.findIndex((m) => m.id === 'F')

      if (semiFinals.every((m) => m.winner)) {
        const newFinalMatch: Match = {
          id: 'F',
          team1: semiFinals[0].winner!,
          team2: semiFinals[1].winner!,
        }

        if (finalMatchIndex !== -1) {
          updatedMatches[finalMatchIndex] = newFinalMatch
        } else {
          updatedMatches.push(newFinalMatch)
        }
      }
    }

    setMatches(updatedMatches)
  }

  return (
    <div className="flex flex-col md:flex-row justify-around items-center space-y-4 md:space-y-0 md:space-x-4">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-center">Semifinais</h2>
        {matches
          .filter((match) => match.id.startsWith('SF'))
          .map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onSelectWinner={handleWinnerSelect}
              disableSelect={hasAdvanced} // Disable if hasAdvanced
            />
          ))}
      </div>
      <div>
        <h2 className="text-lg font-semibold text-center mb-4">Final</h2>
        {matches.find((match) => match.id === 'F') ? (
          <MatchCard
            match={matches.find((match) => match.id === 'F')!}
            onSelectWinner={handleWinnerSelect}
            disableSelect={
              !matches
                .filter((m) => m.id.startsWith('SF'))
                .every((m) => m.winner)
            }
          />
        ) : (
          <p className="text-muted-foreground">
            Aguardando resultados das semifinais.
          </p>
        )}
      </div>
    </div>
  )
}

function MatchCard({
  match,
  onSelectWinner,
  disableSelect = false,
}: {
  match: Match
  onSelectWinner: (matchId: string, winner: Team) => void
  disableSelect?: boolean
}) {
  return (
    <Card className={`w-64 ${match.winner ? 'border-emerald-500' : ''}`}>
      <CardContent className="p-4">
        <div className="space-y-2">
          {match.team1 && (
            <TeamName
              team={match.team1}
              isWinner={match.winner?.idTime === match.team1.idTime}
              onSelect={() =>
                !disableSelect && onSelectWinner(match.id, match.team1)
              }
            />
          )}
          {match.team2 && (
            <TeamName
              team={match.team2}
              isWinner={match.winner?.idTime === match.team2.idTime}
              onSelect={() =>
                !disableSelect && onSelectWinner(match.id, match.team2)
              }
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function TeamName({
  team,
  isWinner,
  onSelect,
}: {
  team: Team
  isWinner?: boolean
  onSelect: () => void
}) {
  return (
    <div
      className={`p-2 cursor-pointer ${
        isWinner
          ? 'bg-green-100 dark:bg-green-700 font-semibold text-black dark:text-white'
          : 'text-gray-800 dark:text-gray-200'
      }`}
      onClick={onSelect}
    >
      {team.nome}
      {isWinner && <span className="ml-2 text-green-600">✓</span>}
    </div>
  )
}
