'use client'

import { useState, useEffect } from 'react'

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
/*
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
 */
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'

// Funções de API
interface ApoioSaude {
  idApoioSaude: number
  nome: string
  email: string
  telefone: string
  descricao: string
  dataPublicacao: string
  idAdministrador: number
  ativo: boolean
}

async function fetchApoioSaude(): Promise<ApoioSaude[]> {
  const token = localStorage.getItem('token')
  const response = await fetch('http://localhost:8081/apoioSaude/listar', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
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
  dataPublicacao: string
  idAdministrador: number
  ativo: boolean
}): Promise<ApoioSaude> {
  const token = localStorage.getItem('token')
  const response = await fetch('http://localhost:8081/apoioSaude', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Erro ao cadastrar apoio à saúde')
  }
  return response.json()
}

async function updateApoioSaude(
  id: number,
  data: {
    nome: string
    email: string
    telefone: string
    descricao: string
  },
): Promise<ApoioSaude> {
  const token = localStorage.getItem('token')
  const response = await fetch(`http://localhost:8081/apoioSaude/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Erro ao atualizar apoio à saúde')
  }
  return response.json()
}

async function deleteApoioSaude(id: number): Promise<{ success: boolean }> {
  const token = localStorage.getItem('token')
  const response = await fetch(`http://localhost:8081/apoioSaude/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    throw new Error('Erro ao deletar apoio à saúde')
  }
  return response.json()
}

