'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { Heart, MessageCircle } from 'lucide-react'
import { toast, Toaster } from 'sonner'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'

interface Comentario {
  idComentario: number
  descricao: string
  idPublicacao: number
  Usuario: {
    idUsuario: number
    username: string
    nome: string
    foto?: string | null
    permissao: string
  }
}

interface Post {
  idPublicacao: number
  titulo: string
  descricao: string
  dataPublicacao?: string | null
  idCanal: number
  Usuario: {
    idUsuario: number
    username: string
    nome: string
    foto?: string | null
    permissao: string
  }
  listaUsuarioCurtida: number[]
  listaComentario: Comentario[]
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [loggedUser, setLoggedUser] = useState<any>(null)
  const [newPostContent, setNewPostContent] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/publicacao/1/publicacoes?page=0&size=10&sort=dataPublicacao,desc`,
        )
        setPosts(response.data.content || [])
      } catch (error) {
        console.error('Erro ao carregar os posts:', error)
        toast.error('Erro ao carregar os posts.')
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()

    const fetchLoggedUser = () => {
      const token = localStorage.getItem('token')
      if (token) {
        const user = jwtDecode(token)
        setLoggedUser(user)
      }
    }
    fetchLoggedUser()
  }, [])

  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'Data não disponível'
    const formattedDate = new Date(date)
    return formattedDate.toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const handleLikePost = async (postId: number) => {
    if (loggedUser) {
      try {
        const token = localStorage.getItem('token')
        const post = posts.find((post) => post.idPublicacao === postId)
        const usuarioJaCurtiu = post?.listaUsuarioCurtida.includes(
          loggedUser.idUsuario,
        )

        if (usuarioJaCurtiu) {
          // Remover curtida
          await axios.delete(
            `${process.env.NEXT_PUBLIC_API_URL}/publicacao/removerCurtidaPublicacao/${loggedUser.idUsuario}/${postId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          )
          // Atualizar o estado dos posts
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post.idPublicacao === postId
                ? {
                    ...post,
                    listaUsuarioCurtida: post.listaUsuarioCurtida.filter(
                      (idUsuario) => idUsuario !== loggedUser.idUsuario,
                    ),
                  }
                : post,
            ),
          )
        } else {
          // Curtir publicação
          await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/publicacao/curtirPublicacao/${loggedUser.idUsuario}/${postId}`,
            null,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          )
          // Atualizar o estado dos posts
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post.idPublicacao === postId
                ? {
                    ...post,
                    listaUsuarioCurtida: [
                      ...post.listaUsuarioCurtida,
                      loggedUser.idUsuario,
                    ],
                  }
                : post,
            ),
          )
        }
      } catch (error) {
        console.error('Erro ao atualizar a curtida:', error)
        toast.error('Erro ao atualizar a curtida.')
      }
    }
  }

  const handleNewPost = async () => {
    if (newPostContent.trim() === '') return

    const newPost = {
      idPublicacao: 0,
      titulo: newPostContent,
      descricao: newPostContent,
      dataPublicacao: null,
      idCanal: 1,
      idModalidadeEsportiva: null,
      Usuario: {
        idUsuario: loggedUser.idUsuario,
        username: loggedUser.username,
        nome: loggedUser.nome,
        foto: loggedUser.foto || null,
        permissao: loggedUser.permissao,
      },
    }

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/publicacao/cadastrarPublicacao`,
        newPost,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      )

      setPosts([response.data, ...posts])
      setNewPostContent('')
      toast.success('Publicação criada com sucesso!')
    } catch (error) {
      console.error('Erro ao criar novo post:', error)
      toast.error('Erro ao criar novo post.')
    }
  }

  return (
    <>
      <Header />
      <Toaster richColors />
      <div className="flex h-screen bg-gray-100">
        <Sidebar className="flex-none" />
        <div className="container mx-auto p-4 flex-1 overflow-y-auto">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mb-4 w-full py-2 text-xl font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-md">
                Nova Publicação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Publicação</DialogTitle>
              </DialogHeader>
              <Textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="No que você está pensando?"
                className="mt-2 p-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-md"
              />
              <Button
                onClick={handleNewPost}
                className="mt-4 w-full bg-blue-500 text-white hover:bg-blue-600"
              >
                Publicar
              </Button>
            </DialogContent>
          </Dialog>

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Feed de Publicações</h1>
          </div>

          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <Skeleton
                  key={idx}
                  className="h-32 w-full rounded-lg shadow-md"
                />
              ))
            ) : posts.length ? (
              posts.map((post) => (
                <Card
                  key={post.idPublicacao}
                  className="p-4 rounded-lg shadow-lg bg-white dark:bg-gray-800"
                >
                  <CardHeader className="flex items-center space-x-3 pb-2">
                    <img
                      src={
                        post.Usuario.foto || `https://via.placeholder.com/50`
                      }
                      alt="Avatar"
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-base">
                        {post.Usuario.nome}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        @{post.Usuario.username} •{' '}
                        {formatDate(post.dataPublicacao)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="mt-2">
                    <p className="text-md text-gray-800 dark:text-gray-200 mb-2">
                      {post.descricao}
                    </p>
                    <div className="flex items-center justify-start space-x-6 text-gray-600 dark:text-gray-400 mt-2 border-t border-gray-300 pt-2">
                      <button
                        onClick={() => handleLikePost(post.idPublicacao)}
                        className="flex items-center space-x-1 text-sm"
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            post.listaUsuarioCurtida?.includes(
                              loggedUser?.idUsuario,
                            )
                              ? 'text-red-500'
                              : ''
                          }`}
                        />
                        <span>{post.listaUsuarioCurtida?.length || 0}</span>
                      </button>
                      <button className="flex items-center space-x-1 text-sm">
                        <MessageCircle className="w-5 h-5" />
                        <span>{post.listaComentario?.length || 0}</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p>Não há publicações.</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
