'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { UploadCloud, Loader2 } from 'lucide-react'
import { getUserData } from '@/utils/auth'
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
    ativo: true
  })
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const loadUserData = async () => {
      const authData = getUserData()
      if (!authData?.idAcademico) {
        toast({ title: 'Erro', description: 'Usuário não autenticado' })
        router.push('/auth')
        return
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/academico/${authData.idAcademico}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        if (!response.ok) throw new Error('Falha ao carregar dados')
        const data = await response.json()
        setUserData(data)
      } catch (error) {
        toast({ title: 'Erro', description: 'Erro ao carregar dados do usuário' })
      }
    }

    loadUserData()
  }, [router, toast])

  const handleUpdate = async () => {
    setIsLoading(true)
    const authData = getUserData()

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/academico/atualizar/${authData?.idAcademico}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(userData)
      })

      if (!response.ok) throw new Error('Falha ao atualizar')
      
      toast({ title: 'Sucesso', description: 'Perfil atualizado com sucesso' })
      router.push('/profile')
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao atualizar perfil' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
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
                  onChange={e => setUserData({...userData, nome: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  value={userData.email}
                  onChange={e => setUserData({...userData, email: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <Input
                  value={userData.username}
                  onChange={e => setUserData({...userData, username: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Senha</label>
                <Input
                  type="password"
                  value={userData.password}
                  onChange={e => setUserData({...userData, password: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Gênero</label>
                <Select
                  value={userData.genero}
                  onValueChange={value => setUserData({...userData, genero: value})}
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
                <label className="block text-sm font-medium mb-1">Telefone</label>
                <Input
                  value={userData.telefone}
                  onChange={e => setUserData({...userData, telefone: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Curso</label>
                <Input
                  value={userData.curso}
                  onChange={e => setUserData({...userData, curso: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Data de Nascimento</label>
                <Input
                  type="date"
                  value={userData.dataNascimento.split('T')[0]}
                  onChange={e => setUserData({...userData, dataNascimento: e.target.value})}
                />
              </div>
            </div>

            <Button
              onClick={handleUpdate}
              disabled={isLoading}
              className="w-full mt-6"
            >
              {isLoading ? (
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