async function deactivateApoioSaude(id: number): Promise<{ success: boolean }> {
  const token = localStorage.getItem('token')
  const response = await fetch(
    `http://localhost:8081/apoioSaude/desativar/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )
  if (!response.ok) {
    throw new Error('Erro ao desativar apoio à saúde')
  }
  return response.json()
}

export default function ApoioSaudePage() {
  const [newApoioSaude, setNewApoioSaude] = useState({
    nome: '',
    email: '',
    telefone: '',
    descricao: '',
    dataPublicacao: new Date().toISOString(),
    idAdministrador: 1,
    ativo: true,
  })
  const [editApoioSaude, setEditApoioSaude] = useState<{
    idApoioSaude: number
    nome: string
    email: string
    telefone: string
    descricao: string
    dataPublicacao: string
    idAdministrador: number
    ativo: boolean
  } | null>(null)
  const queryClient = useQueryClient()

  const {
    data: apoiosSaude = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['apoiosSaude'],
    queryFn: fetchApoioSaude,
  })

  const createMutation = useMutation({
    mutationFn: createApoioSaude,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apoiosSaude'] })
    },
    onError: () => {
      toast.error('Erro ao cadastrar apoio à saúde')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (variables: {
      id: number
      data: { nome: string; email: string; telefone: string; descricao: string }
    }) => updateApoioSaude(variables.id, variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apoiosSaude'] })
      toast.success('Apoio à saúde atualizado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao atualizar apoio à saúde')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteApoioSaude,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apoiosSaude'] })
      toast.success('Apoio à saúde deletado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao deletar apoio à saúde')
    },
  })

  const deactivateMutation = useMutation({
    mutationFn: deactivateApoioSaude,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apoiosSaude'] })
      toast.success('Apoio à saúde desativado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao desativar apoio à saúde')
    },
  })

  useEffect(() => {
    if (isError) {
      console.error('Erro ao carregar apoios à saúde:', error)
    }
  }, [isError, error])

  // Ensure that the data is being fetched correctly
  useEffect(() => {
    if (!isLoading && apoiosSaude.length === 0) {
      console.warn('Nenhum apoio à saúde encontrado')
    }
    console.log('Dados dos apoios à saúde:', apoiosSaude)
  }, [isLoading, apoiosSaude])

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        document.querySelector('body > nextjs-portal')?.remove()
      }, 10)
    }
  }, [])

  const handleCreateApoioSaude = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    createMutation.mutate(newApoioSaude)
  }

  const handleUpdateApoioSaude = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (editApoioSaude) {
      updateMutation.mutate({
        id: editApoioSaude.idApoioSaude,
        data: newApoioSaude,
      })
    }
  }

  const handleDeleteClick = (id: number) => {
    if (confirm('Tem certeza que deseja deletar este apoio à saúde?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleDeactivateClick = (id: number) => {
    if (confirm('Tem certeza que deseja desativar este apoio à saúde?')) {
      deactivateMutation.mutate(id)
    }
  }

  const handleEditClick = (apoio: ApoioSaude) => {
    setEditApoioSaude(apoio)
    setNewApoioSaude({
      nome: apoio.nome,
      email: apoio.email,
      telefone: apoio.telefone,
      descricao: apoio.descricao,
      dataPublicacao: apoio.dataPublicacao,
      idAdministrador: apoio.idAdministrador,
      ativo: apoio.ativo,
    })
  }

  return (
    <>
      <Header />
      <div className="flex min-h-screen">
        <Sidebar />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Apoios à Saúde</h1>
            <div className="flex space-x-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    className="bg-blue-500 hover:bg-blue-600"
                    onClick={() => {}}
                  >
                    Cadastrar Apoio à Saúde
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>
                      {editApoioSaude
                        ? 'Editar Apoio à Saúde'
                        : 'Cadastrar Apoio à Saúde'}
                    </SheetTitle>
                  </SheetHeader>
                  <form
                    className="space-y-4 mt-4"
                    onSubmit={
                      editApoioSaude
                        ? handleUpdateApoioSaude
                        : handleCreateApoioSaude
                    }
                  >
                    <Input
                      placeholder="Nome"
                      value={newApoioSaude.nome}
                      onChange={(e) =>
                        setNewApoioSaude({
                          ...newApoioSaude,
                          nome: e.target.value,
                        })
                      }
                      required
                    />
                    <Input
                      placeholder="Email"
                      value={newApoioSaude.email}
                      onChange={(e) =>
                        setNewApoioSaude({
                          ...newApoioSaude,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                    <Input
                      placeholder="Telefone"
                      value={newApoioSaude.telefone}
                      onChange={(e) =>
                        setNewApoioSaude({
                          ...newApoioSaude,
                          telefone: e.target.value,
                        })
                      }
                      required
                    />
                    <Input
                      placeholder="Descrição"
                      value={newApoioSaude.descricao}
                      onChange={(e) =>
                        setNewApoioSaude({
                          ...newApoioSaude,
                          descricao: e.target.value,
                        })
                      }
                      required
                    />
                    <Button type="submit" className="w-full">
                      Salvar
                    </Button>
                  </form>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {isLoading ? (
            <Skeleton />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apoiosSaude.map((apoio: ApoioSaude) => (
                <Card
                  className="border border-emerald-500"
                  key={apoio.idApoioSaude}
                >
                  <CardHeader>
                    <CardTitle className="text-emerald-500">
                      {apoio.nome}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Email: {apoio.email}</p>
                    <p>Telefone: {apoio.telefone}</p>
                    <p>Descrição: {apoio.descricao}</p>
                    <p>
                      Data de Publicação:{' '}
                      {new Date(apoio.dataPublicacao).toLocaleDateString()}
                    </p>
                    <Button
                      className="mt-4 w-full"
                      onClick={() => handleEditClick(apoio)}
                    >
                      Editar
                    </Button>
                    <Button
                      className="mt-4 w-full bg-red-500 hover:bg-red-600"
                      onClick={() => handleDeleteClick(apoio.idApoioSaude)}
                    >
                      Deletar
                    </Button>
                    <Button
                      className="mt-4 w-full bg-yellow-500 hover:bg-yellow-600"
                      onClick={() => handleDeactivateClick(apoio.idApoioSaude)}
                    >
                      Desativar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </>
  )
}
