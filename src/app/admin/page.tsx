'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { JwtPayload } from 'jwt-decode'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { useAuth } from '@/hooks/useAuth'; // novo hook de autenticação

async function fetchAdmins() {
  const token = localStorage.getItem('token')
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/administrador/listar`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )
  if (!res.ok) throw new Error('Erro ao buscar administradores.')
  const data = await res.json()
  return data.content || [] 
}

interface NewAdmin {
  username: string
  password: string
  nome: string
  telefone: string
  dataNascimento: string
  foto: File | null
  dataCriacao: Date | null
  ativo: boolean | null
}

interface UpdatedAdmin extends NewAdmin {
  idAdministrador: number
}

async function createAdmin(newAdmin: NewAdmin) {
  const token = localStorage.getItem('token')
  console.log('Token para criar admin (page):', token)
  console.log('Dados para criar admin (page):', newAdmin)

  // Normalize fields to backend-expected formats
  const normalizeToIso = (d: string) => {
    if (!d) return null
    // Already ISO-like (contains T)
    if (d.includes('T')) return d

    // dd/mm/yyyy -> convert
    const matchDMY = d.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    if (matchDMY) {
      const [, day, month, year] = matchDMY
      const dt = new Date(Number(year), Number(month) - 1, Number(day))
      return dt.toISOString()
    }

    // yyyy-mm-dd -> convert to ISO at midnight local
    const matchYMD = d.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (matchYMD) {
      const [, year, month, day] = matchYMD
      const dt = new Date(Number(year), Number(month) - 1, Number(day))
      return dt.toISOString()
    }

    // fallback: try Date constructor
    const parsed = new Date(d)
    if (!isNaN(parsed.getTime())) return parsed.toISOString()
    return d
  }

  const cleanPhone = (p: string) => (p ? String(p).replace(/\D/g, '') : p)

  const payload = {
    ...newAdmin,
    dataNascimento: normalizeToIso(String(newAdmin.dataNascimento || '')),
    telefone: cleanPhone(String(newAdmin.telefone || '')),
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/administrador/cadastrar`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  )

  console.log('Status da resposta (page):', res.status)
  const responseText = await res.text()
  console.log('Resposta da API (page):', responseText)

  if (!res.ok) {
    throw new Error(`Erro ao cadastrar administrador: ${res.status} - ${responseText}`)
  }

  return JSON.parse(responseText)
}

async function updateAdmin(
  idAdministrador: number,
  updatedAdmin: UpdatedAdmin,
) {
  const token = localStorage.getItem('token')
  console.log('Token para atualizar admin:', token)
  console.log('Dados para atualizar admin:', updatedAdmin)

  // Normalize fields to backend-expected formats
  const normalizeToIso = (d: string) => {
    if (!d) return null
    // Already ISO-like (contains T)
    if (d.includes('T')) return d

    // dd/mm/yyyy -> convert
    const matchDMY = d.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    if (matchDMY) {
      const [, day, month, year] = matchDMY
      const dt = new Date(Number(year), Number(month) - 1, Number(day))
      return dt.toISOString()
    }

    // yyyy-mm-dd -> convert to ISO at midnight local
    const matchYMD = d.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (matchYMD) {
      const [, year, month, day] = matchYMD
      const dt = new Date(Number(year), Number(month) - 1, Number(day))
      return dt.toISOString()
    }

    // fallback: try Date constructor
    const parsed = new Date(d)
    if (!isNaN(parsed.getTime())) return parsed.toISOString()
    return d
  }

  const cleanPhone = (p: string) => (p ? String(p).replace(/\D/g, '') : p)

  // Use the exact format expected by the API, including required fields
  const payload = {
    idAdministrador: idAdministrador,
    username: updatedAdmin.username,
    password: updatedAdmin.password,
    nome: updatedAdmin.nome,
    telefone: cleanPhone(String(updatedAdmin.telefone || '')),
    dataNascimento: normalizeToIso(String(updatedAdmin.dataNascimento || '')),
    foto: null, // Keep as null for now
    dataCriacao: new Date().toISOString(), // Current timestamp or keep original if available
    ativo: true,
    permissao: "ADMINISTRADOR"
  }

  console.log('Payload normalizado para atualização:', payload)

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/administrador/atualizar/${idAdministrador}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  )

  console.log('Status da resposta atualização:', res.status)
  const responseText = await res.text()
  console.log('Resposta da API atualização:', responseText)

  if (!res.ok) {
    throw new Error(`Erro ao atualizar administrador: ${res.status} - ${responseText}`)
  }

  return JSON.parse(responseText)
}

async function inactivateAdmin(idAdministrador: number) {
  const token = localStorage.getItem('token')
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/administrador/inativar/${idAdministrador}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      mode: 'no-cors',
    },
  )
  if (!res.ok) throw new Error('Erro ao inativar administrador.')
  return await res.json()
}

