
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Pencil, Trash, Calendar, Info, Trophy, MapPin, User, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface ChampionshipCardProps {
  campeonato: Campeonato
  currentUserId: number | null
  onUpdate: (campeonato: Campeonato) => void
  onDelete: (id: number) => void
  onCopyCode: (code: string) => void
}

const ChampionshipCard: React.FC<ChampionshipCardProps> = ({ campeonato, currentUserId, onUpdate, onDelete, onCopyCode }) => {
  const router = useRouter()

  return (
    <Card className="border border-blue-700">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{campeonato.titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Aposta e Descrição */}
          <div className="flex flex-col">
            <div className="flex items-center mb-1">
              <Trophy className="mr-2 text-blue-700" />
              <p className="text-lg font-semibold">Aposta:</p>
            </div>
            <p className="text-lg ml-6">{campeonato.aposta}</p>
            <div className="flex items-center mb-1">
              <Info className="mr-2 text-blue-700" />
              <p className="text-lg font-semibold">Descrição:</p>
            </div>
            <p className="text-lg ml-6">{campeonato.descricao}</p>
          </div>

          {/* Datas */}
          <div className="flex flex-col">
            <div className="flex items-center mb-1">
              <Calendar className="mr-2 text-blue-700" />
              <p className="text-lg font-semibold">Início:</p>
              <p className="text-lg ml-2">{new Date(campeonato.dataInicio).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center mb-1">
              <Calendar className="mr-2 text-blue-700" />
              <p className="text-lg font-semibold">Fim:</p>
              <p className="text-lg ml-2">{new Date(campeonato.dataFim).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Participantes e Times */}
          <div className="flex flex-col">
            <div className="flex items-center mb-1">
              <User className="mr-2 text-blue-700" />
              <p className="text-lg font-semibold">Participantes:</p>
              <p className="text-lg ml-2">{campeonato.limiteParticipantes}</p>
            </div>
            <div className="flex items-center mb-1">
              <User className="mr-2 text-blue-700" />
              <p className="text-lg font-semibold">Times:</p>
              <p className="text-lg ml-2">{campeonato.limiteTimes}</p>
            </div>
          </div>

          {/* Privacidade e Criador */}
          <div className="flex flex-col">
            <div className="flex items-center mb-1">
              <Lock className="mr-2 text-blue-700" />
              <p className="text-lg font-semibold">Privacidade:</p>
              <p className="text-lg ml-2">
                {campeonato.privacidadeCampeonato === 'PUBLICO' ? 'Público' : 'Privado'}
              </p>
            </div>
            <div className="flex items-center mb-1">
              <User className="mr-2 text-blue-700" />
              <p className="text-lg font-semibold">Criador:</p>
              <p className="text-lg ml-2">{campeonato.usernameCriador}</p>
            </div>
          </div>

          {/* Endereço */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-1">
              <MapPin className="mr-2 text-blue-700" />
              <p className="text-lg font-semibold">Endereço:</p>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${campeonato.endereco.rua}, ${campeonato.endereco.numero}, ${campeonato.endereco.bairro}, ${campeonato.endereco.cidade} - ${campeonato.endereco.uf}, CEP: ${campeonato.endereco.cep}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg ml-6 text-white underline"
            >
              {`${campeonato.endereco.rua}, ${campeonato.endereco.numero}, ${campeonato.endereco.bairro}, ${campeonato.endereco.cidade} - ${campeonato.endereco.uf}, CEP: ${campeonato.endereco.cep}`}
            </a>
          </div>

          {/* Código do Campeonato */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-1">
              <Info className="mr-2 text-blue-700" />
              <p className="text-lg font-semibold">Código do Campeonato:</p>
              <p className="text-lg ml-2 cursor-pointer" onClick={() => onCopyCode(campeonato.codigo)}>
                {campeonato.codigo}
              </p>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="mt-4 flex space-x-2">
          {campeonato.idAcademico === currentUserId ? (
            <>
              <Button
                onClick={() => onUpdate(campeonato)}
                className="flex items-center justify-center bg-white hover:bg-zinc-300"
              >
                <Pencil className="mr-2" /> Atualizar
              </Button>
              <Button
                onClick={() => onDelete(campeonato.idCampeonato)}
                className="flex items-center justify-center bg-red-500 hover:bg-red-600"
              >
                <Trash className="mr-2" /> Excluir
              </Button>
            </>
          ) : (
            <Button
              onClick={() => router.push(`/championships/${campeonato.idCampeonato}`)}
              className="flex items-center justify-center bg-green-500 hover:bg-green-600"
            >
              Acessar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default ChampionshipCard