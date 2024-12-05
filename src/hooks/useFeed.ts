import { useState, useEffect } from 'react'
import axios from 'axios'

import { toast } from 'sonner'

import {
  fetchPosts,
  fetchLoggedUser,
  likePost,
  unlikePost,
  createPost,
  fetchComments,
  createComment,
  updateComment,
} from '@/http/feed'
import { Post, DecodedToken, Usuario } from '@/interface/types'
import { jwtDecode } from 'jwt-decode' // Changed from named to default import

export const useFeed = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [newPostContent, setNewPostContent] = useState('')
  const [loggedUser, setLoggedUser] = useState<Usuario | null>(null)
  const [newPostTitle, setNewPostTitle] = useState('')
  const [newPostCanal, setNewPostCanal] = useState('')
  const [newPostModalidadeEsportiva, setNewPostModalidadeEsportiva] =
    useState('')
  const [page, setPage] = useState(0) // Moved page state here
  const [hasMore, setHasMore] = useState(true)

  const fetchLoggedUser = (): Usuario | null => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token) // Usar jwtDecode corretamente
        return {
          idUsuario: decoded.idUsuario,
          username: decoded.sub,
          nome:
            decoded.nome && decoded.nome.trim() !== ''
              ? decoded.nome
              : decoded.sub, // Set 'nome' to 'username' if empty
          permissao: decoded.role || 'ACADEMICO', // Adicionado valor padrão
          idAcademico: decoded.idAcademico || decoded.idUsuario, // Garantir que 'idAcademico' esteja presente
        }
      } catch (error) {
        console.error('Erro ao decodificar o token:', error)
        return null
      }
    }
    return null
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Token não encontrado')
    }

    const loadInitialPosts = async () => {
      try {
        const initialPosts = await fetchPosts(0, 10) // Removed token parameter
        setPosts(initialPosts)
        setPage(0) // Initialize page
      } catch (error) {
        console.error('Erro ao carregar os posts:', error)
        toast.error('Erro ao carregar os posts.')
      } finally {
        setLoading(false)
      }
    }

    loadInitialPosts()
    const user = fetchLoggedUser()
    setLoggedUser(user)

    // Remove the interval to prevent overwriting posts
    // const intervalId = setInterval(() => {
    //   refreshPosts()
    // }, 5000)

    // return () => clearInterval(intervalId)
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
        const usuarioJaCurtiu = post?.listaUsuarioCurtida.some(
          (usuario) => usuario.idUsuario === loggedUser.idUsuario,
        )

        console.log('Handling like for post:', {
          postId,
          userId: loggedUser.idUsuario,
          usuarioJaCurtiu,
        })

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
                        idAcademico:
                          loggedUser.idAcademico || loggedUser.idUsuario,
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

  const handleNewPost = async (newPost: Post) => {
    try {
      console.log('Creating new post:', newPost)
      const createdPost = await createPost(newPost)

      if (!createdPost) {
        throw new Error('Não foi possível criar a publicação')
      }

      setPosts((prevPosts) => [createdPost, ...prevPosts])
      setNewPostTitle('')
      setNewPostContent('')
      return createdPost
    } catch (error) {
      console.error('Error in handleNewPost:', error)
      throw error
    }
  }

  const handleEditPost = async (postId: number) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Token não encontrado')
      }

      const post = posts.find((p) => p.idPublicacao === postId)
      if (!post) {
        throw new Error('Post não encontrado')
      }

      const updatedPost = {
        titulo: newPostTitle,
        descricao: newPostContent,
        idCanal: post.idCanal,
        idModalidadeEsportiva: post.idModalidadeEsportiva,
        Usuario: {
          idUsuario: loggedUser?.idUsuario,
          username: loggedUser?.username,
          nome: loggedUser?.nome,
          foto: loggedUser?.foto || null,
          permissao: loggedUser?.permissao,
          idAcademico: loggedUser?.idAcademico || loggedUser?.idUsuario,
        },
        listaUsuarioCurtida: post.listaUsuarioCurtida,
        listaComentario: post.listaComentario,
      }

      const result = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/publicacao/atualizarPublicacao/${postId}`,
        updatedPost,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      )

      toast.success('Publicação atualizada com sucesso!')

      // Update the post in the posts list
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.idPublicacao === postId ? { ...post, ...result.data } : post,
        ),
      )

      setEditingPost(null)
      setNewPostTitle('')
      setNewPostContent('')
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
        const newComment = {
          idComentario: 0,
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
        }

        const createdComment = await createComment(newComment) // Removed token parameter
        toast.success('Comentário criado com sucesso!')

        // Atualizar os comentários localmente garantindo que listaComentario seja um array
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.idPublicacao === postId
              ? {
                  ...post,
                  listaComentario: [
                    createdComment,
                    ...(post.listaComentario || []),
                  ],
                }
              : post,
          ),
        )

        return createdComment // Retornar o comentário criado
      } catch (error) {
        console.error('Error creating comment:', error)
        toast.error('Erro ao criar comentário.')
        throw error
      }
    }
  }

  const handleUpdateComment = async (
    commentId: number,
    descricao: string,
    idPublicacao: number,
    dataComentario: Date,
  ) => {
    if (loggedUser) {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('Token not found')
        }

        const updatedComment = {
          idComentario: commentId,
          descricao: descricao,
          dataComentario: dataComentario,
          idPublicacao: idPublicacao,
          Usuario: {
            idUsuario: loggedUser.idUsuario,
            username: loggedUser.username,
            nome: loggedUser.nome,
            foto: loggedUser.foto || null,
            permissao: loggedUser.permissao,
          },
          listaUsuarioCurtida: [],
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
                          ? {
                              ...comment,
                              descricao: result.descricao,
                              dataComentario: result.dataComentario,
                            }
                          : comment,
                      )
                    : [],
                }
              : post,
          ),
        )

        return result // Retornar o comentário atualizado
      } catch (error) {
        console.error('Error updating comment:', error)
        toast.error('Erro ao atualizar comentário.')
        throw error
      }
    }
  }

  const appendPosts = (newPosts: Post[]) => {
    setPosts((prevPosts) => [...prevPosts, ...newPosts])
  }

  const loadMore = async () => {
    const nextPage = page + 1
    try {
      const morePosts = await fetchPosts(nextPage, 10) // Removed token parameter
      if (morePosts.length === 0) {
        setHasMore(false)
      } else {
        appendPosts(morePosts)
        setPage(nextPage)
      }
    } catch (error) {
      console.error('Erro ao carregar mais posts:', error)
      toast.error('Erro ao carregar mais posts.')
    }
  }

  return {
    posts,
    loading,
    newPostContent,
    setNewPostContent,
    formatDate,
    handleLikePost,
    handleNewPost, // Updated
    newPostTitle,
    setNewPostTitle,
    newPostCanal,
    setNewPostCanal,
    newPostModalidadeEsportiva,
    setNewPostModalidadeEsportiva,
    handleEditPost, // Updated
    fetchCommentsForPost,
    handleCreateComment, // Adicionado
    handleUpdateComment, // Adicionado
    loggedUser, // Adicionado
    appendPosts, // Add this
    loadMore, // Expose loadMore
    hasMore, // Expose hasMore
  }
}