function formatPhoneNumber(phoneNumber: string) {
  const cleaned = ('' + phoneNumber).replace(/\D/g, '')
  const match = cleaned.match(/^(\d{0,11})$/)
  if (match) {
    const value = match[0]
    if (value.length <= 2) return value
    if (value.length <= 7) return `(${value.slice(0, 2)}) ${value.slice(2)}`
    return `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`
  }
  return phoneNumber
}

function maskPhoneNumber(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d{4,5})(\d{4})$/, '$1-$2')
}

function maskDate(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1')
}

function formatDateForInput(dateString: string) {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

interface CustomJwtPayload extends JwtPayload {
  roles: string[]
  idUsuario: number
  name: string
  email: string
  telefone: number
  username: string
}

interface Admin {
  id: number
  name: string
  email: string
  username: string
  nome: string
}

interface EditAdmin extends UpdatedAdmin {}

interface AdminToEdit {
  idAdministrador: number
  username: string
  password: string
  nome: string
  telefone: string
  dataNascimento: string
  foto: File | null
  dataCriacao: Date | null
  ativo: boolean | null
}

export default function AdminCrudPage() {
  // useAuth encapsula a verificação de autenticação e retorna o administrador atual
  const currentAdmin = useAuth()
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
  const [editAdmin, setEditAdmin] = useState<EditAdmin | null>(null)
  const [showAdminsOnly, setShowAdminsOnly] = useState(true)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        document.querySelector('body > nextjs-portal')?.remove()
      }, 10)
    }
  }, [])

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

  const handleCreateAdmin = useCallback(async () => {
    try {
      await createAdmin(newAdmin)
      toast.success('Administrador cadastrado com sucesso.')
      queryClient.invalidateQueries({ queryKey: ['admins'] })
      setNewAdmin({
        username: '',
        password: '',
        nome: '',
        telefone: '',
        dataNascimento: '',
        foto: null,
        dataCriacao: null,
        ativo: null,
      })
    } catch (error) {
      toast.error('Erro ao cadastrar o administrador.')
    }
  }, [newAdmin, queryClient])

  const handleUpdateAdmin = useCallback(async () => {
    if (!editAdmin) return
    try {
      const updatedAdmin = await updateAdmin(editAdmin.idAdministrador, editAdmin)
      toast.success('Administrador atualizado com sucesso.')
      queryClient.invalidateQueries({ queryKey: ['admins'] })
      setEditAdmin(null)
      // Removido: atualização de currentAdmin, pois não temos setCurrentAdmin disponível
    } catch (error) {
      toast.error('Erro ao atualizar o administrador.')
    }
  }, [editAdmin, queryClient])

  const handleInactivateAdmin = useCallback(
    async (idAdministrador: number) => {
      try {
        await inactivateAdmin(idAdministrador)
        toast.success('Administrador inativado com sucesso.')
        queryClient.invalidateQueries({ queryKey: ['admins'] })
      } catch (error) {
        toast.error('Erro ao inativar o administrador.')
      }
    },
    [queryClient],
  )

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, isEditMode = false) => {
      const maskedPhone = maskPhoneNumber(e.target.value)
      if (isEditMode) {
        if (editAdmin) {
          setEditAdmin({ ...editAdmin, telefone: maskedPhone })
        }
      } else {
        setNewAdmin({ ...newAdmin, telefone: maskedPhone })
      }
    },
    [newAdmin, editAdmin],
  )

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, isEditMode = false) => {
      const maskedDate = maskDate(e.target.value)
      if (isEditMode) {
        if (editAdmin) {
          setEditAdmin({ ...editAdmin, dataNascimento: maskedDate })
        }
      } else {
        setNewAdmin({ ...newAdmin, dataNascimento: maskedDate })
      }
    },
    [newAdmin, editAdmin],
  )

  const handleEditAdmin = useCallback((admin: AdminToEdit) => {
    setEditAdmin({
      ...admin,
      telefone: formatPhoneNumber(admin.telefone),
      dataNascimento: formatDateForInput(admin.dataNascimento),
    })
  }, [])

  return (
    <>
      <Header />
      <div className="flex h-screen">
        <Sidebar />
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
                  <Button variant="outline" className="bg-white text-black">
                    Cadastrar Novo Administrador
                  </Button>
                </SheetTrigger>
                <SheetContent>
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
                      onChange={(e) => handlePhoneChange(e, false)}
                      maxLength={15}
                    />
                    <Input
                      placeholder="Data de Nascimento"
                      value={newAdmin.dataNascimento}
                      onChange={(e) => handleDateChange(e, false)}
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

          {editAdmin && (
            <Sheet open={!!editAdmin} onOpenChange={() => setEditAdmin(null)}>
              <SheetContent>
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
                    onChange={(e) => handlePhoneChange(e, true)}
                    maxLength={15}
                  />
                  <Input
                    placeholder="Data de Nascimento"
                    value={editAdmin.dataNascimento}
                    onChange={(e) => handleDateChange(e, true)}
                    type="date"
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
                          onClick={() => handleEditAdmin(admin)}
                          variant="outline"
                          className="mt-4 bg-white text-black"
                        >
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() =>
                            handleInactivateAdmin(admin.idAdministrador)
                          }
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
