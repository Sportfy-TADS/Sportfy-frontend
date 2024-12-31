'use client'

import { useState, useEffect } from 'react' // Add import

import Image from 'next/image' // Adicionado

import { motion } from 'framer-motion'
import { MessageCircle, Star } from 'lucide-react'
import { Toaster, toast } from 'sonner' // Adicionado 'toast'

import CommentsDialog from '@/components/CommentsDialog'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
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
import { useFeed } from '@/hooks/useFeed'
import { fetchComments } from '@/http/feed' // Removed fetchPosts import as it's handled in useFeed
import { Comentario, Post } from '@/interface/types'

export default function FeedPage() {
  const {
    posts,
    loading,
    newPostContent,
    setNewPostContent,
    handleLikePost,
    handleNewPost,
    handleEditPost,
    handleDeletePost, // Add handleDeletePost
    loggedUser,
    newPostTitle,
    setNewPostTitle,
    loadMore, // Use loadMore
    hasMore, // Use hasMore
    handleDeleteComment, // Add handleDeleteComment
  } = useFeed()
  const [editingPost, setEditingPost] = useState<Post | null>(null) // Alterado tipo de 'any' para 'Post | null'
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCommentsDialogOpen, setIsCommentsDialogOpen] = useState(false)
  const [selectedPostComments, setSelectedPostComments] = useState<
    Comentario[]
  >([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null)

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        document.querySelector('body > nextjs-portal')?.remove()
      }, 10)
    }
  }, [])

  const startEditingPost = (post: Post) => {
    setEditingPost(post)
    setNewPostTitle(post.titulo)
    setNewPostContent(post.descricao)
    setIsDialogOpen(true)
  }

  const saveEditedPost = async () => {
    if (editingPost) {
      await handleEditPost(editingPost.idPublicacao)
      setEditingPost(null)
      setNewPostTitle('')
      setNewPostContent('')
      setIsDialogOpen(false)
    }
  }

  const openNewPostDialog = () => {
    setEditingPost(null)
    setNewPostTitle('')
    setNewPostContent('')
    setIsDialogOpen(true)
  }

  const createNewPost = async () => {
    console.log('Creating new post...') // Log start of function
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast.error('Título e descrição são obrigatórios')
      console.log('Failed: Title or content is empty') // Log validation failure
      return
    }

    if (!loggedUser?.idUsuario) {
      toast.error('Usuário não autenticado')
      console.log('Failed: User not authenticated') // Log authentication failure
      return
    }

    const newPost: Partial<Post> = {
      titulo: newPostTitle.trim(),
      descricao: newPostContent.trim(),
      idCanal: 1,
      idModalidadeEsportiva: null,
      idUsuario: loggedUser.idUsuario,
    }

    console.log('New post payload:', newPost) // Log post payload

    try {
      await handleNewPost(newPost as Post)
      console.log('Post created successfully') // Log success
      setIsDialogOpen(false)
      setTimeout(() => {
        toast.success('Publicação criada com sucesso!')
      }, 100)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido'
      console.error('Failed to create post:', {
        error,
        message: errorMessage,
        payload: newPost,
      })
      setTimeout(() => {
        toast.error(`Erro ao criar publicação: ${errorMessage}`)
      }, 100)
    }
  }

  const openCommentsDialog = async (postId: number) => {
    setCommentsLoading(true)
    setSelectedPostId(postId)
    try {
      const response = await fetchComments(postId)
      setSelectedPostComments(response)
      setIsCommentsDialogOpen(true)
    } catch (error) {
      console.error('Erro ao carregar comentários:', error)
      toast.error('Erro ao carregar comentários')
    } finally {
      setCommentsLoading(false)
    }
  }

  const closeCommentsDialog = () => {
    setIsCommentsDialogOpen(false)
    setSelectedPostComments([])
    setSelectedPostId(null)
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
    return new Date(dateString).toLocaleDateString('pt-BR', options)
  }

  return (
    <>
      <Toaster /> {/* Adicionado Toaster */}
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
            >
              Nova Publicação
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="dark:bg-gray-800">
                <DialogHeader>
                  <DialogTitle className="dark:text-white">
                    {editingPost
                      ? 'Editar Publicação'
                      : 'Criar Nova Publicação'}
                  </DialogTitle>
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
                  >
                    {editingPost ? 'Salvar' : 'Publicar'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <Skeleton
                    key={idx}
                    className="h-32 w-full rounded-lg shadow-md dark:bg-gray-700"
                  />
                ))
              ) : posts.length ? (
                posts.map((post) => (
                  <motion.div
                    key={post.idPublicacao}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="p-4 rounded-lg shadow-lg bg-white dark:bg-gray-800 transition-colors duration-200">
                      <CardHeader className="flex items-start space-x-3 pb-2">
                        <Image
                          src={
                            post.Usuario.foto ||
                            `https://via.placeholder.com/50`
                          }
                          alt="Avatar"
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                        <div className="flex flex-col justify-center">
                          <span className="font-semibold text-base text-gray-900 dark:text-white">
                            {post.Usuario.nome}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            @{post.Usuario.username} •{' '}
                            {post.dataPublicacao ? formatDate(post.dataPublicacao) : 'Data não disponível'}
                          </span>
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
                            className="flex items-center space-x-1 text-sm hover:text-gray-800 dark:hover:text-gray-200"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                post.listaUsuarioCurtida?.some(
                                  (usuario) =>
                                    usuario.idUsuario === loggedUser?.idUsuario,
                                )
                                  ? 'text-amber-300 fill-amber-300'
                                  : 'text-gray-300'
                              }`}
                            />
                            <span>{post.listaUsuarioCurtida?.length || 0}</span>
                          </button>
                          <button
                            onClick={() =>
                              openCommentsDialog(post.idPublicacao)
                            }
                            className="flex items-center space-x-1 text-sm hover:text-gray-800 dark:hover:text-gray-200"
                          >
                            <MessageCircle className="w-5 h-5" />
                            {post.listaComentario?.length > 0 && (
                              <span>{post.listaComentario.length}</span>
                            )}
                          </button>
                          {loggedUser?.permissao?.toUpperCase() ===
                            'ACADEMICO' &&
                            post.Usuario.idUsuario === loggedUser.idUsuario && ( // Adicionado '?' para permissao
                              <>
                                <button
                                  onClick={() => startEditingPost(post)}
                                  className="flex items-center space-x-1 text-sm hover:text-gray-800 dark:hover:text-gray-200"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeletePost(post.idPublicacao)
                                  }
                                  className="flex items-center space-x-1 text-sm hover:text-gray-800 dark:hover:text-gray-200"
                                >
                                  Excluir
                                </button>
                              </>
                            )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  Não há publicações.
                </p>
              )}
            </div>
            {hasMore && (
              <Button onClick={loadMore} className="mt-4 w-full">
                Carregar Mais
              </Button>
            )}
          </div>
        </div>
      </div>
      <CommentsDialog
        isOpen={isCommentsDialogOpen}
        onClose={closeCommentsDialog}
        comments={selectedPostComments}
        loading={commentsLoading}
        postId={selectedPostId} // Adicionado
        loggedUser={loggedUser} // Certificar-se de passar loggedUser
        handleDeleteComment={handleDeleteComment} // Pass handleDeleteComment
      />
    </>
  )
}
