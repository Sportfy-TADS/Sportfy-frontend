'use client'

import { useState, useEffect } from 'react'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { jwtDecode } from 'jwt-decode'

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
  Usuario: {
    idUsuario: number
    username: string
    foto: string | null
  }
  listaUsuarioCurtida: {
    idUsuario: number
    username: string
    nome: string
    foto: string | null
    permissao: string
  }[]
  listaComentario: {
    idComentario: number
    descricao: string
    dataComentario: string
    Usuario: {
      idUsuario: number
      username: string
      nome: string
      foto: string | null
      permissao: string
    }
    listaUsuarioCurtida: {
      idUsuario: number
      username: string
      nome: string
      foto: string | null
      permissao: string
    }[]
  }[]
  dataPublicacao: string
}

export default function FeedPage() {
  const [canal, setCanal] = useState<Post[]>([])
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
        router.push('/auth')
        return
      }

      const decoded: User = jwtDecode(token)
      setLoggedUser(decoded)

      const userId = decoded.idUsuario
      let userEndpoint = ''

      if (decoded.role === 'ADMINISTRADOR') {
        userEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/administrador/listar`
      } else if (decoded.role === 'ACADEMICO') {
        userEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/academico/consultar/${userId}`
      }

      try {
        const response = await fetch(userEndpoint)
        if (response.ok) {
          const userData = await response.json()
          setLoggedUser(userData)
        } else {
          console.error(
            'Falha ao buscar os dados do usuário:',
            response.statusText,
          )
          router.push('/auth')
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário logado:', error)
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
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/canal/listarCanaisUsuario/1`,
        )
        if (response.ok) {
          const data = await response.json()
          // Verifica se `data` é um array de canais
          if (Array.isArray(data) && data.length > 0) {
            const canalData = data[0] // Supondo que você queira o primeiro canal
            if (Array.isArray(canalData.listaPublicacao)) {
              setCanal(canalData.listaPublicacao)
            } else {
              console.error('Estrutura de resposta inesperada:', data)
            }
          } else {
            console.error('Estrutura de resposta inesperada:', data)
          }
        } else {
          console.error('Falha ao buscar os posts:', response.statusText)
        }
      } catch (error) {
        console.error('Erro ao carregar os posts:', error)
      }
    }

    fetchPosts()
  }, [])

  const handleOpenDialog = () => {
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setNewPostTitle('')
    setNewPostContent('')
  }

  const handleCreatePost = async () => {
    if (!newPostTitle || !newPostContent) {
      alert('Por favor, preencha todos os campos.')
      return
    }

    const newPost = {
      titulo: newPostTitle,
      descricao: newPostContent,
      idCanal: 1, // Supondo que o idCanal seja 1
      Usuario: loggedUser,
      dataPublicacao: new Date().toISOString(),
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/canal/publicar`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newPost),
        },
      )

      if (response.ok) {
        const createdPost = await response.json()
        setCanal((prevPosts) => [createdPost, ...prevPosts])
        handleCloseDialog()
      } else {
        console.error('Falha ao criar o post:', response.statusText)
      }
    } catch (error) {
      console.error('Erro ao criar o post:', error)
    }
  }

  const handleLikePost = (postId: number) => {
    // Lógica para curtir o post
    console.log('Post curtido:', postId)
  }

  const handleCommentPost = (postId: number) => {
    // Lógica para comentar no post
    console.log('Comentário no post:', postId)
  }

  return (
    <div>
      <Header />
      <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 dark:bg-gray-900 p-4 lg:p-6">
        <div className="lg:w-1/4 lg:pr-6">
          <Sidebar />
        </div>

        <div className="lg:w-3/4 space-y-4">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full bg-blue-500" />
            </div>
          ) : (
            <div className="bg-transparent mb-4">
              <Button
                className="w-full bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-300"
                onClick={handleOpenDialog}
              >
                No que você está pensando?
              </Button>

              {isDialogOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-lg space-y-4">
                    <h3 className="text-lg font-semibold">Criar Post</h3>
                    <Textarea
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      placeholder="Título do post"
                      className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg"
                      rows={1}
                    />
                    <Textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Conteúdo do post"
                      className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg"
                      rows={4}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        className="bg-gray-300 dark:bg-gray-700"
                        onClick={handleCloseDialog}
                      >
                        Cancelar
                      </Button>
                      <Button
                        className="bg-blue-500 text-white"
                        onClick={handleCreatePost}
                      >
                        Publicar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {loading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="border-b border-gray-300 dark:border-gray-700 py-4 space-y-2"
                >
                  <div className="flex items-center space-x-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                </div>
              ))
            : canal?.map((post) => (
                <div
                  key={post.idPublicacao}
                  className="border-b border-gray-300 dark:border-gray-700 py-4"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <Image
                        src={post?.Usuario?.foto || '/default-avatar.png'} // Use uma imagem padrão se a foto do usuário for nula
                        alt="Avatar"
                        width={50}
                        height={50}
                        className="w-12 h-12 rounded-full"
                      />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-bold">
                          {post?.Usuario?.username || 'Usuário Desconhecido'}
                        </span>{' '}
                        •{' '}
                        {post.dataPublicacao
                          ? new Date(post.dataPublicacao).toLocaleDateString()
                          : 'Data Desconhecida'}
                      </div>
                      <h3 className="font-semibold mt-2">{post.titulo}</h3>
                      <p className="text-gray-800 dark:text-gray-200 mt-2">
                        {post.descricao}
                      </p>
                      <div className="flex space-x-4 mt-2">
                        <Button
                          className="bg-blue-500 text-white"
                          onClick={() => handleLikePost(post.idPublicacao)}
                        >
                          Curtir
                        </Button>
                        <Button
                          className="bg-gray-300 dark:bg-gray-700"
                          onClick={() => handleCommentPost(post.idPublicacao)}
                        >
                          Comentar
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
