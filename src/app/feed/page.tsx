'use client'

import { useState, useEffect } from 'react'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { Heart } from 'lucide-react'
import { toast, Toaster } from 'sonner'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { User } from '@/interface/types'

interface Post {
  idPublicacao: number
  titulo: string
  descricao: string
  dataPublicacao?: string | null
  idCanal: number
  idModalidadeEsportiva?: number | null
  Usuario: {
    idUsuario: number
    username: string
    nome: string
    foto?: string | null
    permissao: string
  }
  listaUsuarioCurtida: any[]
  listaComentario: any[]
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [newPostTitle, setNewPostTitle] = useState('')
  const [newPostContent, setNewPostContent] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loggedUser, setLoggedUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('Erro: Nenhum usuário logado encontrado no localStorage')
        toast.error('Usuário não está logado.')
        router.push('/auth')
        return
      }

      try {
        const decodedToken: any = jwtDecode(token)
        console.log('Token decodificado:', decodedToken)

        const userId = decodedToken.idUsuario || decodedToken.idAcademico
        const userRole =
          decodedToken.role || decodedToken.permissao || 'ACADEMICO'

        const userEndpoint =
          userRole === 'ADMINISTRADOR'
            ? `${process.env.NEXT_PUBLIC_API_URL}/administrador/listar`
            : `${process.env.NEXT_PUBLIC_API_URL}/academico/consultar/${userId}`

        const response = await axios.get(userEndpoint)
        console.log('Dados do usuário carregado:', response.data)
        setLoggedUser(response.data)
      } catch (error: any) {
        console.error('Erro ao carregar dados do usuário logado:', error)
        toast.error('Erro ao carregar dados do usuário. Faça login novamente.')
        router.push('/auth')
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [router])

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/canal/listarCanaisUsuario/1`,
        )
        if (response.data && response.data[0]?.listaPublicacao) {
          setPosts(response.data[0].listaPublicacao)
        }
      } catch (error) {
        console.error('Erro ao carregar os posts:', error)
        toast.error('Erro ao carregar os posts.')
      }
    }

    fetchPosts()
  }, [])

  const cadastrarPublicacao = async (newPost: Post) => {
    try {
      const postData = {
        idPublicacao: 0,
        titulo: newPost.titulo,
        descricao: newPost.descricao,
        dataPublicacao: null, // Pode ser omitido se a API definir automaticamente
        idCanal: newPost.idCanal,
        idModalidadeEsportiva: null, // Ajuste conforme necessário
        Usuario: {
          idUsuario: loggedUser?.idAcademico || loggedUser?.idUsuario,
          username: loggedUser?.username || '',
          nome: loggedUser?.nome || '',
          foto: loggedUser?.foto || null,
          permissao: loggedUser?.permissao || 'ACADEMICO',
        },
      }

      console.log(
        'Dados simplificados a serem enviados:',
        JSON.stringify(postData, null, 2),
      )

      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/publicacao/cadastrarPublicacao`,
        postData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      )

      console.log('Resposta da API:', response.data)
      toast.success('Publicação criada com sucesso!')
      return response.data
    } catch (error: any) {
      if (error.response) {
        console.error('Erro da API:', error.response.data)
        const errorMessage =
          error.response.data.message || 'Falha ao criar publicação.'
        toast.error(`Erro: ${errorMessage}`)
      } else {
        console.error('Erro desconhecido:', error)
        toast.error('Erro desconhecido ao criar publicação.')
      }
      throw error
    }
  }

  const handleOpenDialog = () => setIsDialogOpen(true)
  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setNewPostTitle('')
    setNewPostContent('')
  }

  const handleCreatePost = async () => {
    if (!newPostTitle || !newPostContent) {
      toast.error('Por favor, preencha todos os campos.')
      return
    }

    console.log('loggedUser:', loggedUser)

    if (!loggedUser || !(loggedUser.idAcademico || loggedUser.idUsuario)) {
      toast.error('Usuário não está logado ou inválido.')
      return
    }

    try {
      const newPost: Post = {
        idPublicacao: 0,
        titulo: newPostTitle,
        descricao: newPostContent,
        idCanal: 1, // Ajuste o ID do canal se necessário
        Usuario: {
          idUsuario: loggedUser.idAcademico || loggedUser.idUsuario,
          username: loggedUser.username || '',
          nome: loggedUser.nome || '',
          foto: loggedUser.foto || null,
          permissao: loggedUser.permissao || 'ACADEMICO',
        },
        listaUsuarioCurtida: [],
        listaComentario: [],
      }

      console.log('Dados do post a ser criado:', newPost)

      const createdPost = await cadastrarPublicacao(newPost)
      if (createdPost) {
        setPosts((prevPosts) => [createdPost, ...prevPosts])
        handleCloseDialog()
      }
    } catch (error) {
      console.error('Erro ao criar post:', error)
    }
  }

  const handleLikePost = async (postId: number) => {
    if (loggedUser) {
      try {
        const token = localStorage.getItem('token')
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/publicacao/curtir/${postId}`,
          { idUsuario: loggedUser.idAcademico || loggedUser.idUsuario },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        )
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.idPublicacao === postId
              ? {
                  ...post,
                  listaUsuarioCurtida: [
                    ...post.listaUsuarioCurtida,
                    loggedUser,
                  ],
                }
              : post,
          ),
        )
        toast.success('Publicação curtida!')
      } catch (error) {
        console.error('Erro ao curtir a publicação:', error)
        toast.error('Erro ao curtir a publicação.')
      }
    }
  }

  return (
    <div>
      <Header />
      <Toaster richColors />
      <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 dark:bg-gray-900 p-4 lg:p-6">
        <div className="lg:w-1/4 lg:pr-6">
          <Sidebar />
        </div>
        <div className="lg:w-3/4 space-y-4">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <div className="bg-transparent mb-4">
              <Button onClick={handleOpenDialog}>
                No que você está pensando?
              </Button>
              {isDialogOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-lg space-y-4">
                    <Textarea
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      placeholder="Título do post"
                      rows={1}
                    />
                    <Textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Conteúdo do post"
                      rows={4}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button onClick={handleCloseDialog}>Cancelar</Button>
                      <Button onClick={handleCreatePost}>Publicar</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {posts.map((post) => (
            <div key={post.idPublicacao} className="border-b py-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Image
                    src={post?.Usuario?.foto || '/default-avatar.png'}
                    alt="Avatar"
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                </div>
                <div>
                  <h3>{post.titulo}</h3>
                  <p>{post.descricao}</p>
                  <div className="flex space-x-4 mt-2">
                    <Button onClick={() => handleLikePost(post.idPublicacao)}>
                      <Heart /> Curtir
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
