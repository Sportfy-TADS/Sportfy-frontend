import { Card, CardContent } from "@/components/ui/card"
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Breadcrumb, BreadcrumbItem } from '@/components/ui/breadcrumb'

type Match = {
  id: string
  team1: string
  team2: string
  winner?: string
}

const matches: Match[] = [
  { id: "QF1", team1: "Time A", team2: "Time B", winner: "Time A" },
  { id: "QF2", team1: "Time C", team2: "Time D", winner: "Time C" },
  { id: "QF3", team1: "Time E", team2: "Time F", winner: "Time F" },
  { id: "QF4", team1: "Time G", team2: "Time H", winner: "Time H" },
  { id: "SF1", team1: "Time A", team2: "Time C", winner: "Time A" },
  { id: "SF2", team1: "Time F", team2: "Time H", winner: "Time H" },
  { id: "F", team1: "Time A", team2: "Time H" },
]

function TournamentBracket() {
  return (
    <div className="flex flex-col md:flex-row justify-around items-center space-y-4 md:space-y-0 md:space-x-4">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-center">Quartas de Final</h2>
        {matches.slice(0, 4).map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-center">Semifinais</h2>
        {matches.slice(4, 6).map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
      <div>
        <h2 className="text-lg font-semibold text-center mb-4">Final</h2>
        <MatchCard match={matches[6]} />
      </div>
    </div>
  )
}

function MatchCard({ match }: { match: Match }) {
  return (
    <Card className={`w-64 ${match.winner ? 'border-emerald-500' : ''}`}>
      <CardContent className="p-4">
        <div className="space-y-2">
          <TeamName team={match.team1} isWinner={match.winner === match.team1} />
          <TeamName team={match.team2} isWinner={match.winner === match.team2} />
        </div>
      </CardContent>
    </Card>
  )
}

function TeamName({ team, isWinner }: { team: string; isWinner?: boolean }) {
  return (
    <div className={`p-2 ${isWinner ? 'bg-green-100 font-semibold' : ''}`}>
      {team}
      {isWinner && <span className="ml-2 text-green-600">✓</span>}
    </div>
  )
}

export default function Page({ params }: { params: { idCampeonato: string } }) {
  return (
    <>
      <Header />
      <div className="flex h-screen">
        <Sidebar className="h-full" />
        <div className="flex-1 p-4 overflow-y-auto">
          {/*
          <Breadcrumb>
            <BreadcrumbItem href="/championships">Campeonatos</BreadcrumbItem>
            <BreadcrumbItem href={`/championships/${params.idCampeonato}`}>Detalhes do Campeonato</BreadcrumbItem>
            <BreadcrumbItem href={`/championships/${params.idCampeonato}/times`}>Times</BreadcrumbItem>
            <BreadcrumbItem>Chaveamento</BreadcrumbItem>
          </Breadcrumb>
          */}
          <h1 className="text-3xl font-bold mb-6">Chaveamento do Campeonato</h1>
          <TournamentBracket />
        </div>
      </div>
    </>
  )
}

