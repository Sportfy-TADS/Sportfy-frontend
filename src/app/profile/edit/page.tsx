'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { Loader2 } from 'lucide-react'

import Header from '@/components/Header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { getUserData } from '@/utils/auth'

interface UserData {
  nome: string
  email: string
  username: string
  password: string
  genero: string
  telefone: string
  curso: string
  dataNascimento: string
  foto: string | null
  ativo: boolean
}

export default function EditProfilePage() {
  const { isAuthenticated, isLoading, userId } = useAuth()
  const [userData, setUserData] = useState<UserData>({
    nome: '',
    email: '',
    username: '',
    password: '',
    genero: '',
    telefone: '',
    curso: '',
    dataNascimento: '',
    foto: null,
    ativo: true,
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const loadUserData = async () => {
      console.log('isAuthenticated:', isAuthenticated) // Log para depuração
      console.log('userId:', userId) // Log para depuração

      if (!isAuthenticated || !userId) return

      const token = localStorage.getItem('token')
      console.log('Token:', token) // Log para depuração

      if (!token) {
        router.push('/auth')
        return
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/academico/consultar/${userId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        )
        console.log('Response:', response) // Log para depuração

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token')
            router.push('/auth')
            return
          }
          throw new Error('Falha ao carregar dados')
        }

        const data = await response.json()
        console.log('Dados do usuário:', data) // Log para depuração

        setUserData({
          nome: data.nome || '',
          email: data.email || '',
          username: data.username || '',
          password: '',
          genero: data.genero || '',
          telefone: data.telefone || '',
          curso: data.curso || '',
          dataNascimento: data.dataNascimento
            ? data.dataNascimento.split('T')[0]
            : '',
          foto: data.foto,
          ativo: data.ativo ?? true,
        })
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast({
          title: 'Erro',
          description: 'Erro ao carregar dados do usuário',
        })
      }
    }

    loadUserData()
  }, [isAuthenticated, userId, router, toast])

  const handleUpdate = async () => {
    setIsUpdating(true)
    const authData = await getUserData()
    const token = localStorage.getItem('token')

    console.log('authData:', authData) // Log para depuração
    console.log('Token:', token) // Log para depuração

    if (!authData?.idAcademico || !token) {
      toast({ title: 'Erro', description: 'Usuário não autenticado' })
      setIsUpdating(false)
      return
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/academico/atualizar/${authData.idAcademico}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            curso: userData.curso,
            email: userData.email,
            username: userData.username,
            password: userData.password,
            nome: userData.nome,
            genero: userData.genero,
            telefone: userData.telefone,
            dataNascimento: `${userData.dataNascimento}T00:00:00.000Z`,
            foto: userData.foto,
            ativo: userData.ativo,
          }),
        },
      )

      console.log('Update Response:', response) // Log para depuração

      if (!response.ok) throw new Error('Falha ao atualizar')

      toast({ title: 'Sucesso', description: 'Perfil atualizado com sucesso' })
      router.push('/profile')
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error) // Log para depuração
      toast({ title: 'Erro', description: 'Erro ao atualizar perfil' })
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <Header />
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">Editar Perfil</h1>

          <div className="space-y-4">
            <div className="flex justify-center mb-6">
              <Avatar className="w-32 h-32">
                <AvatarImage src={userData.foto || ''} />
                <AvatarFallback>{userData.nome.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <Input
                  value={userData.nome}
                  onChange={(e) =>
                    setUserData({ ...userData, nome: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  value={userData.email}
                  onChange={(e) =>
                    setUserData({ ...userData, email: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Username
                </label>
                <Input
                  value={userData.username}
                  onChange={(e) =>
                    setUserData({ ...userData, username: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Senha</label>
                <Input
                  type="password"
                  value={userData.password}
                  onChange={(e) =>
                    setUserData({ ...userData, password: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Gênero</label>
                <Select
                  value={userData.genero}
                  onValueChange={(value) =>
                    setUserData({ ...userData, genero: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Telefone
                </label>
                <Input
                  value={userData.telefone}
                  onChange={(e) =>
                    setUserData({ ...userData, telefone: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Curso</label>
                <Input
                  value={userData.curso}
                  onChange={(e) =>
                    setUserData({ ...userData, curso: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Data de Nascimento
                </label>
                <Input
                  type="date"
                  value={userData.dataNascimento}
                  onChange={(e) =>
                    setUserData({ ...userData, dataNascimento: e.target.value })
                  }
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Foto (URL)
                </label>
                <Input
                  value={userData.foto || ''}
                  onChange={(e) =>
                    setUserData({ ...userData, foto: e.target.value })
                  }
                />
              </div>
            </div>

            <Button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="w-full mt-6"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Atualizando...
                </>
              ) : (
                'Atualizar Perfil'
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
