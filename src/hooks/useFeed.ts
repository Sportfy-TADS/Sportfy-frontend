import { useState, useEffect } from 'react'

import { toast } from 'sonner'

import {
  fetchPosts,
  fetchLoggedUser,
  likePost,
  unlikePost,
  createPost,
} from '@/http/feed'
import { Post } from '@/interface/types'

export const useFeed = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [newPostContent, setNewPostContent] = useState('')
  const [loggedUser, setLoggedUser] = useState<any>(null)

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const posts = await fetchPosts()
        setPosts(posts)
      } catch (error) {
        console.error('Erro ao carregar os posts:', error)
        toast.error('Erro ao carregar os posts.')
      } finally {
        setLoading(false)
      }
    }
    loadPosts()

    const user = fetchLoggedUser()
    setLoggedUser(user)
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
          await unlikePost(loggedUser.idUsuario, postId, token)
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
          await likePost(loggedUser.idUsuario, postId, token)
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
      const createdPost = await createPost(newPost, token)
      setPosts([createdPost, ...posts])
      setNewPostContent('')
      toast.success('Publicação criada com sucesso!')
    } catch (error) {
      console.error('Erro ao criar novo post:', error)
      toast.error('Erro ao criar novo post.')
    }
  }

  return {
    posts,
    loading,
    newPostContent,
    setNewPostContent,
    formatDate,
    handleLikePost,
    handleNewPost,
  }
}
