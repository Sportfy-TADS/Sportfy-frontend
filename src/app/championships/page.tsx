'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  getChampionships,
  getUserIdFromToken,
  createChampionship,
  updateChampionship,
  deleteChampionship,
} from '@/services/championshipService'
import { Pencil, Trash, Calendar, Info, Trophy, MapPin,  User, Lock } from 'lucide-react' // Ensure all icons are correctly named
import { useRouter } from 'next/navigation' // Import useRouter

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
}

export default function CampeonatoPage() {
  const [selectedCampeonato, setSelectedCampeonato] = useState<Campeonato | null>(null)
  const [cep, setCep] = useState('')
  const [logradouro, setLogradouro] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')
  const [uf, setUf] = useState('')
  const [privacidade, setPrivacidade] = useState('PUBLICO')
  const queryClient = useQueryClient()
  const currentUserId = getUserIdFromToken()
  const router = useRouter() // Initialize useRouter

  useEffect(() => {
    // Check if user is authenticated
    const userCheck = () => {
      const id = getUserIdFromToken()
      if (!id) {
        toast.error('Usuário não autenticado')
        router.push('/auth')
      }
    }
    userCheck()
  }, [router])

  const { data: campeonatos = [], isLoading } = useQuery({
    queryKey: ['campeonatos'],
    queryFn: getChampionships,
  })

  const createMutation = useMutation({
    mutationFn: createChampionship,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campeonatos'] })
      toast.success('Campeonato criado com sucesso!')
    },
    onError: (error: any) => { // Changed error type to any for better logging
      console.error('Erro ao criar campeonato:', error)
      
      // Add detailed error logging
      if (error.response) {
        console.error('Response data:', error.response.data)
        console.error('Response status:', error.response.status)
        console.error('Response headers:', error.response.headers)
      } else if (error.request) {
        console.error('No response received:', error.request)
      } else {
        console.error('Error setting up request:', error.message)
      }

      toast.error('Erro ao criar campeonato.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: Campeonato) => updateChampionship(data.idCampeonato, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campeonatos'] })
      toast.success('Campeonato atualizado com sucesso!')
    },
    onError: (error: any) => { // Changed error type to any for better logging
      console.error('Erro ao atualizar campeonato:', error)
      
      // Add detailed error logging
      if (error.response) {
        console.error('Response data:', error.response.data)
        console.error('Response status:', error.response.status)
        console.error('Response headers:', error.response.headers)
      } else if (error.request) {
        console.error('No response received:', error.request)
      } else {
        console.error('Error setting up request:', error.message)
      }

      toast.error('Erro ao atualizar campeonato.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteChampionship(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campeonatos'] })
      toast.success('Campeonato excluído com sucesso!')
    },
    onError: (error: any) => { // Changed error type to any for better logging
      console.error('Erro ao excluir campeonato:', error)
      
      // Add detailed error logging
      if (error.response) {
        console.error('Response data:', error.response.data)
        console.error('Response status:', error.response.status)
        console.error('Response headers:', error.response.headers)
      } else if (error.request) {
        console.error('No response received:', error.request)
      } else {
        console.error('Error setting up request:', error.message)
      }

      toast.error('Erro ao excluir campeonato.')
    },
  })

  const handleCreateCampeonato = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const idAcademico = getUserIdFromToken()
  
    if (!idAcademico) {
      toast.error('Usuário não identificado. Por favor, faça login novamente.')
      router.push('/auth')
      return
    }
  
    try {
      const formData = new FormData(event.currentTarget)
      const data = Object.fromEntries(formData.entries())
  
      const newCampeonato = {
        titulo: String(data.titulo).trim(),
        descricao: String(data.descricao).trim(),
        aposta: String(data.aposta).trim(),
        dataInicio: `${data.dataInicio}T09:00:00Z`,
        dataFim: `${data.dataFim}T18:00:00Z`,
        limiteTimes: Math.max(1, Number(data.limiteTimes)),
        limiteParticipantes: Math.max(1, Number(data.limiteParticipantes)),
        ativo: true,
        endereco: {
          cep: String(data.cep).replace(/\D/g, ''),
          uf: String(data.uf).toUpperCase(),
          cidade: String(data.cidade),
          bairro: String(data.bairro),
          rua: String(data.logradouro),
          numero: String(data.numero),
          complemento: data.complemento ? String(data.complemento) : ""
        },
        privacidadeCampeonato: data.privacidadeCampeonato || 'PUBLICO',
        idAcademico,
        idModalidadeEsportiva: 1,
        situacaoCampeonato: 'EM_ABERTO'
      }
  
      if (data.privacidadeCampeonato === 'PRIVADO' && data.senha) {
        newCampeonato.senha = String(data.senha)
      }
  
      console.log('Creating championship with data:', JSON.stringify(newCampeonato, null, 2))
      await createMutation.mutateAsync(newCampeonato)
    } catch (error) {
      console.error('Error preparing championship data:', error)
      toast.error('Erro ao preparar dados do campeonato')
    }
  }

  const handleUpdateCampeonato = (data: Campeonato) => {
    updateMutation.mutate(data)
  }

  const handleDeleteCampeonato = (id: number) => {
    deleteMutation.mutate(id)
  }

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cepValue = e.target.value
    setCep(cepValue)

    if (cepValue.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepValue}/json/`)
        const data = await response.json()
        if (!data.erro) {
          setLogradouro(data.logradouro)
          setBairro(data.bairro)
          setCidade(data.localidade)
          setUf(data.uf)
        } else {
          toast.error('CEP não encontrado.')
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error)
        toast.error('Erro ao buscar CEP.')
      }
    }
  }

  const renderCampeonatos = () => {
    if (isLoading) {
      return Array.from({ length: 6 }).map((_, index) => (
        <Card key={`skeleton-${index}`} className="p-4">
          <Skeleton className="h-6 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-4" />
          <Skeleton className="h-10 w-full bg-gray-300" />
        </Card>
      ))
    }

    if (!Array.isArray(campeonatos) || campeonatos.length === 0) {
      return (
        <Card className="col-span-full p-4">
          <CardContent>
            <p className="text-center text-gray-500">
              Nenhum campeonato encontrado ou erro ao carregar dados.
            </p>
          </CardContent>
        </Card>
      )
    }

    return campeonatos.map((campeonato: Campeonato) => (
      <Card key={campeonato.idCampeonato}>
        <CardHeader>
          <CardTitle>
            {/* Removed the Link component from the title */}
            {campeonato.titulo}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Aposta e Descrição */}
            <div>
              <div className="flex items-center mb-2">
                <Trophy className="mr-2" />
                <p className="text-sm font-semibold">Aposta:</p>
              </div>
              <p className="text-sm mb-4">{campeonato.aposta}</p>

              <div className="flex items-center mb-2">
                <Info className="mr-2" />
                <p className="text-sm font-semibold">Descrição:</p>
              </div>
              <p className="text-sm">{campeonato.descricao}</p>
            </div>

            {/* Datas */}
            <div>
              <div className="flex items-center mb-2">
                <Calendar className="mr-2" />
                <p className="text-sm font-semibold">Início:</p>
              </div>
              <p className="text-sm mb-4">{new Date(campeonato.dataInicio).toLocaleDateString()}</p>

              <div className="flex items-center mb-2">
                <Calendar className="mr-2" />
                <p className="text-sm font-semibold">Fim:</p>
              </div>
              <p className="text-sm">{new Date(campeonato.dataFim).toLocaleDateString()}</p>
            </div>

            {/* Participantes e Times */}
            <div>
              <div className="flex items-center mb-2">
                <User className="mr-2" />
                <p className="text-sm font-semibold">Participantes:</p>
              </div>
              <p className="text-sm mb-4">{campeonato.limiteParticipantes}</p>

              <div className="flex items-center mb-2">
                <User className="mr-2" />
                <p className="text-sm font-semibold">Times:</p>
              </div>
              <p className="text-sm">{campeonato.limiteTimes}</p>
            </div>

            {/* Privacidade e Criador */}
            <div>
              <div className="flex items-center mb-2">
                <Lock className="mr-2" />
                <p className="text-sm font-semibold">Privacidade:</p>
              </div>
              <p className="text-sm mb-4">{campeonato.privacidadeCampeonato === 'PUBLICO' ? 'Público' : 'Privado'}</p>

              <div className="flex items-center mb-2">
                <User className="mr-2" />
                <p className="text-sm font-semibold">Criador:</p>
              </div>
              <p className="text-sm">{campeonato.usernameCriador}</p>
            </div>

            {/* Endereço */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-2">
                <MapPin className="mr-2" />
                <p className="text-sm font-semibold">Endereço:</p>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${campeonato.endereco.rua}, ${campeonato.endereco.numero}, ${campeonato.endereco.bairro}, ${campeonato.endereco.cidade} - ${campeonato.endereco.uf}, CEP: ${campeonato.endereco.cep}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {`${campeonato.endereco.rua}, ${campeonato.endereco.numero}, ${campeonato.endereco.bairro}, ${campeonato.endereco.cidade} - ${campeonato.endereco.uf}, CEP: ${campeonato.endereco.cep}`}
              </a>
            </div>
          </div>

          {/* Ações */}
          <div className="mt-4 flex space-x-2">
            {campeonato.idAcademico === currentUserId ? ( // Check if current user is the creator
              <>
                <Button
                  onClick={() => setSelectedCampeonato(campeonato)}
                  className="flex items-center justify-center bg-white hover:bg-zinc-300"
                >
                  <Pencil className="mr-2" /> Atualizar
                </Button>
                <Button
                  onClick={() => handleDeleteCampeonato(campeonato.idCampeonato)}
                  className="flex items-center justify-center bg-red-500 hover:bg-red-600"
                >
                  <Trash className="mr-2" /> Excluir
                </Button>
              </>
            ) : (
              <Button
                onClick={() => router.push(`/championships/${campeonato.idCampeonato}`)} // Updated onClick handler
                className="flex items-center justify-center bg-green-500 hover:bg-green-600"
              >
                Acessar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    ))
  }

  return (
    <>
      <Header />
      <div className="flex h-screen">
        <Sidebar className="h-full" />
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Campeonatos</h1>
            <Sheet>
              <SheetTrigger asChild>
                <Button className="bg-blue-500 hover:bg-blue-600">
                  Cadastrar Campeonato
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Cadastrar Novo Campeonato</SheetTitle>
                </SheetHeader>
                <form onSubmit={handleCreateCampeonato} className="space-y-4 mt-4 max-h-[70vh] overflow-y-auto">
                  <div>
                    <Label htmlFor="titulo">Título <span className="text-red-500">*</span></Label>
                    <Input id="titulo" name="titulo" required />
                  </div>
                  <div>
                    <Label htmlFor="descricao">Descrição <span className="text-red-500">*</span></Label>
                    <Textarea id="descricao" name="descricao" required />
                  </div>
                  <div>
                    <Label htmlFor="aposta">Aposta <span className="text-red-500">*</span></Label>
                    <Input id="aposta" name="aposta" required />
                  </div>
                  <div>
                    <Label htmlFor="dataInicio">Data de Início <span className="text-red-500">*</span></Label>
                    <Input id="dataInicio" name="dataInicio" type="date" required />
                  </div>
                  <div>
                    <Label htmlFor="dataFim">Data de Fim <span className="text-red-500">*</span></Label>
                    <Input id="dataFim" name="dataFim" type="date" required />
                  </div>
                  <div>
                    <Label htmlFor="limiteTimes">Limite de Times <span className="text-red-500">*</span></Label>
                    <Input id="limiteTimes" name="limiteTimes" type="number" required />
                  </div>
                  <div>
                    <Label htmlFor="limiteParticipantes">Limite de Participantes <span className="text-red-500">*</span></Label>
                    <Input id="limiteParticipantes" name="limiteParticipantes" type="number" required />
                  </div>
                  <div>
                    <Label htmlFor="privacidadeCampeonato">Privacidade do Campeonato <span className="text-red-500">*</span></Label>
                    <select id="privacidadeCampeonato" name="privacidadeCampeonato" value={privacidade} onChange={(e) => setPrivacidade(e.target.value)} required>
                      <option value="PUBLICO">Público</option>
                      <option value="PRIVADO">Privado</option>
                    </select>
                  </div>
                  {privacidade === 'PRIVADO' && (
                    <div>
                      <Label htmlFor="senha">Senha <span className="text-red-500">*</span></Label>
                      <Input id="senha" name="senha" type="password" required />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="cep">CEP <span className="text-red-500">*</span></Label>
                    <Input id="cep" name="cep" type="text" value={cep} onChange={handleCepChange} required />
                  </div>
                  <div>
                    <Label htmlFor="logradouro">Logradouro <span className="text-red-500">*</span></Label>
                    <Input id="logradouro" name="logradouro" type="text" value={logradouro} required />
                  </div>
                  <div>
                    <Label htmlFor="numero">Número <span className="text-red-500">*</span></Label>
                    <Input id="numero" name="numero" type="text" required />
                  </div>
                  <div>
                    <Label htmlFor="cidade">Cidade <span className="text-red-500">*</span></Label>
                    <Input id="cidade" name="cidade" type="text" value={cidade} required />
                  </div>
                  <div>
                    <Label htmlFor="uf">UF <span className="text-red-500">*</span></Label>
                    <Input id="uf" name="uf" type="text" value={uf} required />
                  </div>
                  <div>
                    <Label htmlFor="bairro">Bairro <span className="text-red-500">*</span></Label>
                    <Input id="bairro" name="bairro" type="text" value={bairro} required />
                  </div>
                  <div>
                    <Label htmlFor="complemento">Complemento</Label>
                    <Textarea id="complemento" name="complemento" />
                  </div>
                  <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                    Salvar
                  </Button>
                </form>
              </SheetContent>
            </Sheet>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {renderCampeonatos()}
          </div>
        </div>
      </div>
    </>
  )
}