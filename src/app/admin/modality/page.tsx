'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jwtDecode } from 'jwt-decode'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
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

interface Modalidade {
  idModalidadeEsportiva: number
  nome: string
  descricao: string
  status: boolean
}

async function getModalidades() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/modalidadeEsportiva/listar`,
  )
  if (!res.ok) {
    throw new Error('Erro ao buscar modalidades')
  }
  return await res.json()
}

async function createModalidade(data: Partial<Modalidade>, token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/modalidadeEsportiva`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    },
  )
  if (!res.ok) {
    throw new Error('Erro ao cadastrar modalidade')
  }
  return res.json()
}

async function updateModalidade(data: Modalidade, token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/modalidadeEsportiva`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    },
  )
  if (!res.ok) {
    throw new Error('Erro ao editar modalidade')
  }
  return res.json()
}

async function desativarModalidade(id: number, token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/modalidadeEsportiva/desativar/${id}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )
  if (!res.ok) {
    throw new Error('Erro ao desativar modalidade')
  }
  return res.json()
}

async function searchModalidade(nome: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/modalidadeEsportiva/buscar/${nome}`,
  )
  if (!res.ok) {
    throw new Error('Erro ao buscar modalidade')
  }
  return await res.json()
}

async function inscreverModalidade(
  idAcademico: number,
  idModalidadeEsportiva: number,
  token: string,
) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/modalidadeEsportiva/inscrever/${idAcademico}/${idModalidadeEsportiva}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )
  if (!res.ok) {
    throw new Error('Erro ao se inscrever na modalidade')
  }
  return res.json()
}

export default function AdminModalidadesPage() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [userId, setUserId] = useState<number | null>(null)
  const [filter, setFilter] = useState('all')
  const [modalidadeForm, setModalidadeForm] = useState<Partial<Modalidade>>({
    nome: '',
    descricao: '',
    status: true,
  })
  const [editMode, setEditMode] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    const checkAdminStatus = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth')
        return
      }

      const decoded: any = jwtDecode(token)
      if (decoded.role !== 'ADMINISTRADOR') {
        toast.error(
          'Acesso negado! Somente administradores podem acessar esta página.',
        )
        router.push('/')
        return
      }

      setUserId(decoded.idUsuario)
      setIsAdmin(true)
    }
    checkAdminStatus()
  }, [router])

  const token = localStorage.getItem('token')

  const { data: modalidades = [], isLoading } = useQuery({
    queryKey: ['modalidades'],
    queryFn: getModalidades,
    enabled: isAdmin,
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<Modalidade>) => createModalidade(data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries(['modalidades'])
      toast.success('Modalidade criada com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao criar modalidade')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: Modalidade) => updateModalidade(data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries(['modalidades'])
      toast.success('Modalidade editada com sucesso!')
      setEditMode(false)
    },
    onError: () => {
      toast.error('Erro ao editar modalidade')
    },
  })

  const desativarMutation = useMutation({
    mutationFn: (id: number) => desativarModalidade(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries(['modalidades'])
      toast.success('Modalidade desativada com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao desativar modalidade')
    },
  })

  const inscreverMutation = useMutation({
    mutationFn: (idModalidadeEsportiva: number) =>
      inscreverModalidade(userId!, idModalidadeEsportiva, token!),
    onSuccess: () => {
      toast.success('Inscrição realizada com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao se inscrever na modalidade')
    },
  })

  const handleCreateModalidade = () => {
    if (!modalidadeForm.nome || !modalidadeForm.descricao) {
      toast.error('Todos os campos são obrigatórios')
      return
    }
    createMutation.mutate(modalidadeForm)
  }

  const handleEditModalidade = (modalidade: Modalidade) => {
    setEditMode(true)
    setModalidadeForm(modalidade)
  }

  const handleUpdateModalidade = () => {
    if (!modalidadeForm.nome || !modalidadeForm.descricao) {
      toast.error('Todos os campos são obrigatórios')
      return
    }
    updateMutation.mutate(modalidadeForm as Modalidade)
  }

  const handleDesativarModalidade = (id: number) => {
    desativarMutation.mutate(id)
  }

  const handleInscrever = (idModalidadeEsportiva: number) => {
    inscreverMutation.mutate(idModalidadeEsportiva)
  }

  const handleSearch = async () => {
    try {
      const data = await searchModalidade(searchTerm)
      setModalidades([data])
    } catch (error) {
      toast.error('Modalidade não encontrada')
    }
  }

  if (isLoading) {
    return (
      <div className="flex">
        <Sidebar className="h-screen w-64" />
        <div className="flex-1 container mx-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-10 w-1/3" />
            <div className="flex space-x-4">
              <Skeleton className="h-10 w-1/4" />
              <Skeleton className="h-10 w-1/4" />
              <Skeleton className="h-10 w-1/4" />
              <Skeleton className="h-10 w-1/4" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex justify-end space-x-2 mt-4">
                    <Skeleton className="h-10 w-1/4" />
                    <Skeleton className="h-10 w-1/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Header />
      <div className="flex min-h-screen">
        <Sidebar className="flex-none" />
        <div className="container mx-auto p-4 flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Gerenciar Modalidades</h1>
            <div className="flex space-x-4">
              <Input
                placeholder="Buscar por nome"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button
                onClick={handleSearch}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Buscar
              </Button>
              <Select onValueChange={setFilter} defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="ativas">Ativas</SelectItem>
                  <SelectItem value="desativadas">Desativadas</SelectItem>
                </SelectContent>
              </Select>
              {isAdmin && (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button className="bg-green-500 hover:bg-green-600">
                      {editMode ? 'Editar Modalidade' : 'Cadastrar Modalidade'}
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>
                        {editMode
                          ? 'Editar Modalidade'
                          : 'Cadastrar Nova Modalidade'}
                      </SheetTitle>
                    </SheetHeader>
                    <form className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="nome">Nome</Label>
                        <Input
                          id="nome"
                          value={modalidadeForm.nome}
                          onChange={(e) =>
                            setModalidadeForm({
                              ...modalidadeForm,
                              nome: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="descricao">Descrição</Label>
                        <Input
                          id="descricao"
                          value={modalidadeForm.descricao}
                          onChange={(e) =>
                            setModalidadeForm({
                              ...modalidadeForm,
                              descricao: e.target.value,
                            })
                          }
                        />
                      </div>
                      <Button
                        onClick={
                          editMode
                            ? handleUpdateModalidade
                            : handleCreateModalidade
                        }
                        className="w-full bg-green-500 hover:bg-green-600"
                      >
                        {editMode
                          ? 'Atualizar Modalidade'
                          : 'Cadastrar Modalidade'}
                      </Button>
                    </form>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {modalidades.map((modalidade: Modalidade) => (
              <Card key={modalidade.idModalidadeEsportiva}>
                <CardHeader>
                  <CardTitle>{modalidade.nome}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{modalidade.descricao}</p>
                  <p>Status: {modalidade.status ? 'Ativa' : 'Desativada'}</p>
                  {isAdmin ? (
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button
                        onClick={() => handleEditModalidade(modalidade)}
                        className="bg-yellow-500 hover:bg-yellow-600"
                      >
                        Editar
                      </Button>
                      <Button
                        onClick={() =>
                          handleDesativarModalidade(
                            modalidade.idModalidadeEsportiva,
                          )
                        }
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Desativar
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() =>
                        handleInscrever(modalidade.idModalidadeEsportiva)
                      }
                      className="w-full bg-blue-500 hover:bg-blue-600 mt-4"
                    >
                      Inscrever-se
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
