'use client'

import { useState, useEffect, useMemo } from 'react'

import { useRouter } from 'next/navigation'

import { format } from 'date-fns' // Import date-fns
import { User, Lock, Calendar, Info, MapPin, Trash, Trophy } from 'lucide-react'
import { toast } from 'sonner'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Campeonato } from '@/interface/types'
import { getUserIdFromToken } from '@/services/championshipService'

import { useChampionships } from './hooks/useChampionships'

export default function CampeonatoPage() {
  // Remover a declaração e uso de 'selectedCampeonato'
  // const [selectedCampeonato, setSelectedCampeonato] = useState<Campeonato | null>(null)
  const [cep, setCep] = useState('')
  const [logradouro, setLogradouro] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')
  const [uf, setUf] = useState('')
  const [privacidade, setPrivacidade] = useState('PUBLICO')
  const [searchTerm, setSearchTerm] = useState('')
  // Remover 'createMutation' da desestruturação
  const { campeonatos, isLoading, /* createMutation, */ deleteMutation } =
    useChampionships()
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    const userId = getUserIdFromToken()
    if (!userId) {
      toast.error('Usuário não autenticado')
      router.push('/auth')
    } else {
      setCurrentUserId(userId)
    }
  }, [router])

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        document.querySelector('body > nextjs-portal')?.remove()
      }, 10)
    }
  }, [])

  const filteredCampeonatos = useMemo(() => {
    if (!searchTerm) return campeonatos
    return campeonatos.filter((campeonato: Campeonato) =>
      campeonato.titulo.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [campeonatos, searchTerm])

  const handleCreateCampeonato = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const data = Object.fromEntries(formData.entries())

    console.log('Form data received:', data)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No token found')
        toast.error('Usuário não autenticado')
        router.push('/auth')
        return
      }

      console.log('Current user ID:', currentUserId)
      if (!currentUserId) {
        console.error('No user ID found')
        toast.error('ID do usuário não encontrado')
        return
      }

      const newCampeonato: Campeonato = {
        idCampeonato: 0, // Adicionado
        codigo: '', // Adicionado
        usernameCriador: '', // Adicionado
        titulo: String(data.titulo).trim(),
        descricao: String(data.descricao).trim(),
        aposta: String(data.aposta).trim(),
        dataInicio: `${data.dataInicio}T09:00:00Z`,
        dataFim: `${data.dataFim}T18:00:00Z`,
        limiteTimes: Number(data.limiteTimes),
        limiteParticipantes: Number(data.limiteParticipantes),
        ativo: true,
        endereco: {
          cep: String(data.cep).replace(/\D/g, ''),
          uf: String(data.uf).toUpperCase(),
          cidade: String(data.cidade),
          bairro: String(data.bairro),
          rua: String(data.logradouro),
          numero: String(data.numero),
          estado: String(data.uf).toUpperCase(), // Adicionando a propriedade 'estado'
        },
        privacidade, // Usando a sintaxe de propriedade abreviada
        idAcademico: Number(currentUserId),
        situacaoCampeonato: 'EM_ABERTO',
      }

      if (data.senha) {
        newCampeonato.senha = String(data.senha)
      }

      if (data.complemento) {
        newCampeonato.endereco.complemento = String(data.complemento)
      }

      console.log('Prepared championship data:', newCampeonato)
      console.log('API URL:', `${process.env.NEXT_PUBLIC_API_URL}/campeonatos`)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/campeonatos`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newCampeonato),
        },
      )

      console.log('Response status:', response.status)

      const responseText = await response.text()
      console.log('Raw response:', responseText)

      if (!response.ok) {
        console.error('Server error details:', responseText)
        throw new Error(`Error creating championship: ${responseText}`)
      }

      const result = JSON.parse(responseText)
      console.log('Championship created successfully:', result)

      toast.success('Campeonato criado com sucesso!')
      window.location.reload()
    } catch (error) {
      console.error('Detailed error:', error)
      console.error('Error stack:', (error as Error).stack)
      toast.error('Erro ao criar campeonato')
    }
  }

  // Remover a função 'handleUpdateCampeonato'
  // const handleUpdateCampeonato = (data: Campeonato) => {
  //   updateMutation.mutate(data)
  // }

  const handleDeleteCampeonato = (id: number) => {
    deleteMutation.mutate(id)
  }

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cepValue = e.target.value
    setCep(cepValue)

    if (cepValue.length === 8) {
      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${cepValue}/json/`,
        )
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

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Código copiado para a área de transferência!')
  }

  return (
    <>
      <Header />
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Campeonatos</h1>
            <div className="flex space-x-4">
              <Input
                placeholder="Buscar campeonato..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
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
                  <form
                    onSubmit={handleCreateCampeonato}
                    className="space-y-4 mt-4 max-h-[70vh] overflow-y-auto"
                  >
                    <div>
                      <Label htmlFor="titulo">
                        Título <span className="text-red-500">*</span>
                      </Label>
                      <Input id="titulo" name="titulo" required />
                    </div>
                    <div>
                      <Label htmlFor="descricao">
                        Descrição <span className="text-red-500">*</span>
                      </Label>
                      <Textarea id="descricao" name="descricao" required />
                    </div>
                    <div>
                      <Label htmlFor="aposta">
                        Aposta <span className="text-red-500">*</span>
                      </Label>
                      <Input id="aposta" name="aposta" required />
                    </div>
                    <div>
                      <Label htmlFor="dataInicio">
                        Data de Início <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="dataInicio"
                        name="dataInicio"
                        type="date"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="dataFim">
                        Data de Fim <span className="text-red-500">*</span>
                      </Label>
                      <Input id="dataFim" name="dataFim" type="date" required />
                    </div>
                    <div>
                      <Label htmlFor="limiteTimes">
                        Limite de Times <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="limiteTimes"
                        name="limiteTimes"
                        type="number"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="limiteParticipantes">
                        Limite de Participantes{' '}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="limiteParticipantes"
                        name="limiteParticipantes"
                        type="number"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="privacidadeCampeonato">
                        Privacidade do Campeonato{' '}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={privacidade}
                        onValueChange={setPrivacidade}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a privacidade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PUBLICO">Público</SelectItem>
                          <SelectItem value="PRIVADO">Privado</SelectItem>{' '}
                          {/* Fixed closing tag */}
                        </SelectContent>
                      </Select>
                    </div>
                    {privacidade === 'PRIVADO' && (
                      <div>
                        <Label htmlFor="senha">
                          Senha <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="senha"
                          name="senha"
                          type="password"
                          required
                        />
                      </div>
                    )}
                    <div>
                      <Label htmlFor="cep">
                        CEP <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="cep"
                        name="cep"
                        type="text"
                        value={cep}
                        onChange={handleCepChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="logradouro">
                        Logradouro <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="logradouro"
                        name="logradouro"
                        type="text"
                        value={logradouro}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="numero">
                        Número <span className="text-red-500">*</span>
                      </Label>
                      <Input id="numero" name="numero" type="text" required />
                    </div>
                    <div>
                      <Label htmlFor="cidade">
                        Cidade <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="cidade"
                        name="cidade"
                        type="text"
                        value={cidade}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="uf">
                        UF <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="uf"
                        name="uf"
                        type="text"
                        value={uf}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="bairro">
                        Bairro <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="bairro"
                        name="bairro"
                        type="text"
                        value={bairro}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="complemento">Complemento</Label>
                      <Textarea id="complemento" name="complemento" />
                    </div>
                    <Button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      Salvar
                    </Button>
                  </form>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <Card
                  key={`skeleton-${index}`}
                  className="p-4 border border-blue-700"
                >
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-10 w-full bg-gray-300" />
                </Card>
              ))
            ) : filteredCampeonatos.length === 0 ? (
              <Card className="col-span-full p-4 border border-blue-700">
                <CardContent>
                  <p className="text-center text-gray-500">
                    Nenhum campeonato encontrado ou erro ao carregar dados.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredCampeonatos.map((campeonato: Campeonato) => (
                <Card
                  key={campeonato.idCampeonato}
                  className="border border-blue-700"
                >
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold">
                      {' '}
                      {/* Increased title size */}
                      {campeonato.titulo}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Aposta e Descrição */}
                      <div className="flex flex-col">
                        <div className="flex items-center mb-1">
                          <Trophy className="mr-2 text-blue-700" />
                          <p className="text-lg font-semibold">Aposta:</p>
                        </div>
                        <p className="text-lg ml-6">{campeonato.aposta}</p>{' '}
                        {/* Alinhado com o texto */}
                        <div className="flex items-center mb-1">
                          <Info className="mr-2 text-blue-700" />
                          <p className="text-lg font-semibold">Descrição:</p>
                        </div>
                        <p className="text-lg ml-6">{campeonato.descricao}</p>{' '}
                        {/* Alinhado com o texto */}
                      </div>

                      {/* Datas */}
                      <div className="flex flex-col">
                        <div className="flex items-center mb-1">
                          <Calendar className="mr-2 text-blue-700" />
                          <p className="text-lg font-semibold">Início:</p>
                          <p className="text-lg ml-2">
                            {format(
                              new Date(campeonato.dataInicio),
                              'dd/MM/yyyy',
                            )}
                          </p>
                        </div>
                        <div className="flex items-center mb-1">
                          <Calendar className="mr-2 text-blue-700" />
                          <p className="text-lg font-semibold">Fim:</p>
                          <p className="text-lg ml-2">
                            {format(new Date(campeonato.dataFim), 'dd/MM/yyyy')}
                          </p>
                        </div>
                      </div>

                      {/* Participantes e Times */}
                      <div className="flex flex-col">
                        <div className="flex items-center mb-1">
                          <User className="mr-2 text-blue-700" />
                          <p className="text-lg font-semibold">
                            Participantes:
                          </p>
                          <p className="text-lg ml-2">
                            {campeonato.limiteParticipantes}
                          </p>
                        </div>
                        <div className="flex items-center mb-1">
                          <User className="mr-2 text-blue-700" />
                          <p className="text-lg font-semibold">Times:</p>
                          <p className="text-lg ml-2">
                            {campeonato.limiteTimes}
                          </p>
                        </div>
                      </div>

                      {/* Privacidade e Criador */}
                      <div className="flex flex-col">
                        <div className="flex items-center mb-1">
                          <Lock className="mr-2 text-blue-700" />
                          <p className="text-lg font-semibold">Privacidade:</p>
                          <p className="text-lg ml-2">
                            {campeonato.privacidade === 'PUBLICO'
                              ? 'Público'
                              : 'Privado'}
                          </p>
                        </div>
                        <div className="flex items-center mb-1">
                          <User className="mr-2 text-blue-700" />
                          <p className="text-lg font-semibold">Criador:</p>
                          <p className="text-lg ml-2">
                            {campeonato.usernameCriador}
                          </p>
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
                            `${campeonato.endereco.rua}, ${campeonato.endereco.numero}, ${campeonato.endereco.bairro}, ${campeonato.endereco.cidade} - ${campeonato.endereco.uf}, CEP: ${campeonato.endereco.cep}`,
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg ml-6 text-white underline"
                        >
                          {`${campeonato.endereco.rua}, ${campeonato.endereco.numero}, ${campeonato.endereco.bairro}, ${campeonato.endereco.cidade} - ${campeonato.endereco.uf}, CEP: ${campeonato.endereco.cep}`}
                        </a>{' '}
                        {/* Alinhado com o texto */}
                      </div>

                      {/* Código do Campeonato */}
                      <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center mb-1">
                          <Info className="mr-2 text-blue-700" />
                          <p className="text-lg font-semibold">
                            Código do Campeonato:
                          </p>
                          <p
                            className="text-lg ml-2 cursor-pointer"
                            onClick={() => handleCopyCode(campeonato.codigo)}
                          >
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
                            onClick={() =>
                              handleDeleteCampeonato(campeonato.idCampeonato)
                            }
                            className="flex items-center justify-center bg-red-500 hover:bg-red-600"
                          >
                            <Trash className="mr-2" /> Excluir
                          </Button>
                          <Button
                            onClick={() =>
                              router.push(
                                `/championships/${campeonato.idCampeonato}`,
                              )
                            }
                            className="flex items-center justify-center bg-green-500 hover:bg-green-600"
                          >
                            Acessar
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() =>
                            router.push(
                              `/championships/${campeonato.idCampeonato}`,
                            )
                          }
                          className="flex items-center justify-center bg-green-500 hover:bg-green-600"
                        >
                          Acessar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
