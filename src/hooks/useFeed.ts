import { useState, useEffect } from 'react'
import axios from 'axios'

import { toast } from 'sonner'

import {
  fetchPosts,
  fetchLoggedUser as fetchLoggedUserFromAPI,
  likePost,
  unlikePost,
  createPost,
  fetchComments,
  createComment,
  updateComment,
} from '@/http/feed'
import { Post, DecodedToken, Usuario } from '@/interface/types'
import {jwtDecode} from 'jwt-decode' // Importação correta

export const useFeed = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [newPostContent, setNewPostContent] = useState('')
  const [loggedUser, setLoggedUser] = useState<Usuario | null>(null)
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

    const intervalId = setInterval(() => {
      refreshPosts()
    }, 5000)

    return () => clearInterval(intervalId)
  }, [])

  const fetchLoggedUser = (): Usuario | null => { // Atualizado para retornar Usuario
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token) // Usar jwtDecode corretamente
        return {
          idUsuario: decoded.idUsuario,
          username: decoded.sub,
          nome: decoded.nome || '', // Garantir que 'nome' esteja presente
          permissao: decoded.role,
          idAcademico: decoded.idAcademico || decoded.idUsuario, // Garantir que 'idAcademico' esteja presente
        }
      } catch (error) {
        console.error('Erro ao decodificar o token:', error)
        return null
      }
    }
    return null
  }

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
        const usuarioJaCurtiu = post?.listaUsuarioCurtida.some(
          (usuario) => usuario.idUsuario === loggedUser.idUsuario
        )

        console.log('Handling like for post:', { postId, userId: loggedUser.idUsuario, usuarioJaCurtiu })

        if (usuarioJaCurtiu) {
          await unlikePost(loggedUser.idUsuario, postId)
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post.idPublicacao === postId
                ? {
                    ...post,
                    listaUsuarioCurtida: post.listaUsuarioCurtida.filter(
                      (usuario) => usuario.idUsuario !== loggedUser.idUsuario,
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
                      {
                        idUsuario: loggedUser.idUsuario,
                        username: loggedUser.username,
                        nome: loggedUser.nome,
                        foto: loggedUser.foto,
                        permissao: loggedUser.permissao,
                      },
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
        listaUsuarioCurtida: [], // Inicializar como vazio
        listaComentario: [], // Inicializar como vazio
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

      const post = posts.find((p) => p.idPublicacao === postId)
      if (!post) {
        throw new Error('Post não encontrado')
      }

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
        listaUsuarioCurtida: post.listaUsuarioCurtida, // Preservar curtidas existentes
        listaComentario: post.listaComentario, // Preservar comentários existentes
      }
      await axios.put(`http://localhost:8081/publicacao/atualizarPublicacao/${postId}`, payload)
      toast.success('Publicação atualizada com sucesso!')
      refreshPosts()
    } catch (error) {
      console.error('Error updating post:', error)
      toast.error('Erro ao atualizar a publicação.')
    }
  }

  const fetchCommentsForPost = async (postId: number) => {
    try {
      const comments = await fetchComments(postId)
      return comments
    } catch (error) {
      console.error('Erro ao carregar os comentários:', error)
      toast.error('Erro ao carregar os comentários.')
      return []
    }
  }

  const handleCreateComment = async (postId: number, descricao: string) => {
    if (loggedUser) {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('Token not found')
        }

        const newComment = {
          idComentario: Date.now(), // Temporário até receber do backend
          descricao,
          dataComentario: new Date().toISOString(),
          idPublicacao: postId,
          Usuario: {
            idUsuario: loggedUser.idUsuario,
            username: loggedUser.username,
            nome: loggedUser.nome,
            foto: loggedUser.foto || null,
            permissao: loggedUser.permissao,
          },
          listaUsuarioCurtida: [],
          listaComentarios: [],
        }

        const createdComment = await createComment(newComment, token)
        toast.success('Comentário criado com sucesso!')

        // Atualizar os comentários localmente garantindo que listaComentario seja um array
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.idPublicacao === postId
              ? {
                  ...post,
                  listaComentario: [createdComment, ...(post.listaComentario || [])],
                }
              : post
          )
        )

        return createdComment // Retornar o comentário criado
      } catch (error) {
        console.error('Error creating comment:', error)
        toast.error('Erro ao criar comentário.')
        throw error
      }
    }
  }

  const handleUpdateComment = async (commentId: number, descricao: string, idPublicacao: number) => {
    if (loggedUser) {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('Token not found')
        }

        const updatedComment = {
          descricao,
          dataComentario: new Date().toISOString(),
        }

        const result = await updateComment(commentId, updatedComment, token)
        toast.success('Comentário atualizado com sucesso!')

        // Atualizar o comentário localmente garantindo que listaComentario seja um array
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.idPublicacao === idPublicacao
              ? {
                  ...post,
                  listaComentario: post.listaComentario
                    ? post.listaComentario.map((comment) =>
                        comment.idComentario === commentId
                          ? { ...comment, descricao: result.descricao, dataComentario: result.dataComentario }
                          : comment
                      )
                    : [],
                }
              : post
          )
        )

        return result // Retornar o comentário atualizado
      } catch (error) {
        console.error('Error updating comment:', error)
        toast.error('Erro ao atualizar comentário.')
        throw error
      }
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
    fetchCommentsForPost,
    handleCreateComment, // Adicionado
    handleUpdateComment, // Adicionado
    loggedUser, // Adicionado
  }
}
