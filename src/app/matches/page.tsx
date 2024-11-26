'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { Inscricao, Modalidade, MatchData } from '@/interface/types'
import {
  getMatches,
  createMatch,
  getInscriptions,
  getSports,
} from '@/services/matchService'
import { getUserIdFromToken } from '@/utils/auth' // Import the function

// ID do usuário autenticado
const userId = getUserIdFromToken()
console.log('User ID:', userId) // Debugging line

export default function CreateMatchPage() {
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [localizacao, setLocalizacao] = useState('')
  const [selectedModalidade, setSelectedModalidade] = useState('')
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([])
  const [modalidadesFiltradas, setModalidadesFiltradas] = useState<Modalidade[]>([])

  const router = useRouter()
  const queryClient = useQueryClient()
  const idCampeonato = 1 // Use the id from localStorage or dynamic value

  // Fetch and set inscriptions and sports
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        toast.error('Usuário não autenticado.')
        return
      }
      try {
        const inscricoesData = await getInscriptions(userId)
        const modalidadesData = await getSports()
        const modalidadesInscritas = modalidadesData.filter(
          (modalidade: Modalidade) =>
            inscricoesData.some(
              (inscricao: Inscricao) =>
                inscricao.modalidadeId === modalidade.id,
            ),
        )
        setInscricoes(inscricoesData)
        setModalidadesFiltradas(modalidadesInscritas)
      } catch (error) {
        console.error(error)
        toast.error('Erro ao carregar modalidades e inscrições.')
      }
    }
    fetchData()
  }, [userId])

  // Fetch matches
  const { data: partidas, isLoading: loadingPartidas } = useQuery({
    queryKey: ['partidas', idCampeonato],
    queryFn: () => getMatches(idCampeonato),
    enabled: !!idCampeonato, // Only fetch when idCampeonato is available
  })

  const mutation = useMutation({
    mutationFn: createMatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partidas'] })
      toast.success('Partida criada com sucesso!')
      router.push('/feed')
    },
    onError: (error) => {
      console.error('Erro ao criar a partida:', error)
      toast.error('Erro ao criar a partida.')
    },
  })

  const handleCreateMatch = async () => {
    if (!nome || !descricao || !localizacao || !selectedModalidade) {
      toast.error('Todos os campos são obrigatórios.')
      return
    }

    if (!userId) {
      toast.error('Usuário não autenticado.')
      return
    }

    const matchData = {
      nome,
      descricao,
      localizacao,
      modalidade: selectedModalidade,
      userId,
      date: new Date().toISOString(),
    }
    mutation.mutate(matchData)
  }

  return (
    <>
      <Header />
      <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 dark:bg-gray-900">
        <Sidebar className="lg:w-1/4 lg:pr-6" />
        <main className="lg:w-3/4 p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Criar Partida</h1>
            <Sheet>
              <SheetTrigger asChild>
                <Button className="bg-blue-500 hover:bg-blue-600">
                  Criar Nova Partida
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Cadastrar Nova Partida</SheetTitle>
                </SheetHeader>
                <form className="space-y-4 mt-8">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-black dark:text-white">
                      Modalidade Esportiva
                    </label>
                    <Select
                      onValueChange={setSelectedModalidade}
                      value={selectedModalidade}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Escolha uma modalidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {modalidadesFiltradas.map((modalidade: Modalidade) => (
                          <SelectItem
                            key={modalidade.id}
                            value={modalidade.name}
                          >
                            {modalidade.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Input
                      type="text"
                      className="w-full p-2 text-black dark:text-white"
                      placeholder="Nome da Partida"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                    />
                  </div>
                  <div>
                    <Textarea
                      className="w-full p-2 text-black dark:text-white"
                      placeholder="Descrição da Partida"
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      type="text"
                      className="w-full p-2 text-black dark:text-white"
                      placeholder="Localização"
                      value={localizacao}
                      onChange={(e) => setLocalizacao(e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleCreateMatch}
                    className="w-full bg-green-500 hover:bg-green-600"
                  >
                    Salvar Partida
                  </Button>
                </form>
              </SheetContent>
            </Sheet>
          </div>
          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-4">Partidas</h2>
            {loadingPartidas ? (
              <p>Carregando partidas...</p>
            ) : partidas && partidas.length > 0 ? (
              <ul>
                {partidas.map((partida) => (
                  <li key={partida.idPartida}>
                    {partida.fasePartida} - 
                    {partida.dataPartida ? new Date(partida.dataPartida).toLocaleDateString() : 'Data não definida'}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nenhuma partida encontrada.</p>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
