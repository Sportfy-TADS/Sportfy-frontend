'use client'

import { useEffect, useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import { format } from 'date-fns'; // Import date-fns
import { Calendar, Info, Lock, MapPin, Trash, Trophy, User } from 'lucide-react';
import { toast } from 'sonner';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Campeonato } from '@/interface/types';
import { getUserIdFromToken } from '@/services/championshipService';

import { useChampionships } from './hooks/useChampionships';

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
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const { campeonatos, isLoading, createMutation, deleteMutation } =
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
    if (createMutation.isSuccess) {
      setIsSheetOpen(false)
      // Reset form states
      setCep('')
      setLogradouro('')
      setBairro('')
      setCidade('')
      setUf('')
      setPrivacidade('PUBLICO')
    }
  }, [createMutation.isSuccess])

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

    // Validações básicas
    if (!data.titulo || !data.descricao || !data.aposta) {
      toast.error('Por favor, preencha todos os campos obrigatórios')
      return
    }

    if (!currentUserId) {
      toast.error('ID do usuário não encontrado')
      return
    }

    // Validar datas
    const dataInicio = new Date(String(data.dataInicio))
    const dataFim = new Date(String(data.dataFim))
    
    if (dataInicio >= dataFim) {
      toast.error('A data de início deve ser anterior à data de fim')
      return
    }

    if (dataInicio < new Date()) {
      toast.error('A data de início não pode ser no passado')
      return
    }

    const newCampeonato: Campeonato = {
      idCampeonato: 0,
      codigo: '',
      usernameCriador: '',
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
        estado: String(data.uf).toUpperCase(),
        complemento: data.complemento ? String(data.complemento) : undefined,
      },
      privacidade,
      idAcademico: Number(currentUserId),
      situacaoCampeonato: 'EM_ABERTO',
    }

    if (data.senha) {
      newCampeonato.senha = String(data.senha)
    }

    console.log('Dados do campeonato a serem enviados:', newCampeonato)
    createMutation.mutate(newCampeonato)
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
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button 
                    className="bg-blue-500 hover:bg-blue-600"
                    onClick={() => setIsSheetOpen(true)}
                  >
                    Cadastrar Campeonato
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[400px] sm:w-[500px]">
                  <SheetHeader className="pb-2">
                    <SheetTitle className="text-lg">Cadastrar Novo Campeonato</SheetTitle>
                  </SheetHeader>
                  <form
                    onSubmit={handleCreateCampeonato}
                    className="flex flex-col h-[calc(100vh-100px)]"
                  >
                    <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                      <div>
                        <Label htmlFor="titulo" className="text-sm font-medium">
                          Título <span className="text-red-500">*</span>
                        </Label>
                        <Input id="titulo" name="titulo" required className="h-8 mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="descricao" className="text-sm font-medium">
                          Descrição <span className="text-red-500">*</span>
                        </Label>
                        <Textarea id="descricao" name="descricao" required className="h-16 mt-1 resize-none" />
                      </div>
                      <div>
                        <Label htmlFor="aposta" className="text-sm font-medium">
                          Aposta <span className="text-red-500">*</span>
                        </Label>
                        <Input id="aposta" name="aposta" required className="h-8 mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="dataInicio" className="text-sm font-medium">
                          Data de Início <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="dataInicio"
                          name="dataInicio"
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          required
                          className="h-8 mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dataFim" className="text-sm font-medium">
                          Data de Fim <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                          id="dataFim" 
                          name="dataFim" 
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          required 
                          className="h-8 mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="limiteTimes" className="text-sm font-medium">
                          Limite de Times <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="limiteTimes"
                          name="limiteTimes"
                          type="number"
                          min="2"
                          defaultValue="8"
                          required
                          className="h-8 mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="limiteParticipantes" className="text-sm font-medium">
                          Limite de Participantes <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="limiteParticipantes"
                          name="limiteParticipantes"
                          type="number"
                          min="4"
                          defaultValue="16"
                          required
                          className="h-8 mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="privacidadeCampeonato" className="text-sm font-medium">
                          Privacidade <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={privacidade}
                          onValueChange={setPrivacidade}
                        >
                          <SelectTrigger className="h-8 mt-1">
                            <SelectValue placeholder="Selecione a privacidade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PUBLICO">Público</SelectItem>
                            <SelectItem value="PRIVADO">Privado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {privacidade === 'PRIVADO' && (
                        <div>
                          <Label htmlFor="senha" className="text-sm font-medium">
                            Senha <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="senha"
                            name="senha"
                            type="password"
                            required
                            className="h-8 mt-1"
                          />
                        </div>
                      )}
                      <div>
                        <Label htmlFor="cep" className="text-sm font-medium">
                          CEP <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="cep"
                          name="cep"
                          type="text"
                          value={cep}
                          onChange={handleCepChange}
                          required
                          className="h-8 mt-1"
                          placeholder="00000-000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="logradouro" className="text-sm font-medium">
                          Logradouro <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="logradouro"
                          name="logradouro"
                          type="text"
                          value={logradouro}
                          required
                          className="h-8 mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="numero" className="text-sm font-medium">
                          Número <span className="text-red-500">*</span>
                        </Label>
                        <Input id="numero" name="numero" type="text" required className="h-8 mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="cidade" className="text-sm font-medium">
                          Cidade <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="cidade"
                          name="cidade"
                          type="text"
                          value={cidade}
                          required
                          className="h-8 mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="uf" className="text-sm font-medium">
                          UF <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="uf"
                          name="uf"
                          type="text"
                          value={uf}
                          required
                          className="h-8 mt-1"
                          maxLength={2}
                        />
                      </div>
                      <div>
                        <Label htmlFor="bairro" className="text-sm font-medium">
                          Bairro <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="bairro"
                          name="bairro"
                          type="text"
                          value={bairro}
                          required
                          className="h-8 mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="complemento" className="text-sm font-medium">Complemento</Label>
                        <Textarea id="complemento" name="complemento" className="h-16 mt-1 resize-none" />
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t mt-4">
                      <Button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600"
                        disabled={createMutation.isPending}
                      >
                        {createMutation.isPending ? 'Salvando...' : 'Salvar'}
                      </Button>
                    </div>
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
