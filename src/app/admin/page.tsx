'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {jwtDecode} from 'jwt-decode'
import { toast } from 'sonner'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
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

async function fetchAdmins() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/administrador/listar`,
  )
  if (!res.ok) throw new Error('Erro ao buscar administradores.')
  const data = await res.json()
  return data.content || [] // Retorna o conteúdo ou um array vazio
}

async function createAdmin(newAdmin) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/administrador/cadastrar`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newAdmin),
    },
  )
  if (!res.ok) throw new Error('Erro ao cadastrar administrador.')
  return await res.json()
}

async function updateAdmin(idAdministrador, updatedAdmin) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/administrador/atualizar/${idAdministrador}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedAdmin),
    },
  )
  if (!res.ok) throw new Error('Erro ao atualizar administrador.')
  return await res.json()
}

async function inactivateAdmin(idAdministrador) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/administrador/inativar/${idAdministrador}`,
    {
      method: 'PATCH',
      mode: 'no-cors', // Adiciona o modo no-cors
    },
  )
  if (!res.ok) throw new Error('Erro ao inativar administrador.')
  return await res.json()
}

function formatPhoneNumber(phoneNumber) {
  const cleaned = ('' + phoneNumber).replace(/\D/g, '')
  const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/)
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`
  }
  return phoneNumber
}

export default function AdminCrudPage() {
  const [currentAdmin, setCurrentAdmin] = useState(null)
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    password: '',
    nome: '',
    telefone: '',
    dataNascimento: '',
    foto: null,
    dataCriacao: null,
    ativo: null,
  })
  const [editAdmin, setEditAdmin] = useState(null)
  const [showAdminsOnly, setShowAdminsOnly] = useState(true)
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    const checkAdminStatus = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth')
        return
      }
      let decoded
      try {
        decoded = jwtDecode(token)
        console.log('Decoded Token:', decoded) // Log do token decodificado
      } catch (error) {
        console.error('Erro ao decodificar o token:', error)
        router.push('/auth')
        return
      }
      if (!decoded.roles.includes('ADMINISTRADOR')) {
        toast.error(
          'Acesso negado! Somente administradores podem acessar esta página.',
        )
        router.push('/')
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
    enabled: !!currentAdmin,
  })

  const filteredAdmins = Array.isArray(admins)
    ? showAdminsOnly
      ? admins.filter((admin) => admin.permissao === 'ADMINISTRADOR')
      : admins
    : []

  const handleCreateAdmin = async () => {
    try {
      await createAdmin(newAdmin)
      toast.success('Administrador cadastrado com sucesso.')
      queryClient.invalidateQueries(['admins'])
      setNewAdmin({
        username: '',
        password: '',
        nome: '',
        telefone: '',
        dataNascimento: '',
        foto: null,
        dataCriacao: null,
        ativo: null,
      }) // Resetar o formulário
    } catch (error) {
      toast.error('Erro ao cadastrar o administrador.')
    }
  }

  const handleUpdateAdmin = async () => {
    try {
      await updateAdmin(editAdmin.idAdministrador, editAdmin)
      toast.success('Administrador atualizado com sucesso.')
      queryClient.invalidateQueries(['admins'])
      setEditAdmin(null) // Fechar o formulário de edição
    } catch (error) {
      toast.error('Erro ao atualizar o administrador.')
    }
  }

  const handleInactivateAdmin = async (idAdministrador) => {
    try {
      await inactivateAdmin(idAdministrador)
      toast.success('Administrador inativado com sucesso.')
      queryClient.invalidateQueries(['admins'])
    } catch (error) {
      toast.error('Erro ao inativar o administrador.')
    }
  }

  return (
    <>
      <Header />
      <div className="flex h-screen">
        <Sidebar className="flex-none" />
        <div className="container mx-auto p-4 flex-1 overflow-y-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Gerenciar Administradores
            </h1>
            <div className="flex items-center space-x-4">
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
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="outline"
                    className="bg-white text-black"
                  >
                      Cadastrar Novo Administrador
                  </Button>
                </SheetTrigger>
                <SheetContent position="right" size="lg">
                  <SheetHeader>
                    <SheetTitle>Cadastrar Administrador</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col space-y-4 mt-6">
                    <Input
                      placeholder="Username"
                      value={newAdmin.username}
                      onChange={(e) =>
                        setNewAdmin({ ...newAdmin, username: e.target.value })
                      }
                    />
                    <Input
                      placeholder="Senha"
                      type="password"
                      value={newAdmin.password}
                      onChange={(e) =>
                        setNewAdmin({ ...newAdmin, password: e.target.value })
                      }
                    />
                    <Input
                      placeholder="Nome"
                      value={newAdmin.nome}
                      onChange={(e) =>
                        setNewAdmin({ ...newAdmin, nome: e.target.value })
                      }
                    />
                    <Input
                      placeholder="Telefone"
                      value={newAdmin.telefone}
                      onChange={(e) =>
                        setNewAdmin({ ...newAdmin, telefone: e.target.value })
                      }
                    />
                    <Input
                      placeholder="Data de Nascimento"
                      value={newAdmin.dataNascimento}
                      onChange={(e) =>
                        setNewAdmin({ ...newAdmin, dataNascimento: e.target.value })
                      }
                    />
                    <Button
                      onClick={handleCreateAdmin}
                      variant="outline"
                      className="mt-4 bg-white text-black"
                    >
                      Salvar
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Formulário de edição */}
          {editAdmin && (
            <Sheet open={!!editAdmin} onOpenChange={() => setEditAdmin(null)}>
              <SheetContent position="right" size="lg">
                <SheetHeader>
                  <SheetTitle>Editar Administrador</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-6">
                  <Input
                    placeholder="Username"
                    value={editAdmin.username}
                    onChange={(e) =>
                      setEditAdmin({ ...editAdmin, username: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Senha"
                    type="password"
                    value={editAdmin.password}
                    onChange={(e) =>
                      setEditAdmin({ ...editAdmin, password: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Nome"
                    value={editAdmin.nome}
                    onChange={(e) =>
                      setEditAdmin({ ...editAdmin, nome: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Telefone"
                    value={editAdmin.telefone}
                    onChange={(e) =>
                      setEditAdmin({ ...editAdmin, telefone: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Data de Nascimento"
                    value={editAdmin.dataNascimento}
                    onChange={(e) =>
                      setEditAdmin({
                        ...editAdmin,
                        dataNascimento: e.target.value,
                      })
                    }
                  />
                    <Button
                    onClick={handleUpdateAdmin}
                    variant="outline"
                    className="mt-4 bg-white text-black"
                    >
                    Salvar
                    </Button>
                </div>
              </SheetContent>
            </Sheet>
          )}

          {/* Listagem de administradores */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="w-full h-32 rounded-lg" />
                ))
              : filteredAdmins.map((admin) => (
                  <Card
                    key={admin.idAdministrador}
                    className="shadow-md bg-white dark:bg-gray-800"
                  >
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100">
                        {admin.nome} ({admin.username})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col space-y-2">
                      <span className="text-gray-700 dark:text-gray-300">
                        Telefone: {formatPhoneNumber(admin.telefone)}
                      </span>
                      <div className="flex items-center justify-between">
                        <Button
                          onClick={() => setEditAdmin(admin)}
                          variant="outline"
                          className="mt-4 bg-white text-black"
                        >
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleInactivateAdmin(admin.idAdministrador)}
                        >
                          Inativar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </div>
      </div>
    </>
  )
}