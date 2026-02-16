'use client'

import { memo, useCallback, useEffect, useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageCircle, Star } from 'lucide-react'
import { Toaster, toast } from 'sonner'

import CommentsDialog from '@/components/CommentsDialog'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useFeedInfinite } from '@/hooks/useFeedInfinite'
import { fetchComments } from '@/http/feed'
import { Comentario, Post } from '@/interface/types'

// ─── Memoized Post Card ──────────────────────────────────────

const PostCard = memo(function PostCard({
  post,
  loggedUser,
  startEditingPost,
  handleLikePost,
  openCommentsDialog,
  confirmDeletePost,
  formatDate,
  isLiking,
}: {
  post: Post
  loggedUser: { idUsuario: number; username: string; nome: string; permissao: string; idAcademico: number } | null
  startEditingPost: (post: Post) => void
  handleLikePost: (postId: number) => void
  openCommentsDialog: (postId: number) => void
  confirmDeletePost: (post: Post) => void
  formatDate: (date: string | null | undefined) => string
  isLiking: boolean
}) {
  const isUserLiked = post.listaUsuarioCurtida?.some(
    (usuario) => usuario.idUsuario === loggedUser?.idUsuario,
  )

  return (
    <Card className="p-4 rounded-lg shadow-lg bg-white dark:bg-gray-800 transition-colors duration-200">
      <CardHeader className="pb-2">
        <div className="flex items-start space-x-3">
          <Avatar>
            {post.Usuario.foto ? (
              <AvatarImage
                src={post.Usuario.foto}
                alt={post.Usuario.nome || post.Usuario.username}
                loading="lazy"
                decoding="async"
                width={40}
                height={40}
                className="w-10 h-10"
              />
            ) : (
              <AvatarFallback className="w-10 h-10">
                {(
                  post.Usuario.nome?.slice(0, 1) ||
                  post.Usuario.username?.slice(0, 1) ||
                  '?'
                )
                  .toString()
                  .toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                {post.Usuario.nome}
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1 mt-0.5">
              <span className="truncate">@{post.Usuario.username}</span>
              <span>·</span>
              <span className="whitespace-nowrap">
                {post.dataPublicacao
                  ? formatDate(post.dataPublicacao)
                  : 'Data não disponível'}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="mt-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {post.titulo}
        </h2>
        <p className="text-md text-gray-800 dark:text-gray-200 mb-2">
          {post.descricao}
        </p>
        <div className="flex items-center justify-start space-x-6 text-gray-600 dark:text-gray-400 mt-2 border-t border-gray-300 dark:border-gray-600 pt-2">
          <button
            onClick={() => handleLikePost(post.idPublicacao)}
            disabled={isLiking}
            className={`flex items-center space-x-1 text-sm hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-150 ${
              isLiking ? 'opacity-60 cursor-not-allowed' : ''
            } ${isUserLiked ? 'transform scale-110' : ''}`}
          >
            <Star
              className={`w-5 h-5 transition-all duration-200 ${
                isUserLiked
                  ? 'text-amber-400 fill-amber-400 drop-shadow-md'
                  : 'text-gray-300 hover:text-amber-300'
              } ${isLiking ? 'animate-pulse' : ''}`}
            />
            <span className="font-medium">
              {post.listaUsuarioCurtida?.length || 0}
            </span>
          </button>
          <button
            onClick={() => openCommentsDialog(post.idPublicacao)}
            className="flex items-center space-x-1 text-sm hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-150"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">
              {post.listaComentario?.length || 0}
            </span>
          </button>
          {loggedUser?.permissao?.toUpperCase() === 'ACADEMICO' &&
            post.Usuario.idUsuario === loggedUser.idUsuario && (
              <>
                <button
                  onClick={() => startEditingPost(post)}
                  className="flex items-center space-x-1 text-sm hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-150"
                >
                  Editar
                </button>
                <button
                  onClick={() => confirmDeletePost(post)}
                  className="flex items-center space-x-1 text-sm hover:text-red-600 dark:hover:text-red-400 transition-colors duration-150"
                >
                  Excluir
                </button>
              </>
            )}
        </div>
      </CardContent>
    </Card>
  )
})

// ─── Feed Page ───────────────────────────────────────────────

export default function FeedPage() {
  const {
    posts,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    loadMoreRef,
    handleLikePost,
    handleCreatePost,
    isCreatingPost,
    handleEditPost,
    isEditingPost,
    handleDeletePost,
    isDeletingPost,
    handleCreateComment,
    handleDeleteComment,
    syncCommentsInCache,
    formatDate,
    loggedUser,
  } = useFeedInfinite()

  // ── Local UI state ──────────────────────────────────────
  const [newPostTitle, setNewPostTitle] = useState('')
  const [newPostContent, setNewPostContent] = useState('')
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [isCommentsDialogOpen, setIsCommentsDialogOpen] = useState(false)
  const [selectedPostComments, setSelectedPostComments] = useState<Comentario[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null)

  const [likingPosts, setLikingPosts] = useState<Set<number>>(new Set())

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<Post | null>(null)

  // ── Debounced like ──────────────────────────────────────
  const debouncedHandleLikePost = useCallback(
    (() => {
      const timeouts: Record<number, NodeJS.Timeout> = {}

      return (postId: number) => {
        if (timeouts[postId]) clearTimeout(timeouts[postId])

        timeouts[postId] = setTimeout(() => {
          if (!likingPosts.has(postId)) {
            setLikingPosts((prev) => new Set(prev).add(postId))
            handleLikePost(postId, {
              onSettled: () => {
                setLikingPosts((prev) => {
                  const s = new Set(prev)
                  s.delete(postId)
                  return s
                })
              },
            })
          }
          delete timeouts[postId]
        }, 150)
      }
    })(),
    [handleLikePost, likingPosts],
  )

  // ── Remove Next.js dev overlay (dev only) ───────────────
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const id = setInterval(() => {
        document.querySelector('body > nextjs-portal')?.remove()
      }, 10)
      return () => clearInterval(id)
    }
  }, [])

  // ── Post CRUD handlers ─────────────────────────────────

  const openNewPostDialog = () => {
    setEditingPost(null)
    setNewPostTitle('')
    setNewPostContent('')
    setIsDialogOpen(true)
  }

  const startEditingPost = (post: Post) => {
    setEditingPost(post)
    setNewPostTitle(post.titulo)
    setNewPostContent(post.descricao)
    setIsDialogOpen(true)
  }

  const createNewPost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast.error('Título e descrição são obrigatórios')
      return
    }
    if (!loggedUser?.idUsuario) {
      toast.error('Usuário não autenticado')
      return
    }

    try {
      await handleCreatePost({
        titulo: newPostTitle,
        descricao: newPostContent,
      })
      setIsDialogOpen(false)
      setNewPostTitle('')
      setNewPostContent('')
    } catch {
      // toast already shown in mutation
    }
  }

  const saveEditedPost = async () => {
    if (!editingPost) {
      toast.error('Nenhum post selecionado para edição')
      return
    }
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast.error('Título e descrição são obrigatórios')
      return
    }

    try {
      await handleEditPost({
        postId: editingPost.idPublicacao,
        titulo: newPostTitle,
        descricao: newPostContent,
      })
      setEditingPost(null)
      setNewPostTitle('')
      setNewPostContent('')
      setIsDialogOpen(false)
    } catch {
      // toast already shown in mutation
    }
  }

  const confirmDeletePost = (post: Post) => {
    setPostToDelete(post)
    setIsDeleteDialogOpen(true)
  }

  const executeDeletePost = () => {
    if (!postToDelete) return
    handleDeletePost(postToDelete.idPublicacao)
    setIsDeleteDialogOpen(false)
    setPostToDelete(null)
  }

  const cancelDeletePost = () => {
    setIsDeleteDialogOpen(false)
    setPostToDelete(null)
  }

  // ── Comments dialog ────────────────────────────────────

  const openCommentsDialog = async (postId: number) => {
    setCommentsLoading(true)
    setSelectedPostId(postId)

    try {
      const currentPost = posts.find((p) => p.idPublicacao === postId)

      if (currentPost && currentPost.listaComentario.length > 0) {
        setSelectedPostComments(currentPost.listaComentario)
      } else {
        const response = await fetchComments(postId)
        setSelectedPostComments(response)
      }

      setIsCommentsDialogOpen(true)
    } catch {
      toast.error('Erro ao carregar comentários')
    } finally {
      setCommentsLoading(false)
    }
  }

  const closeCommentsDialog = () => {
    setIsCommentsDialogOpen(false)

    // Sync comments back to the TanStack Query cache
    if (selectedPostId !== null) {
      syncCommentsInCache(selectedPostId, selectedPostComments)
    }

    setSelectedPostComments([])
    setSelectedPostId(null)
  }

  // ── Render ─────────────────────────────────────────────

  return (
    <>
      <Toaster />
      <Header />
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <Sidebar />
        <div className="container mx-auto p-4 flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Comunidade
              </h1>
            </div>

            <Button
              onClick={openNewPostDialog}
              className="mb-4 w-full py-2 text-xl font-semibold bg-blue-500 dark:bg-blue-600 text-white rounded-full hover:bg-blue-600 dark:hover:bg-blue-700 shadow-md"
              disabled={!loggedUser || isCreatingPost}
            >
              {loggedUser ? 'Nova Publicação' : 'Faça login para publicar'}
            </Button>

            {/* Create / Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent
                description="Criar ou editar publicação"
                className="dark:bg-gray-800"
              >
                <DialogHeader>
                  <DialogTitle className="dark:text-white">
                    {editingPost
                      ? `Editar Publicação #${editingPost.idPublicacao}`
                      : 'Criar Nova Publicação'}
                  </DialogTitle>
                  {editingPost && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Editando post de {editingPost.Usuario.nome} (@
                      {editingPost.Usuario.username})
                    </p>
                  )}
                </DialogHeader>
                <div className="space-y-4">
                  <input
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder="Título"
                    className="w-full p-4 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 shadow-md dark:bg-gray-700 dark:text-white"
                  />
                  <Textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="No que você está pensando?"
                    className="w-full p-4 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 shadow-md dark:bg-gray-700 dark:text-white"
                  />
                  <Button
                    onClick={editingPost ? saveEditedPost : createNewPost}
                    className="w-full bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700 rounded-full"
                    disabled={
                      !newPostTitle.trim() ||
                      !newPostContent.trim() ||
                      isCreatingPost ||
                      isEditingPost
                    }
                  >
                    {editingPost
                      ? isEditingPost
                        ? 'Salvando...'
                        : 'Salvar Alterações'
                      : isCreatingPost
                        ? 'Publicando...'
                        : 'Publicar'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Posts List */}
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <Skeleton
                    key={idx}
                    className="h-32 w-full rounded-lg shadow-md dark:bg-gray-700"
                  />
                ))
              ) : posts.length ? (
                posts.map((post) => (
                  <div key={post.idPublicacao}>
                    <PostCard
                      post={post}
                      loggedUser={loggedUser}
                      startEditingPost={startEditingPost}
                      handleLikePost={debouncedHandleLikePost}
                      openCommentsDialog={openCommentsDialog}
                      confirmDeletePost={confirmDeletePost}
                      formatDate={formatDate}
                      isLiking={likingPosts.has(post.idPublicacao)}
                    />
                  </div>
                ))
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  Não há publicações.
                </p>
              )}
            </div>

            {/* Infinite Scroll Sentinel */}
            <div ref={loadMoreRef} className="py-4 flex justify-center">
              {isFetchingNextPage && (
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
                  Carregando mais publicações...
                </div>
              )}
              {!hasNextPage && posts.length > 0 && (
                <p className="text-sm text-gray-400">
                  Você viu todas as publicações.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comments Dialog */}
      <CommentsDialog
        isOpen={isCommentsDialogOpen}
        onClose={closeCommentsDialog}
        comments={selectedPostComments}
        setComments={setSelectedPostComments}
        loading={commentsLoading}
        postId={selectedPostId ?? 0}
        loggedUser={loggedUser}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="dark:bg-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 dark:text-red-400">
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-300">
              Tem certeza que deseja excluir a publicação &quot;
              {postToDelete?.titulo}&quot;?
              <br />
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-2 block">
                Esta ação não pode ser desfeita.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={cancelDeletePost}
              className="dark:border-gray-600"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDeletePost}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeletingPost}
            >
              {isDeletingPost ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
