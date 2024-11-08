'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jwtDecode } from 'jwt-decode'
import { Trash2, Edit } from 'lucide-react'
import { toast } from 'sonner'

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
  const token = localStorage.getItem('token')
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/apoioSaude`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  if (!res.ok) throw new Error('Erro ao listar apoio à saúde.')
  return res.json()
}

async function createApoioSaude(
  data: Partial<ApoioSaude>,
): Promise<ApoioSaude> {
  const token = localStorage.getItem('token')
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/apoioSaude`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Erro ao criar apoio à saúde.')
  return res.json()
}

async function updateApoioSaude(
  id: number,
  data: Partial<ApoioSaude>,
): Promise<ApoioSaude> {
  const token = localStorage.getItem('token')
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/apoioSaude/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    },
  )
  if (!res.ok) throw new Error('Erro ao atualizar apoio à saúde.')
  return res.json()
}

async function deleteApoioSaude(id: number): Promise<number> {
  const token = localStorage.getItem('token')
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/apoioSaude/${id}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )
  if (!res.ok) throw new Error('Erro ao deletar apoio à saúde.')
  return res.json()
}

async function deactivateApoioSaude(id: number): Promise<void> {
  const token = localStorage.getItem('token')
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/apoioSaude/desativar/${id}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )
  if (!res.ok) throw new Error('Erro ao desativar apoio à saúde.')
  return res.json()
}

interface ApoioSaude {
  idApoioSaude: number
  nome: string
  email: string
  telefone: string
  descricao: string
  dataPublicacao: string
  idAdministrador: number
}

interface UpdateApoioSaudeVariables {
  idApoioSaude: number
  data: Partial<ApoioSaude>
}

