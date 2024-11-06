'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jwtDecode } from 'jwt-decode' // Certifique-se de que esta biblioteca está instalada
import { Loader2, Trash2, Edit } from 'lucide-react'
import { toast } from 'sonner'

import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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

// Função para buscar todos os administradores
async function fetchAdmins() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/administrador/listar`,
  )
  if (!res.ok) throw new Error('Erro ao buscar administradores.')
  return await res.json()
}

// Função para cadastrar um novo administrador
async function createAdmin(adminData: {
  name: string
  email: string
  username: string
  password: string
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/administrador/cadastrar`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminData),
    },
  )
  if (!res.ok) throw new Error('Erro ao cadastrar novo administrador.')
  return res.json()
}

// Função para atualizar um administrador existente
async function updateAdmin(
  id: string,
  adminData: {
    name: string
    email: string
    username: string
  },
) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/administrador/atualizar/${id}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminData),
    },
  )
  if (!res.ok) throw new Error('Erro ao atualizar administrador.')
  return res.json()
}

// Função para consultar detalhes de um administrador
async function consultAdmin(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/administrador/consultar/${id}`,
  )
  if (!res.ok) throw new Error('Erro ao consultar administrador.')
  return await res.json()
}

// Função para inativar um administrador
async function inactivateAdmin(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/administrador/inativar/${id}`,
    {
      method: 'PUT',
    },
  )
  if (!res.ok) throw new Error('Erro ao inativar administrador.')
  return res.json()
}

