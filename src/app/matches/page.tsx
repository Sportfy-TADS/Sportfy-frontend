'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar' // Importando o componente Sidebar
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

// Função para buscar as modalidades em que o usuário está inscrito
async function getInscricoes(userId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/inscricoes?userId=${userId}`,
  )
  if (!res.ok) throw new Error('Erro ao buscar inscrições.')
  return await res.json()
}

// Função para buscar modalidades
async function getModalidades() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sports`)
  if (!res.ok) throw new Error('Erro ao buscar modalidades.')
  return await res.json()
}

async function createMatch(data: MatchData) {
  console.log('Dados enviados para o servidor:', data) // Adicionando log de depuração

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!res.ok) throw new Error('Erro ao criar partida.')
  return res.json()
}

export default function CreateMatchPage() {
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [localizacao, setLocalizacao] = useState('')
  const [selectedModalidade, setSelectedModalidade] = useState('')
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([])
  const [modalidadesFiltradas, setModalidadesFiltradas] = useState<
    Modalidade[]
  >([])

  const router = useRouter()
  const queryClient = useQueryClient()

  const userId = localStorage.getItem('userId') // Pegando o ID do usuário logado

  // Carregar as modalidades e inscrições
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        toast.error('Usuário não autenticado.')
        return
      }

      try {
        const inscricoesData = await getInscricoes(userId)
        const modalidadesData = await getModalidades()

        // Filtrar as modalidades em que o usuário está inscrito
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

  const mutation = useMutation({
    mutationFn: createMatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modalidades'] })
      toast.success('Partida criada com sucesso!')
      router.push('/feed') // Redireciona para o feed após criar a partida
    },
    onError: (error) => {
      console.error('Erro ao criar a partida:', error) // Log de erro
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

    console.log('Preparando para enviar a partida:', matchData) // Log dos dados antes de enviar
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
        </main>
      </div>
    </>
  )
}
