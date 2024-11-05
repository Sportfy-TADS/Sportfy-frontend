'use client'

import { useState, useEffect, useRef } from 'react'

import { useRouter } from 'next/navigation'

import { UploadCloud, Loader2 } from 'lucide-react' // Importação dos ícones

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

export default function EditProfilePage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [gender, setGender] = useState('')
  const [phone, setPhone] = useState('')
  const [course, setCourse] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [profileImage, setProfileImage] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      const academicoId = localStorage.getItem('academicoId')
      if (!academicoId) {
        toast({
          title: 'Erro',
          description:
            'Usuário não autenticado. Redirecionando para a página de autenticação.',
          variant: 'destructive',
        })
        router.push('/auth')
        return
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/academico/consultar/${academicoId}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          },
        )

        if (!res.ok) {
          throw new Error('Erro ao buscar dados do usuário.')
        }

        const user = await res.json()
        console.log('Dados do Usuário:', user)

        setName(user.nome || '')
        setEmail(user.email || '')
        // Não é recomendado armazenar senhas no frontend. Considere remover este campo.
        setPassword('')
        setGender(user.genero || '')
        setPhone(user.telefone || '')
        setCourse(user.curso || '')
        setBirthDate(
          user.dataNascimento ? user.dataNascimento.slice(0, 10) : '',
        )
        setProfileImage(user.foto || '')
      } catch (error: any) {
        console.error('Erro ao buscar dados do usuário:', error)
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao carregar os dados do usuário.',
          variant: 'destructive',
        })
      }
    }

    fetchUserData()
  }, [router, toast])

  const handleImageUpload = async (file: File) => {
    const cloudName = 'SEU_CLOUD_NAME' // Substitua pelo seu cloud name
    const uploadPreset = 'SEU_UPLOAD_PRESET' // Substitua pelo seu upload preset

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', uploadPreset)

    try {
      setIsUploading(true)
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        },
      )

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(
          errorData.error.message || 'Erro ao fazer upload da imagem.',
        )
      }

      const data = await res.json()
      console.log('Imagem Uploadada:', data)
      return data.secure_url as string
    } catch (error: any) {
      console.error('Erro no upload da imagem:', error)
      throw new Error(error.message || 'Erro ao fazer upload da imagem.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const uploadedImageUrl = await handleImageUpload(file)
      setProfileImage(uploadedImageUrl)
      toast({
        title: 'Sucesso',
        description: 'Imagem de perfil atualizada!',
        variant: 'default',
      })
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar a imagem de perfil.',
        variant: 'destructive',
      })
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleUpdate = async () => {
    const academicoId = localStorage.getItem('academicoId')
    if (!academicoId) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado.',
        variant: 'destructive',
      })
      router.push('/auth')
      return
    }

    const formattedBirthDate = birthDate ? `${birthDate}T00:00:00-03:00` : null
    const validUsername = name.replace(/\s+/g, '_')

    const updatedUserData = {
      idAcademico: parseInt(academicoId, 10),
      curso: course || 'N/A',
      email,
      username: validUsername,
      password, // Considere tratar a atualização de senha separadamente por questões de segurança
      nome: name,
      genero: gender || 'outros',
      telefone: phone || '',
      dataNascimento: formattedBirthDate,
      foto: profileImage || null,
      ativo: true,
    }

    console.log('Dados Atualizados para Enviar:', updatedUserData)

    try {
      setIsUpdating(true)
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/academico/atualizar/${academicoId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedUserData),
        },
      )

      const responseContentType = res.headers.get('Content-Type')
      let responseData: any

      if (
        responseContentType &&
        responseContentType.includes('application/json')
      ) {
        responseData = await res.json()
      } else {
        responseData = await res.text()
      }

      console.log('Resposta do Servidor:', responseData)

      if (res.ok) {
        toast({
          title: 'Sucesso',
          description: 'Perfil atualizado com sucesso!',
          variant: 'default',
        })
        router.push('/profile')
      } else {
        toast({
          title: 'Erro',
          description: `Erro ${res.status}: ${responseData}`,
          variant: 'destructive',
        })
      }
    } catch (error: any) {
      console.error('Erro na Requisição de Atualização:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar o perfil.',
        variant: 'destructive',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Seção de Perfil */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-32 h-32 rounded-full">
                {profileImage ? (
                  <AvatarImage src={profileImage} alt="Profile Image" />
                ) : (
                  <AvatarFallback>
                    {name.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                )}
              </Avatar>
              <Button
                variant="ghost"
                size="icon"
                className="absolute bottom-0 right-0 bg-white shadow-md rounded-full"
                onClick={triggerFileSelect}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <UploadCloud className="h-5 w-5" />
                )}
              </Button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <h2 className="text-lg font-semibold text-black dark:text-white">
              {name}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{email}</p>
          </div>

          {/* Seção de Formulário */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-md shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">
                Editar Informações
              </h2>

              {/* Campos Nome e Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-black dark:text-white">
                    Nome
                  </label>
                  <Input
                    type="text"
                    className="w-full p-2 text-black dark:text-white"
                    placeholder="Nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-black dark:text-white">
                    Email
                  </label>
                  <Input
                    type="email"
                    className="w-full p-2 text-black dark:text-white"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Campos Senha e Gênero */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-black dark:text-white">
                    Senha
                  </label>
                  <Input
                    type="password"
                    className="w-full p-2 text-black dark:text-white"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-black dark:text-white">
                    Gênero
                  </label>
                  <Select onValueChange={setGender} value={gender}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Escolha um gênero" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Campos Telefone e Curso */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-black dark:text-white">
                    Telefone
                  </label>
                  <Input
                    type="text"
                    className="w-full p-2 text-black dark:text-white"
                    placeholder="Telefone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-black dark:text-white">
                    Curso
                  </label>
                  <Input
                    type="text"
                    className="w-full p-2 text-black dark:text-white"
                    placeholder="Curso"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                  />
                </div>
              </div>

              {/* Campo Data de Nascimento */}
              <div className="mt-4">
                <label className="block text-sm font-semibold mb-2 text-black dark:text-white">
                  Data de Nascimento
                </label>
                <Input
                  type="date"
                  className="w-full p-2 text-black dark:text-white"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>

              {/* Botão Atualizar Perfil */}
              <Button
                onClick={handleUpdate}
                className="mt-4"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Atualizar Perfil'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