// Função para excluir um administrador
async function deleteAdmin(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/administrador/excluir/${id}`,
    {
      method: 'DELETE',
    },
  )
  if (!res.ok) throw new Error('Erro ao excluir administrador.')
  return res.json()
}

export default function AdminCrudPage() {
  const [currentAdmin, setCurrentAdmin] = useState<{
    id: string
    name: string
    email: string
    username: string
  } | null>(null)
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
  })
  const [showAdminsOnly, setShowAdminsOnly] = useState(true) // Mostra apenas admins por padrão
  const router = useRouter()
  const queryClient = useQueryClient()

  // Verifica se o usuário logado é admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      const token = localStorage.getItem('token') // Obtém o token do localStorage
      if (!token) {
        router.push('/auth') // Redireciona para login se não houver token
        return
      }

      const decoded: any = jwtDecode(token) // Decodifica o token
      if (decoded.role !== 'ADMINISTRADOR') {
        toast.error(
          'Acesso negado! Somente administradores podem acessar esta página.',
        )
        router.push('/') // Redireciona para a página principal
        return
      }

      setCurrentAdmin({
        id: decoded.idUsuario,
        name: decoded.name,
        email: decoded.email,
        username: decoded.username,
      })
    }
    checkAdminStatus()
  }, [router])

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ['admins'],
    queryFn: fetchAdmins,
    enabled: !!currentAdmin, // Só faz a consulta se o usuário for admin
  })

  const createAdminMutation = useMutation({
    mutationFn: createAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] })
      toast.success('Novo administrador cadastrado com sucesso!')
      setNewAdmin({ name: '', email: '', username: '', password: '' })
    },
    onError: () => {
      toast.error('Erro ao cadastrar novo administrador.')
    },
  })

  const updateAdminMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: { name: string; email: string; username: string }
    }) => updateAdmin(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] })
      toast.success('Administrador atualizado com sucesso!')
      setCurrentAdmin(null)
    },
    onError: () => {
      toast.error('Erro ao atualizar administrador.')
    },
  })

  const inactivateAdminMutation = useMutation({
    mutationFn: inactivateAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries(['admins'])
      toast.success('Administrador inativado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao inativar administrador.')
    },
  })

  const deleteAdminMutation = useMutation({
    mutationFn: deleteAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries(['admins'])
      toast.success('Administrador excluído com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao excluir administrador.')
    },
  })

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault()
    if (
      newAdmin.name &&
      newAdmin.email &&
      newAdmin.username &&
      newAdmin.password
    ) {
      createAdminMutation.mutate(newAdmin)
    } else {
      toast.error('Preencha todos os campos.')
    }
  }

  const handleUpdateAdmin = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentAdmin) {
      const { id, name, email, username } = currentAdmin
      if (name && email && username) {
        updateAdminMutation.mutate({ id, data: { name, email, username } })
      } else {
        toast.error('Preencha todos os campos.')
      }
    }
  }

  const handleInactivateAdmin = (id: string) => {
    inactivateAdminMutation.mutate(id)
  }

  const handleDeleteAdmin = (id: string) => {
    deleteAdminMutation.mutate(id)
  }

  interface Admin {
    id: string
    name: string
    email: string
    username: string
    isAdmin: boolean
  }

  const handleEditClick = (admin: Admin) => {
    setCurrentAdmin({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      username: admin.username,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <>
      <Header />
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
          <h1 className="text-2xl font-bold">Gerenciar Administradores</h1>

          {/* Filtro para mostrar apenas admins ou todos */}
          <Select
            onValueChange={(value) => setShowAdminsOnly(value === 'admins')}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar usuários" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admins">Mostrar apenas Admins</SelectItem>
              <SelectItem value="all">Mostrar Todos</SelectItem>
            </SelectContent>
          </Select>

          {/* Botão para cadastrar novo administrador */}
          <Sheet>
            <SheetTrigger asChild>
              <Button className="bg-blue-500 hover:bg-blue-600">
                Adicionar Novo Administrador
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Cadastrar Novo Administrador</SheetTitle>
              </SheetHeader>
              <form className="space-y-4 mt-8" onSubmit={handleCreateAdmin}>
                <Input
                  placeholder="Nome"
                  value={newAdmin.name}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, name: e.target.value })
                  }
                  required
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={newAdmin.email}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, email: e.target.value })
                  }
                  required
                />
                <Input
                  placeholder="Username"
                  value={newAdmin.username}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, username: e.target.value })
                  }
                  required
                />
                <Input
                  type="password"
                  placeholder="Senha"
                  value={newAdmin.password}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, password: e.target.value })
                  }
                  required
                />
                <Button
                  type="submit"
                  className="w-full bg-green-500 hover:bg-green-600"
                >
                  Salvar
                </Button>
              </form>
            </SheetContent>
          </Sheet>
        </div>

        {/* Formulário para editar administrador */}
        {currentAdmin && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Editar Administrador</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleUpdateAdmin}>
                <Input
                  placeholder="Nome"
                  value={currentAdmin.name}
                  onChange={(e) =>
                    setCurrentAdmin({
                      ...currentAdmin,
                      name: e.target.value,
                    })
                  }
                  required
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={currentAdmin.email}
                  onChange={(e) =>
                    setCurrentAdmin({
                      ...currentAdmin,
                      email: e.target.value,
                    })
                  }
                  required
                />
                <Input
                  placeholder="Username"
                  value={currentAdmin.username}
                  onChange={(e) =>
                    setCurrentAdmin({
                      ...currentAdmin,
                      username: e.target.value,
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
                  onClick={() => setCurrentAdmin(null)}
                  className="w-full bg-gray-500 hover:bg-gray-600"
                >
                  Cancelar
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Listar todos os administradores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {admins.map((admin: any) => (
            <Card key={admin.id} className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-bold">
                  {admin.name} ({admin.username})
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col space-y-2">
                <span>Email: {admin.email}</span>
                <div className="flex items-center justify-between">
                  <Checkbox
                    checked={admin.isAdmin}
                    onCheckedChange={() =>
                      handleToggleAdmin(admin.id, admin.isAdmin)
                    }
                  >
                    Admin
                  </Checkbox>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleEditClick(admin)}
                      className="bg-yellow-500 hover:bg-yellow-600"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteAdmin(admin.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={() => handleInactivateAdmin(admin.id)}
                  className="w-full bg-red-500 hover:bg-red-600 mt-2"
                >
                  Inativar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}
