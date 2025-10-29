import { useEffect, useState } from 'react';

import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Changed from named to default import
import { toast } from 'sonner';

import {
  createComment,
  createPost,
  fetchComments,
  fetchPosts,
  // fetchLoggedUser, // Removido
  likePost,
  unlikePost,
  updateComment
} from '@/http/feed';
import { DecodedToken, Post, Usuario } from '@/interface/types';

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

  const getLoggedUser = (): Usuario | null => {
    // Renomeado para evitar conflito
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

  const loadCommentsCount = async (posts: Post[]) => {
    try {
      console.log('🔢 Carregando contagens de comentários para', posts.length, 'posts')
      
      const postsWithCounts = await Promise.all(
        posts.map(async (post) => {
          try {
            const comments = await fetchComments(post.idPublicacao)
            return {
              ...post,
              listaComentario: comments || [],
            }
          } catch (error) {
            console.error('Erro ao buscar comentários para post', post.idPublicacao, ':', error)
            return {
              ...post,
              listaComentario: [],
            }
          }
        })
      )
      
      console.log('✅ Comentários carregados:', postsWithCounts.map(p => ({
        id: p.idPublicacao,
        titulo: p.titulo,
        comentarios: p.listaComentario.length
      })))
      
      return postsWithCounts
    } catch (error) {
      console.error('Erro ao carregar comentários:', error)
      return posts
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      console.warn('⚠️ Token não encontrado no localStorage')
      throw new Error('Token não encontrado')
    }

    const loadInitialPosts = async () => {
      try {
        const initialPosts = await fetchPosts(0, 10) // Removed token parameter
        
        // Normalizar posts para garantir que listaComentario sempre seja um array
        const normalizedPosts = initialPosts.map((post: Post) => ({
          ...post,
          listaComentario: post.listaComentario || [],
          listaUsuarioCurtida: post.listaUsuarioCurtida || [],
        }))
        
        console.log('📋 Posts carregados (antes das contagens):', {
          total: normalizedPosts.length,
          primeiroPost: normalizedPosts[0] ? {
            titulo: normalizedPosts[0].titulo,
            comentarios: normalizedPosts[0].listaComentario.length,
            curtidas: normalizedPosts[0].listaUsuarioCurtida.length,
          } : null
        })
        
        // Carregar contagens reais de comentários
        const postsWithCommentCounts = await loadCommentsCount(normalizedPosts)
        
        setPosts(postsWithCommentCounts)
        setPage(0) // Initialize page
      } catch (error) {
        console.error('Erro ao carregar os posts:', error)
        toast.error('Erro ao carregar os posts.')
      } finally {
        setLoading(false)
      }
    }

    loadInitialPosts()
    const user = getLoggedUser() // Usar a função renomeada
    console.log('👤 Usuário logado:', user) // Log do usuário
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
      
      // Estrutura correta para enviar para a API
      const postData = {
        titulo: newPost.titulo,
        descricao: newPost.descricao,
        idCanal: newPost.idCanal,
        idModalidadeEsportiva: newPost.idModalidadeEsportiva,
        Usuario: {
          idUsuario: newPost.Usuario.idUsuario,
          username: newPost.Usuario.username,
          nome: newPost.Usuario.nome,
          foto: newPost.Usuario.foto,
          permissao: newPost.Usuario.permissao,
          idAcademico: newPost.Usuario.idAcademico,
        },
      }
      
      const createdPost = await createPost(postData)

      if (!createdPost) {
        throw new Error('Não foi possível criar a publicação')
      }

      // Normalizar o post criado para garantir arrays
      const normalizedPost = {
        ...createdPost,
        listaComentario: createdPost.listaComentario || [],
        listaUsuarioCurtida: createdPost.listaUsuarioCurtida || [],
      }

      setPosts((prevPosts) => [normalizedPost, ...prevPosts])
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

      if (!loggedUser) {
        throw new Error('Usuário não autenticado')
      }

      // Estrutura correta para enviar para a API de edição
      const updatedPostData = {
        titulo: newPostTitle.trim(),
        descricao: newPostContent.trim(),
        idCanal: post.idCanal,
        idModalidadeEsportiva: post.idModalidadeEsportiva,
        dataPublicacao: post.dataPublicacao,
        Usuario: {
          idUsuario: loggedUser.idUsuario,
        },
      }

      console.log('🔄 Atualizando post:', {
        postId,
        data: updatedPostData,
      })

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/publicacao/atualizarPublicacao/${postId}`,
        updatedPostData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        },
      )

      console.log('✅ Resposta da atualização:', {
        status: response.status,
        data: response.data,
      })

      toast.success('Publicação atualizada com sucesso!')

      // Atualizar o post na lista local
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.idPublicacao === postId 
            ? { 
                ...post, 
                titulo: newPostTitle.trim(),
                descricao: newPostContent.trim(),
                ...response.data 
              } 
            : post,
        ),
      )

      setNewPostTitle('')
      setNewPostContent('')
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Erro da API ao atualizar:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        })
        
        // Tratar erros específicos
        if (error.response?.status === 401) {
          toast.error('Token de autenticação inválido ou expirado')
        } else if (error.response?.status === 403) {
          toast.error('Não autorizado a editar esta publicação')
        } else if (error.response?.status === 404) {
          toast.error('Publicação não encontrada')
        } else if (error.response?.status === 400) {
          const errorMessage = error.response?.data?.message || 
                              error.response?.data?.error || 
                              'Dados inválidos'
          toast.error(`Erro de validação: ${errorMessage}`)
        } else {
          toast.error(`Erro ao atualizar: ${error.response?.data?.message || error.message}`)
        }
      } else {
        console.error('❌ Erro desconhecido ao atualizar:', error)
        toast.error('Erro de conexão ao atualizar a publicação')
      }
      throw error
    }
  }

  const handleDeletePost = async (postId: number) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Token não encontrado')
      }

      if (!loggedUser) {
        throw new Error('Usuário não autenticado')
      }

      // Verificar se o post existe e se o usuário pode deletá-lo
      const post = posts.find((p) => p.idPublicacao === postId)
      if (!post) {
        throw new Error('Post não encontrado')
      }

      if (post.Usuario.idUsuario !== loggedUser.idUsuario) {
        throw new Error('Você só pode deletar seus próprios posts')
      }

      console.log('🗑️ Removendo post:', {
        postId,
        titulo: post.titulo,
        usuario: post.Usuario.username,
      })

      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/publicacao/removerPublicacao/${postId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        },
      )

      console.log('✅ Resposta da remoção:', {
        status: response.status,
        data: response.data,
      })

      toast.success('Publicação removida com sucesso!')

      // Remover o post da lista local
      setPosts((prevPosts) =>
        prevPosts.filter((post) => post.idPublicacao !== postId),
      )

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Erro da API ao remover:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        })
        
        // Tratar erros específicos
        if (error.response?.status === 401) {
          toast.error('Token de autenticação inválido ou expirado')
        } else if (error.response?.status === 403) {
          toast.error('Não autorizado a remover esta publicação')
        } else if (error.response?.status === 404) {
          toast.error('Publicação não encontrada')
        } else if (error.response?.status === 400) {
          const errorMessage = error.response?.data?.message || 
                              error.response?.data?.error || 
                              'Operação inválida'
          toast.error(`Erro: ${errorMessage}`)
        } else {
          toast.error(`Erro ao remover: ${error.response?.data?.message || error.message}`)
        }
      } else {
        console.error('❌ Erro desconhecido ao remover:', error)
        toast.error('Erro de conexão ao remover a publicação')
      }
      throw error
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
          descricao,
          idPublicacao: postId,
          Usuario: {
            idUsuario: loggedUser.idUsuario,
            username: loggedUser.username,
            nome: loggedUser.nome,
            foto: loggedUser.foto || null,
            permissao: loggedUser.permissao,
          },
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
        const updatedComment = {
          descricao,
          idPublicacao,
          Usuario: {
            idUsuario: loggedUser.idUsuario,
            username: loggedUser.username,
            nome: loggedUser.nome,
            foto: loggedUser.foto || null,
            permissao: loggedUser.permissao,
          },
        }

        const result = await updateComment(commentId, updatedComment)
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

  const handleDeleteComment = async (commentId: number, postId: number) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Token não encontrado')
      }

      console.log('Deleting comment with ID:', commentId) // Log the comment ID

      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/comentario/removerComentario/${commentId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      )

      console.log('Comment delete response:', response) // Log the response

      toast.success('Comentário removido com sucesso!')

      // Remove the comment from the post's comments list
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.idPublicacao === postId
            ? {
                ...post,
                listaComentario: post.listaComentario.filter(
                  (comment) => comment.idComentario !== commentId,
                ),
              }
            : post,
        ),
      )
    } catch (error) {
      console.error('Error deleting comment:', error) // Log the error
      toast.error('Erro ao remover o comentário.')
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
        // Normalizar posts antes de adicionar
        const normalizedPosts = morePosts.map((post: Post) => ({
          ...post,
          listaComentario: post.listaComentario || [],
          listaUsuarioCurtida: post.listaUsuarioCurtida || [],
        }))
        
        // Carregar contagens reais de comentários para os novos posts
        const postsWithCommentCounts = await loadCommentsCount(normalizedPosts)
        
        appendPosts(postsWithCommentCounts)
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
    handleDeletePost, // Expose handleDeletePost
    fetchCommentsForPost,
    handleCreateComment, // Adicionado
    handleUpdateComment, // Adicionado
    handleDeleteComment, // Expose handleDeleteComment
    loggedUser, // Adicionado
    appendPosts, // Add this
    loadMore, // Expose loadMore
    hasMore, // Expose hasMore
    setPosts, // Expose setPosts for syncing comments
  }
}
