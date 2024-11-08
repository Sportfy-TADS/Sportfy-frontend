'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jwtDecode } from 'jwt-decode'
import { Trash2, Edit } from 'lucide-react'
import { toast, Toaster } from 'sonner'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
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
import { Skeleton } from '@/components/ui/skeleton'

// Funções de API
async function fetchApoioSaude() {
  const response = await fetch('http://localhost:8081/apoio-saude/listar')
  if (!response.ok) {
    throw new Error('Erro ao buscar apoios à saúde')
  }
  return response.json()
}

async function createApoioSaude(data: {
  nome: string
  email: string
  telefone: string
  descricao: string
}): Promise<any> {
  const response = await fetch('http://localhost:8081/apoio-saude/cadastrar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Erro ao cadastrar apoio à saúde')
  }
  return response.json()
}

async function updateApoioSaude(
  id: string,
  data: { nome: string; email: string; telefone: string; descricao: string },
) {
  const response = await fetch(
    `http://localhost:8081/apoio-saude/atualizar/${id}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
  )
  if (!response.ok) {
    throw new Error('Erro ao atualizar apoio à saúde')
  }
  return response.json()
}

async function inactivateApoioSaude(id: string) {
  const response = await fetch(
    `http://localhost:8081/apoio-saude/inativar/${id}`,
    {
      method: 'PUT',
    },
  )
  if (!response.ok) {
    throw new Error('Erro ao inativar apoio à saúde')
  }
  return response.json()
}

export default function ApoioSaudeAdminPage() {
  const [currentApoio, setCurrentApoio] = useState(null)
  const [newApoio, setNewApoio] = useState({
    nome: '',
    email: '',
    telefone: '',
    descricao: '',
  })
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Usuário não está logado.')
      router.push('/auth')
      return
    }

    const decoded = jwtDecode(token)
    if ((decoded as any).role !== 'ADMINISTRADOR') {
      toast.error(
        'Acesso negado! Somente administradores podem acessar esta página.',
      )
      router.push('/')
    }
  }, [router])

  const { data: apoios = [], isLoading } = useQuery({
    queryKey: ['apoioSaude'],
    queryFn: fetchApoioSaude,
  })

  const createMutation = useMutation({
    mutationFn: createApoioSaude,
    onSuccess: () => {
      queryClient.invalidateQueries(['apoioSaude'])
      toast.success('Apoio à saúde cadastrado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao cadastrar apoio à saúde.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateApoioSaude,
    onSuccess: () => {
      queryClient.invalidateQueries(['apoioSaude'])
      toast.success('Apoio à saúde atualizado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao atualizar apoio à saúde.')
    },
  })

  const inactivateMutation = useMutation({
    mutationFn: inactivateApoioSaude,
    onSuccess: () => {
      queryClient.invalidateQueries(['apoioSaude'])
      toast.success('Apoio à saúde inativado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao inativar apoio à saúde.')
    },
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(newApoio)
    setNewApoio({ nome: '', email: '', telefone: '', descricao: '' })
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentApoio) {
      updateMutation.mutate({ id: currentApoio.idApoioSaude, ...newApoio })
      setCurrentApoio(null)
      setNewApoio({ nome: '', email: '', telefone: '', descricao: '' })
    }
  }

  const handleInactivate = (id: string) => {
    inactivateMutation.mutate(id)
  }

  const filteredApoios = apoios
    .filter((apoio: any) => {
      if (filter === 'all') return true
      if (filter === 'ufpr') return apoio.idAdministrador === 1
      return apoio.idAdministrador !== 1
    })
    .filter((apoio: any) =>
      apoio.nome.toLowerCase().includes(searchTerm.toLowerCase()),
    )

  return (
    <>
      <Header />
      <Toaster richColors />
      <div className="flex h-screen">
        <Sidebar className="flex-none" />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-6">
            <div className="container mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  Gerenciar Apoio à Saúde
                </h1>
                <div className="flex space-x-4">
                  <Select onValueChange={setFilter} defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="ufpr">UFPR</SelectItem>
                      <SelectItem value="externo">Externo</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Buscar pelo nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button className="bg-green-500 hover:bg-green-600">
                        Adicionar Apoio
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Cadastrar Apoio à Saúde</SheetTitle>
                      </SheetHeader>
                      <form onSubmit={handleCreate} className="space-y-4 mt-4">
                        <div>
                          <label htmlFor="nome">Nome</label>
                          <Input
                            id="nome"
                            value={newApoio.nome}
                            onChange={(e) =>
                              setNewApoio({ ...newApoio, nome: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <label htmlFor="email">Email</label>
                          <Input
                            id="email"
                            value={newApoio.email}
                            onChange={(e) =>
                              setNewApoio({
                                ...newApoio,
                                email: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label htmlFor="telefone">Telefone</label>
                          <Input
                            id="telefone"
                            value={newApoio.telefone}
                            onChange={(e) =>
                              setNewApoio({
                                ...newApoio,
                                telefone: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label htmlFor="descricao">Descrição</label>
                          <Input
                            id="descricao"
                            value={newApoio.descricao}
                            onChange={(e) =>
                              setNewApoio({
                                ...newApoio,
                                descricao: e.target.value,
                              })
                            }
                          />
                        </div>
                        <Button type="submit" className="w-full">
                          Cadastrar
                        </Button>
                      </form>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
              <div className="space-y-4">
                {isLoading ? (
                  <Skeleton />
                ) : (
                  filteredApoios.map((apoio: any) => (
                    <Card key={apoio.idApoioSaude}>
                      <CardHeader>
                        <CardTitle>{apoio.nome}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{apoio.descricao}</p>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => {
                              setCurrentApoio(apoio)
                              setNewApoio({
                                nome: apoio.nome,
                                email: apoio.email,
                                telefone: apoio.telefone,
                                descricao: apoio.descricao,
                              })
                            }}
                          >
                            <Edit />
                          </Button>
                          <Button
                            onClick={() => handleInactivate(apoio.idApoioSaude)}
                            variant="destructive"
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