export default function ApoioSaudeAdminPage() {
  const [currentApoio, setCurrentApoio] = useState<ApoioSaude | null>(null)
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
    const verifyAdmin = () => {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth')
        return
      }
      interface DecodedToken {
        role: string
      }

      const decoded: DecodedToken = jwtDecode<DecodedToken>(token)
      if (decoded.role !== 'ADMINISTRADOR') {
        toast.error('Acesso negado! Somente administradores.')
        router.push('/')
      }
    }
    verifyAdmin()
  }, [router])

  const { data: apoios = [], isLoading } = useQuery({
    queryKey: ['apoioSaude'],
    queryFn: fetchApoioSaude,
  })

  const createMutation = useMutation<ApoioSaude, Error, Partial<ApoioSaude>>({
    mutationFn: createApoioSaude,
    onSuccess: () => {
      queryClient.invalidateQueries(['apoioSaude'])
      toast.success('Apoio à saúde criado com sucesso!')
      setNewApoio({ nome: '', email: '', telefone: '', descricao: '' })
    },
    onError: () => {
      toast.error('Erro ao criar apoio à saúde.')
    },
  })

  const updateMutation = useMutation<
    ApoioSaude,
    Error,
    UpdateApoioSaudeVariables
  >({
    mutationFn: ({ idApoioSaude, data }) =>
      updateApoioSaude(idApoioSaude, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['apoioSaude'])
      toast.success('Apoio à saúde atualizado com sucesso!')
      setCurrentApoio(null)
    },
    onError: () => {
      toast.error('Erro ao atualizar apoio à saúde.')
    },
  })

  const deleteMutation = useMutation<number, Error, number>({
    mutationFn: deleteApoioSaude,
    onSuccess: () => {
      queryClient.invalidateQueries(['apoioSaude'])
      toast.success('Apoio à saúde deletado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao deletar apoio à saúde.')
    },
  })

  const deactivateMutation = useMutation<void, Error, number>({
    mutationFn: deactivateApoioSaude,
    onSuccess: () => {
      queryClient.invalidateQueries(['apoioSaude'])
      toast.success('Apoio à saúde desativado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao desativar apoio à saúde.')
    },
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(newApoio)
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentApoio) {
      updateMutation.mutate({
        idApoioSaude: currentApoio.idApoioSaude,
        data: currentApoio,
      })
    }
  }

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja deletar este apoio à saúde?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleDeactivate = (id: number) => {
    deactivateMutation.mutate(id)
  }

  const filteredApoios = apoios
    .filter((apoio: ApoioSaude) => {
      if (filter === 'all') return true
      if (filter === 'ufpr') return apoio.idAdministrador === 1
      return apoio.idAdministrador !== 1
    })
    .filter((apoio: ApoioSaude) =>
      apoio.nome.toLowerCase().includes(searchTerm.toLowerCase()),
    )

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Gerenciar Apoio à Saúde</h1>
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
              <Button className="bg-blue-500 hover:bg-blue-600">Buscar</Button>
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
                    <Input
                      placeholder="Nome"
                      value={newApoio.nome}
                      onChange={(e) =>
                        setNewApoio({ ...newApoio, nome: e.target.value })
                      }
                      required
                    />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={newApoio.email}
                      onChange={(e) =>
                        setNewApoio({ ...newApoio, email: e.target.value })
                      }
                      required
                    />
                    <Input
                      placeholder="Telefone"
                      value={newApoio.telefone}
                      onChange={(e) =>
                        setNewApoio({ ...newApoio, telefone: e.target.value })
                      }
                      required
                    />
                    <Input
                      placeholder="Descrição"
                      value={newApoio.descricao}
                      onChange={(e) =>
                        setNewApoio({ ...newApoio, descricao: e.target.value })
                      }
                      required
                    />
                    <Button
                      type="submit"
                      className="w-full bg-blue-500 hover:bg-blue-600"
                    >
                      Salvar
                    </Button>
                  </form>
                </SheetContent>
              </Sheet>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <Skeleton className="h-6 w-1/2 mb-2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-3/4 mb-1" />
                      <Skeleton className="h-4 w-1/2 mb-3" />
                      <Skeleton className="h-8 w-full" />
                    </CardContent>
                  </Card>
                ))
              ) : filteredApoios.length ? (
                filteredApoios.map((apoio: ApoioSaude) => (
                  <Card key={apoio.idApoioSaude}>
                    <CardHeader>
                      <CardTitle>{apoio.nome}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">Email: {apoio.email}</p>
                      <p className="text-sm">Telefone: {apoio.telefone}</p>
                      <p className="text-sm mt-2">
                        Descrição: {apoio.descricao}
                      </p>
                      <div className="flex space-x-2 mt-4">
                        <Button
                          onClick={() => setCurrentApoio(apoio)}
                          className="bg-yellow-500 hover:bg-yellow-600"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(apoio.idApoioSaude)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeactivate(apoio.idApoioSaude)}
                          className="bg-gray-500 hover:bg-gray-600"
                        >
                          Desativar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-center col-span-full">
                  Nenhum apoio à saúde encontrado.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sheet para editar apoio à saúde */}
        <Sheet
          open={!!currentApoio}
          onOpenChange={(open) => !open && setCurrentApoio(null)}
        >
          <SheetTrigger asChild>
            <div />
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Editar Apoio à Saúde</SheetTitle>
            </SheetHeader>
            {currentApoio && (
              <form onSubmit={handleUpdate} className="space-y-4 mt-4">
                <Input
                  placeholder="Nome"
                  value={currentApoio.nome}
                  onChange={(e) =>
                    setCurrentApoio({ ...currentApoio, nome: e.target.value })
                  }
                  required
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={currentApoio.email}
                  onChange={(e) =>
                    setCurrentApoio({ ...currentApoio, email: e.target.value })
                  }
                  required
                />
                <Input
                  placeholder="Telefone"
                  value={currentApoio.telefone}
                  onChange={(e) =>
                    setCurrentApoio({
                      ...currentApoio,
                      telefone: e.target.value,
                    })
                  }
                  required
                />
                <Input
                  placeholder="Descrição"
                  value={currentApoio.descricao}
                  onChange={(e) =>
                    setCurrentApoio({
                      ...currentApoio,
                      descricao: e.target.value,
                    })
                  }
                  required
                />
                <Button
                  type="submit"
                  className="w-full bg-yellow-500 hover:bg-yellow-600"
                >
                  Atualizar
                </Button>
                <Button
                  type="button"
                  onClick={() => setCurrentApoio(null)}
                  className="w-full bg-gray-500 hover:bg-gray-600"
                >
                  Cancelar
                </Button>
              </form>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
