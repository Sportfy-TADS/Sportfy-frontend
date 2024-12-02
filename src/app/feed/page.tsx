'use client'

import { useRouter } from 'next/navigation'
import { Heart, MessageCircle, Star } from 'lucide-react'
import { Toaster, toast } from 'sonner' // Adicionado 'toast'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useFeed } from '@/hooks/useFeed'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { fetchComments } from '@/http/feed'
import CommentsDialog from '@/components/CommentsDialog'
import { Comentario } from '@/interface/types'

export default function FeedPage() {
  const {
    posts,
    loading,
    newPostContent,
    setNewPostContent,
    formatDate,
    handleLikePost,
    handleNewPost,
    handleEditPost,
    loggedUser,
    newPostTitle,
    setNewPostTitle,
    refreshPosts,
  } = useFeed()
  const router = useRouter()
  const [editingPost, setEditingPost] = useState<any>(null) // Especificar tipo se possível
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCommentsDialogOpen, setIsCommentsDialogOpen] = useState(false)
  const [selectedPostComments, setSelectedPostComments] = useState<Comentario[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null)

  const startEditingPost = (post: Post) => { // Especificar tipo
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
      refreshPosts()
    }
  }

  const openNewPostDialog = () => {
    setEditingPost(null)
    setNewPostTitle('')
    setNewPostContent('')
    setIsDialogOpen(true)
  }

  const createNewPost = async () => {
    await handleNewPost()
    setIsDialogOpen(false)
    refreshPosts()
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

  return (
    <>
      <Toaster /> {/* Adicionado Toaster */}
      <Header />
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <Sidebar className="flex-none w-64" />
        <div className="container mx-auto p-4 flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Comunidade</h1>
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
                    {editingPost ? 'Editar Publicação' : 'Criar Nova Publicação'}
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
                        <img
                          src={post.Usuario.foto || `https://via.placeholder.com/50`}
                          alt="Avatar"
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold text-base text-gray-900 dark:text-white">
                            {post.Usuario.nome}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            @{post.Usuario.username} • {formatDate(post.dataPublicacao)}
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
                                  (usuario) => usuario.idUsuario === loggedUser?.idUsuario
                                )
                                  ? 'text-amber-300 fill-amber-300'
                                  : 'text-gray-300'
                              }`}
                            />
                            <span>{post.listaUsuarioCurtida?.length || 0}</span>
                          </button>
                          <button
                            onClick={() => openCommentsDialog(post.idPublicacao)}
                            className="flex items-center space-x-1 text-sm hover:text-gray-800 dark:hover:text-gray-200"
                          >
                            <MessageCircle className="w-5 h-5" />
                            {post.listaComentario?.length > 0 && (
                              <span>{post.listaComentario.length}</span>
                            )}
                          </button>
                          {(loggedUser?.permissao?.toUpperCase() === 'ACADEMICO' && 
                            post.Usuario.idUsuario === loggedUser.idUsuario) && ( // Adicionado '?' para permissao
                            <button
                              onClick={() => startEditingPost(post)}
                              className="flex items-center space-x-1 text-sm hover:text-gray-800 dark:hover:text-gray-200"
                            >
                              Editar
                            </button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-600 dark:text-gray-400">Não há publicações.</p>
              )}
            </div>
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
      />
    </>
  )
}