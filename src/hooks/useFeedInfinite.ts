'use client'

import { useCallback, useEffect, useRef } from 'react'

import {
    useInfiniteQuery,
    useMutation,
    useQueryClient,
    type InfiniteData,
} from '@tanstack/react-query'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { toast } from 'sonner'

import {
    createComment,
    createPost,
    fetchPostsPaginated,
    likePost,
    unlikePost,
    type PaginatedResponse
} from '@/http/feed'
import { DecodedToken, Post, Usuario } from '@/interface/types'

const FEED_QUERY_KEY = ['feed'] as const
const PAGE_SIZE = 10

// ─── Helpers ───────────────────────────────────────────────

function getLoggedUser(): Usuario | null {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (!token) return null
  try {
    const decoded: DecodedToken = jwtDecode(token)
    return {
      idUsuario: decoded.idUsuario,
      username: decoded.sub,
      nome: decoded.nome?.trim() || decoded.sub,
      permissao: decoded.role || 'ACADEMICO',
      idAcademico: decoded.idAcademico || decoded.idUsuario,
    }
  } catch {
    return null
  }
}

type FeedInfiniteData = InfiniteData<PaginatedResponse<Post>, number>

// ─── Hook Principal ────────────────────────────────────────

export function useFeedInfinite() {
  const queryClient = useQueryClient()
  const loggedUser = getLoggedUser()

  // ── Infinite Query ──────────────────────────────────────
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: FEED_QUERY_KEY,
    queryFn: ({ pageParam }) => fetchPostsPaginated(pageParam, PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
    staleTime: 60 * 1000, // 1 min
    refetchOnWindowFocus: false,
  })

  // Flatten all pages into a single array of posts
  const posts: Post[] = data?.pages.flatMap((page) => page.content) ?? []

  // ── Intersection Observer (auto-load on scroll) ─────────
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = loadMoreRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0, rootMargin: '200px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // ── Like / Unlike Mutation ──────────────────────────────

  const likeMutation = useMutation({
    mutationFn: async (postId: number) => {
      if (!loggedUser) throw new Error('Usuário não autenticado')

      // Find the post across all pages
      const post = posts.find((p) => p.idPublicacao === postId)
      const alreadyLiked = post?.listaUsuarioCurtida.some(
        (u) => u.idUsuario === loggedUser.idUsuario,
      )

      if (alreadyLiked) {
        await unlikePost(loggedUser.idUsuario, postId)
        return { postId, action: 'unlike' as const }
      } else {
        await likePost(loggedUser.idUsuario, postId)
        return { postId, action: 'like' as const }
      }
    },

    // Optimistic update
    onMutate: async (postId: number) => {
      if (!loggedUser) return

      await queryClient.cancelQueries({ queryKey: FEED_QUERY_KEY })

      const previousData = queryClient.getQueryData<FeedInfiniteData>(FEED_QUERY_KEY)

      queryClient.setQueryData<FeedInfiniteData>(
        FEED_QUERY_KEY,
        (old) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              content: page.content.map((post) => {
                if (post.idPublicacao !== postId) return post

                const alreadyLiked = post.listaUsuarioCurtida.some(
                  (u) => u.idUsuario === loggedUser.idUsuario,
                )

                return {
                  ...post,
                  listaUsuarioCurtida: alreadyLiked
                    ? post.listaUsuarioCurtida.filter(
                        (u) => u.idUsuario !== loggedUser.idUsuario,
                      )
                    : [
                        ...post.listaUsuarioCurtida,
                        {
                          idUsuario: loggedUser.idUsuario,
                          username: loggedUser.username,
                          nome: loggedUser.nome,
                          permissao: loggedUser.permissao,
                          idAcademico: loggedUser.idAcademico,
                        },
                      ],
                }
              }),
            })),
          }
        },
      )

      return { previousData }
    },

    onError: (_err, _postId, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(FEED_QUERY_KEY, context.previousData)
      }
      toast.error('Erro ao atualizar a curtida.')
    },
  })

  // ── Create Post Mutation ────────────────────────────────

  const createPostMutation = useMutation({
    mutationFn: async (newPost: {
      titulo: string
      descricao: string
      idCanal?: number
      idModalidadeEsportiva?: number | null
    }) => {
      if (!loggedUser) throw new Error('Usuário não autenticado')

      const postData = {
        titulo: newPost.titulo.trim(),
        descricao: newPost.descricao.trim(),
        idCanal: newPost.idCanal ?? 1,
        idModalidadeEsportiva: newPost.idModalidadeEsportiva ?? null,
        Usuario: {
          idUsuario: loggedUser.idUsuario,
          username: loggedUser.username,
          nome: loggedUser.nome,
          foto: loggedUser.foto,
          permissao: loggedUser.permissao,
          idAcademico: loggedUser.idAcademico,
        },
      }

      return createPost(postData)
    },

    onSuccess: (createdPost) => {
      // Adicionar o novo post no topo da primeira página
      queryClient.setQueryData<FeedInfiniteData>(
        FEED_QUERY_KEY,
        (old) => {
          if (!old) return old
          const firstPage = old.pages[0]
          return {
            ...old,
            pages: [
              {
                ...firstPage,
                content: [
                  {
                    ...createdPost,
                    listaComentario: createdPost.listaComentario || [],
                    listaUsuarioCurtida: createdPost.listaUsuarioCurtida || [],
                  },
                  ...firstPage.content,
                ],
                totalElements: firstPage.totalElements + 1,
              },
              ...old.pages.slice(1),
            ],
          }
        },
      )
      toast.success('Publicação criada com sucesso!')
    },

    onError: (error) => {
      const msg = error instanceof Error ? error.message : 'Erro desconhecido'
      toast.error(`Erro ao criar publicação: ${msg}`)
    },
  })

  // ── Edit Post Mutation ──────────────────────────────────

  const editPostMutation = useMutation({
    mutationFn: async ({
      postId,
      titulo,
      descricao,
    }: {
      postId: number
      titulo: string
      descricao: string
    }) => {
      if (!loggedUser) throw new Error('Usuário não autenticado')

      const token = localStorage.getItem('token')
      if (!token) throw new Error('Token não encontrado')

      const post = posts.find((p) => p.idPublicacao === postId)
      if (!post) throw new Error('Post não encontrado')

      const updatedPostData = {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        idCanal: post.idCanal,
        idModalidadeEsportiva: post.idModalidadeEsportiva,
        dataPublicacao: post.dataPublicacao,
        Usuario: { idUsuario: loggedUser.idUsuario },
      }

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

      return { postId, data: response.data, titulo: titulo.trim(), descricao: descricao.trim() }
    },

    onSuccess: ({ postId, data: responseData, titulo, descricao }) => {
      queryClient.setQueryData<FeedInfiniteData>(
        FEED_QUERY_KEY,
        (old) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              content: page.content.map((post) =>
                post.idPublicacao === postId
                  ? { ...post, titulo, descricao, ...responseData }
                  : post,
              ),
            })),
          }
        },
      )
      toast.success('Publicação atualizada com sucesso!')
    },

    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status
        if (status === 401) toast.error('Token de autenticação inválido ou expirado')
        else if (status === 403) toast.error('Não autorizado a editar esta publicação')
        else if (status === 404) toast.error('Publicação não encontrada')
        else toast.error(`Erro ao atualizar: ${error.response?.data?.message || error.message}`)
      } else {
        toast.error('Erro de conexão ao atualizar a publicação')
      }
    },
  })

  // ── Delete Post Mutation ────────────────────────────────

  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Token não encontrado')
      if (!loggedUser) throw new Error('Usuário não autenticado')

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/publicacao/removerPublicacao/${postId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        },
      )

      return postId
    },

    // Optimistic removal
    onMutate: async (postId: number) => {
      await queryClient.cancelQueries({ queryKey: FEED_QUERY_KEY })
      const previousData = queryClient.getQueryData<FeedInfiniteData>(FEED_QUERY_KEY)

      queryClient.setQueryData<FeedInfiniteData>(
        FEED_QUERY_KEY,
        (old) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              content: page.content.filter((p) => p.idPublicacao !== postId),
            })),
          }
        },
      )

      return { previousData }
    },

    onSuccess: () => {
      toast.success('Publicação removida com sucesso!')
    },

    onError: (_err, _postId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(FEED_QUERY_KEY, context.previousData)
      }

      if (axios.isAxiosError(_err)) {
        const status = _err.response?.status
        if (status === 401) toast.error('Token inválido ou expirado')
        else if (status === 403) toast.error('Não autorizado a remover esta publicação')
        else if (status === 404) toast.error('Publicação não encontrada')
        else toast.error('Erro ao remover publicação')
      } else {
        toast.error('Erro de conexão ao remover a publicação')
      }
    },
  })

  // ── Create Comment Mutation ─────────────────────────────

  const createCommentMutation = useMutation({
    mutationFn: async ({
      postId,
      descricao,
    }: {
      postId: number
      descricao: string
    }) => {
      if (!loggedUser) throw new Error('Usuário não autenticado')

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

      const created = await createComment(newComment)
      return { postId, comment: created }
    },

    onSuccess: ({ postId, comment }) => {
      queryClient.setQueryData<FeedInfiniteData>(
        FEED_QUERY_KEY,
        (old) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              content: page.content.map((post) =>
                post.idPublicacao === postId
                  ? {
                      ...post,
                      listaComentario: [comment, ...post.listaComentario],
                    }
                  : post,
              ),
            })),
          }
        },
      )
      toast.success('Comentário criado com sucesso!')
    },

    onError: () => {
      toast.error('Erro ao criar comentário.')
    },
  })

  // ── Delete Comment Mutation ─────────────────────────────

  const deleteCommentMutation = useMutation({
    mutationFn: async ({
      commentId,
      postId,
    }: {
      commentId: number
      postId: number
    }) => {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Token não encontrado')

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/comentario/removerComentario/${commentId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      )

      return { commentId, postId }
    },

    onSuccess: ({ commentId, postId }) => {
      queryClient.setQueryData<FeedInfiniteData>(
        FEED_QUERY_KEY,
        (old) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              content: page.content.map((post) =>
                post.idPublicacao === postId
                  ? {
                      ...post,
                      listaComentario: post.listaComentario.filter(
                        (c) => c.idComentario !== commentId,
                      ),
                    }
                  : post,
              ),
            })),
          }
        },
      )
      toast.success('Comentário removido com sucesso!')
    },

    onError: () => {
      toast.error('Erro ao remover o comentário.')
    },
  })

  // ── Sync comments count in cache after dialog close ─────

  const syncCommentsInCache = useCallback(
    (postId: number, comments: import('@/interface/types').Comentario[]) => {
      queryClient.setQueryData<FeedInfiniteData>(
        FEED_QUERY_KEY,
        (old) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              content: page.content.map((post) =>
                post.idPublicacao === postId
                  ? { ...post, listaComentario: comments }
                  : post,
              ),
            })),
          }
        },
      )
    },
    [queryClient],
  )

  // ── Format Date Helper ──────────────────────────────────

  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'Data não disponível'
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return {
    // Query state
    posts,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    hasNextPage: hasNextPage ?? false,
    refetch,

    // Auto-scroll ref (attach to a sentinel div at end of list)
    loadMoreRef,

    // Manual load more (fallback)
    fetchNextPage,

    // Mutations
    handleLikePost: likeMutation.mutate,
    handleCreatePost: createPostMutation.mutateAsync,
    isCreatingPost: createPostMutation.isPending,
    handleEditPost: editPostMutation.mutateAsync,
    isEditingPost: editPostMutation.isPending,
    handleDeletePost: deletePostMutation.mutate,
    isDeletingPost: deletePostMutation.isPending,
    handleCreateComment: createCommentMutation.mutateAsync,
    handleDeleteComment: deleteCommentMutation.mutate,

    // Helpers
    syncCommentsInCache,
    formatDate,
    loggedUser,
  }
}
