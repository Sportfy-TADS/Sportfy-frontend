'use client'

import { useState, useEffect } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

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
  const response = await fetch('http://localhost:8081/apoioSaude/listar', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
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
}): Promise<any> {
  const response = await fetch('http://localhost:8081/apoioSaude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Erro ao cadastrar apoio à saúde')
  }
  return response.json()
}

async function updateApoioSaude(id: number, data: {
  nome: string
  email: string
  telefone: string
  descricao: string
}): Promise<any> {
  const response = await fetch(`http://localhost:8081/apoioSaude/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Erro ao atualizar apoio à saúde')
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
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: apoiosSaude = [], isLoading, isError, error } = useQuery({
    queryKey: ['apoiosSaude'],
    queryFn: fetchApoioSaude,
  })

  const createMutation = useMutation({
    mutationFn: createApoioSaude,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apoiosSaude'] })
      setIsSheetOpen(false)
    },
    onError: () => {
      toast.error('Erro ao cadastrar apoio à saúde')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (variables: { id: number, data: { nome: string, email: string, telefone: string, descricao: string } }) => updateApoioSaude(variables.id, variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apoiosSaude'] })
      toast.success('Apoio à saúde atualizado com sucesso!')
      setIsSheetOpen(false)
    },
    onError: () => {
      toast.error('Erro ao atualizar apoio à saúde')
    },
  })

  useEffect(() => {
    if (isError) {
      console.error('Erro ao carregar apoios à saúde:', error)
    }
  }, [isError, error])

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

  interface NewApoioSaude {
    nome: string
    email: string
    telefone: string
    descricao: string
    dataPublicacao: string
    idAdministrador: number
    ativo: boolean
  }

  const handleCreateApoioSaude = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    createMutation.mutate(newApoioSaude)
  }

  const handleUpdateApoioSaude = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (editApoioSaude) {
      updateMutation.mutate({ id: editApoioSaude.idApoioSaude, data: newApoioSaude })
    }
  }

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

  interface NewApoioSaude {
    nome: string
    email: string
    telefone: string
    descricao: string
    dataPublicacao: string
    idAdministrador: number
    ativo: boolean
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
    setIsSheetOpen(true)
  }

  return (
    <>
      <Header />
      <div className="flex min-h-screen">
        <Sidebar />
        <motion.div
          className="container mx-auto p-4 flex-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Apoios à Saúde</h1>
            <div className="flex space-x-4">
              <Sheet>
                
                <SheetTrigger asChild>
                  <Button className="bg-blue-500 hover:bg-blue-600" onClick={() => setIsSheetOpen(true)}>
                    Cadastrar Apoio à Saúde
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>{editApoioSaude ? 'Editar Apoio à Saúde' : 'Cadastrar Apoio à Saúde'}</SheetTitle>
                  </SheetHeader>
                  <form className="space-y-4 mt-4" onSubmit={editApoioSaude ? handleUpdateApoioSaude : handleCreateApoioSaude}>
                    <Input
                      placeholder="Nome"
                      value={newApoioSaude.nome}
                      onChange={(e) => setNewApoioSaude({ ...newApoioSaude, nome: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Email"
                      value={newApoioSaude.email}
                      onChange={(e) => setNewApoioSaude({ ...newApoioSaude, email: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Telefone"
                      value={newApoioSaude.telefone}
                      onChange={(e) => setNewApoioSaude({ ...newApoioSaude, telefone: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Descrição"
                      value={newApoioSaude.descricao}
                      onChange={(e) => setNewApoioSaude({ ...newApoioSaude, descricao: e.target.value })}
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
                <Card className="border border-emerald-500" key={apoio.idApoioSaude}>
                  <CardHeader>
                    <CardTitle className='text-emerald-500'>{apoio.nome}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Email: {apoio.email}</p>
                    <p>Telefone: {apoio.telefone}</p>
                    <p>Descrição: {apoio.descricao}</p>
                    <p>Data de Publicação: {new Date(apoio.dataPublicacao).toLocaleDateString()}</p>
                    <Button className="mt-4 w-full" onClick={() => handleEditClick(apoio)}>
                      Editar
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