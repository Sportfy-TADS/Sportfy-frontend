'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { toast, Toaster } from 'sonner'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
// Importar componentes do diálogo

interface Comentario {
  idComentario: number
  descricao: string
  dataComentario?: string | null
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
  idModalidadeEsportiva?: number | null
  Usuario: {
    idUsuario: number
    username: string
    nome: string
    foto?: string | null
    permissao: string
  }
  listaUsuarioCurtida: number[] // IDs dos usuários que curtiram
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
        if (response.data && response.data.content) {
          setPosts(response.data.content)
        }
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
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
            `${process.env.NEXT_PUBLIC_API_URL}/publicacao/removerCurtidaPublicacao/${postId}/${loggedUser.idUsuario}`,
            {
              headers: {
                'Content-Type': 'application/json',
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
            `${process.env.NEXT_PUBLIC_API_URL}/publicacao/curtirPublicacao/${postId}/${loggedUser.idUsuario}`,
            null,
            {
              headers: {
                'Content-Type': 'application/json',
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

  const handleAddComment = async (postId: number) => {
    if (loggedUser) {
      try {
        const token = localStorage.getItem('token')
        const commentData = {
          descricao: comment,
          idPublicacao: postId,
          Usuario: {
            idUsuario: loggedUser.idUsuario,
            username: loggedUser.username,
            nome: loggedUser.nome,
            foto: loggedUser.foto,
            permissao: loggedUser.permissao,
          },
        }
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/comentario/cadastrarComentario`,
          commentData,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        )
        toast.success('Comentário cadastrado com sucesso!')
        setComment('')
        // Atualizar a lista de comentários do post
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.idPublicacao === postId
              ? {
                  ...post,
                  listaComentario: [...post.listaComentario, response.data],
                }
              : post,
          ),
        )
      } catch (error) {
        console.error('Erro ao cadastrar o comentário:', error)
        toast.error('Erro ao cadastrar o comentário.')
      }
    }
  }

  const cadastrarPublicacao = async (newPost: Post) => {
    try {
      const postData = {
        titulo: newPost.titulo,
        descricao: newPost.descricao,
        idCanal: newPost.idCanal,
      }

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

      toast.success('Publicação criada com sucesso!')
      return response.data
    } catch (error: any) {
      const errorMessage =
        error.response?.data.message || 'Falha ao criar publicação.'
      toast.error(`Erro: ${errorMessage}`)
      throw error
    }
  }

  const handleNewPost = async () => {
    if (newPostContent.trim() === '') return

    const newPost = {
      titulo: newPostContent,
      descricao: newPostContent,
      idCanal: 1, // substitua pelo ID apropriado
    }

    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/publicacao/cadastrarPublicacao`,
        newPost,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      )

      // Atualizar a lista de posts
      setPosts([newPost, ...posts])
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
      <div className="flex h-screen">
        <Sidebar className="flex-none" />
        <div className="container mx-auto p-4 flex-1 overflow-y-auto">
          {/* Botão para abrir o diálogo de nova publicação */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mb-4">Nova Publicação</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Publicação</DialogTitle>
                <DialogDescription>
                  Compartilhe algo com seus amigos
                </DialogDescription>
              </DialogHeader>
              <Textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="No que você está pensando?"
              />
              <Button onClick={handleNewPost} className="mt-2">
                Publicar
              </Button>
            </DialogContent>
          </Dialog>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Feed de Publicações</h1>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {loading ? (
              <>
                <Skeleton />
                <Skeleton />
                <Skeleton />
              </>
            ) : posts.length ? (
              posts.map((post) => (
                <Card key={post.idPublicacao}>
                  <CardHeader>
                    <CardTitle>{post.titulo}</CardTitle>
                    <p className="text-sm text-gray-500">
                      Publicado em: {formatDate(post.dataPublicacao)}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p>{post.descricao}</p>
                    {/* Botões de interação e outros conteúdos */}
                    <button onClick={() => handleLikePost(post.idPublicacao)}>
                      {post.listaUsuarioCurtida.includes(loggedUser?.idUsuario)
                        ? 'Remover Curtida'
                        : 'Curtir'}
                    </button>
                    <p>{post.listaUsuarioCurtida.length} curtidas</p>
                    {post.listaComentario && post.listaComentario.length > 0 ? (
                      post.listaComentario.map((comentario) => (
                        <div key={comentario.idComentario}>
                          <p>
                            <strong>{comentario.Usuario.nome}:</strong>{' '}
                            {comentario.descricao}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p>Não há comentários.</p>
                    )}
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Digite seu comentário"
                    />
                    <button onClick={() => handleAddComment(post.idPublicacao)}>
                      Comentar
                    </button>
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
