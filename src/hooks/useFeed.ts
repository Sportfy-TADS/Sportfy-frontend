import { useState, useEffect } from 'react'
import axios from 'axios'

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
  const [newPostTitle, setNewPostTitle] = useState('')
  const [newPostCanal, setNewPostCanal] = useState('')
  const [newPostModalidadeEsportiva, setNewPostModalidadeEsportiva] = useState('')

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
        const post = posts.find((post) => post.idPublicacao === postId)
        const usuarioJaCurtiu = post?.listaUsuarioCurtida.includes(loggedUser.idUsuario)

        console.log('Handling like for post:', { postId, userId: loggedUser.idUsuario, usuarioJaCurtiu })

        if (usuarioJaCurtiu) {
          await unlikePost(loggedUser.idUsuario, postId)
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
          await likePost(loggedUser.idUsuario, postId)
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

  const refreshPosts = async () => {
    try {
      const posts = await fetchPosts()
      setPosts(posts)
    } catch (error) {
      console.error('Erro ao carregar os posts:', error)
      toast.error('Erro ao carregar os posts.')
    }
  }

  const handleNewPost = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Token not found')
      }

      const decodedToken = JSON.parse(atob(token.split('.')[1]))
      const userId = decodedToken.idUsuario

      const payload = {
        idPublicacao: 0,
        titulo: newPostTitle,
        descricao: newPostContent,
        dataPublicacao: null,
        idCanal: 1,
        idModalidadeEsportiva: null,
        Usuario: {
          idUsuario: userId,
          username: loggedUser.username,
          nome: loggedUser.nome,
          foto: loggedUser.foto,
          permissao: loggedUser.permissao,
        },
      }
      await axios.post('http://localhost:8081/publicacao/cadastrarPublicacao', payload)
      toast.success('Publicação criada com sucesso!')
      refreshPosts()
    } catch (error) {
      console.error('Error creating new post:', error)
      toast.error('Erro ao criar a publicação.')
    }
  }

  const handleEditPost = async (postId: number) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Token not found')
      }

      const decodedToken = JSON.parse(atob(token.split('.')[1]))
      const userId = decodedToken.idUsuario

      const payload = {
        idPublicacao: postId,
        titulo: newPostTitle,
        descricao: newPostContent,
        dataPublicacao: null,
        idCanal: 1,
        idModalidadeEsportiva: null,
        Usuario: {
          idUsuario: userId,
          username: loggedUser.username,
          nome: loggedUser.nome,
          foto: loggedUser.foto,
          permissao: loggedUser.permissao,
        },
      }
      await axios.put(`http://localhost:8081/publicacao/atualizarPublicacao/${postId}`, payload)
      toast.success('Publicação atualizada com sucesso!')
      refreshPosts()
    } catch (error) {
      console.error('Error updating post:', error)
      toast.error('Erro ao atualizar a publicação.')
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
    newPostTitle,
    setNewPostTitle,
    newPostCanal,
    setNewPostCanal,
    newPostModalidadeEsportiva,
    setNewPostModalidadeEsportiva,
    handleEditPost,
    refreshPosts,
  }
}
