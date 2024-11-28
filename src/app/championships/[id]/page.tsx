import { getChampionshipById } from '@/services/championshipService'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
// ...existing imports...

interface Campeonato {
  titulo: string
  descricao: string
  aposta: string
  dataInicio: string
  dataFim: string
  limiteTimes: number
  limiteParticipantes: number
  ativo: boolean
  endereco: {
    cep: string
    uf: string
    cidade: string
    bairro: string
    rua: string
    numero: string
    complemento: string | null
  }
  privacidadeCampeonato: string
  idAcademico: number
  idModalidadeEsportiva: number
  situacaoCampeonato: string
  senha?: string
  usernameCriador?: string // Assuming this field exists
  codigo?: string // Assuming this field exists
}

export default async function ChampionshipDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  console.log(`Received championship ID: ${id}`) // Added log

  // Fetch the championship data on the server side
  let campeonato: Campeonato | null = null
  try {
    campeonato = await getChampionshipById(id)
    console.log('Fetched campeonato data:', campeonato) // Added log
  } catch (error) {
    console.error('Erro ao carregar detalhes do campeonato:', error)
    return (
      <>
        <Header />
        <div className="flex h-screen">
          <Sidebar className="h-full" />
          <div className="flex-1 p-4 overflow-y-auto">
            <p>Campeonato não encontrado.</p>
          </div>
        </div>
      </>
    )
  }

  if (!campeonato) {
    console.warn(`No data found for championship ID: ${id}`) // Added log
    return (
      <>
        <Header />
        <div className="flex h-screen">
          <Sidebar className="h-full" />
          <div className="flex-1 p-4 overflow-y-auto">
            <p>Campeonato não encontrado.</p>
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
              {/* Display championship details */}
              <p>
                <strong>Código:</strong> {campeonato.codigo}
              </p>
              <p><strong>Descrição:</strong> {campeonato.descricao}</p>
              <p><strong>Início:</strong> {new Date(campeonato.dataInicio).toLocaleDateString()}</p>
              <p><strong>Fim:</strong> {new Date(campeonato.dataFim).toLocaleDateString()}</p>
              <p><strong>Participantes:</strong> {campeonato.limiteParticipantes}</p>
              <p><strong>Times:</strong> {campeonato.limiteTimes}</p>
              <p><strong>Privacidade:</strong> {campeonato.privacidadeCampeonato}</p>
              <p><strong>Criador:</strong> {campeonato.usernameCriador}</p>
              <p><strong>Endereço:</strong> {`${campeonato.endereco.rua}, ${campeonato.endereco.numero}, ${campeonato.endereco.bairro}, ${campeonato.endereco.cidade} - ${campeonato.endereco.uf}, CEP: ${campeonato.endereco.cep}`}</p>
              {/* ...add more details as needed... */}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}