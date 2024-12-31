import { useEffect, useState } from 'react'

import Image from 'next/image' // Importar Image do next/image

import axios from 'axios' // Import axios
import { Star } from 'lucide-react'
import { toast } from 'sonner' // Importar toast

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useFeed } from '@/hooks/useFeed' // Importar o hook
import { fetchComments } from '@/http/feed'
import { Comentario, Usuario } from '@/interface/types'

interface CommentsDialogProps {
  isOpen: boolean
  onClose: () => void
  comments: Comentario[] // Adicionado
  loading: boolean
  postId: number
  loggedUser: Usuario | null
  handleDeleteComment: (commentId: number, postId: number) => Promise<void>
}

const likeComment = async (userId: number, commentId: number) => {
  const token = localStorage.getItem('token')
  try {
    const url = `http://localhost:8081/comentario/curtirComentario/${userId}/${commentId}`
    const response = await axios.post(url, null, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    console.error('Error liking comment:', error)
    throw error
  }
}

const unlikeComment = async (userId: number, commentId: number) => {
  const token = localStorage.getItem('token')
  try {
    const url = `http://localhost:8081/comentario/removerCurtidaComentario/${userId}/${commentId}`
    const response = await axios.delete(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    console.error('Error unliking comment:', error)
    throw error
  }
}

// Componente Recursivo para Exibir e Editar Comentários Aninhados
const CommentItem: React.FC<{
  comment: Comentario
  handleLikeComment: (commentId: number) => void
  handleUpdateComment: (
    commentId: number,
    descricao: string,
    idPublicacao: number,
    dataComentario: Date,
  ) => void // Atualizado
  loggedUser: Usuario | null // Adicionado
}> = ({ comment, handleLikeComment, handleUpdateComment, loggedUser }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(comment.descricao)

  const handleEdit = async () => {
    if (editedContent.trim()) {
      await handleUpdateComment(
        comment.idComentario,
        editedContent,
        comment.idPublicacao,
        new Date(comment.dataComentario),
      ) // Passar idPublicacao
      setIsEditing(false)
    } else {
      toast.error('Digite um conteúdo válido.')
    }
  }

  const hasLiked = comment.listaUsuarioCurtida.some(
    (user) => user.idUsuario === loggedUser?.idUsuario,
  )

  const toggleLike = () => {
    handleLikeComment(comment.idComentario)
  }

  return (
    <div className="ml-4 mt-2">
      <div className="p-2 border rounded bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image
              src={comment.Usuario?.foto || 'https://via.placeholder.com/40'}
              alt="Avatar"
              width={32}
              height={32}
              className="w-8 h-8 rounded-full"
            />
            <span className="font-semibold text-sm dark:text-white">
              {comment.Usuario?.nome}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(comment.dataComentario).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <div className="flex space-x-2">
            {loggedUser?.permissao?.toUpperCase() === 'ACADEMICO' &&
              loggedUser?.idUsuario === comment.Usuario.idUsuario && ( // Verifica permissão e idUsuario de forma case-insensitive
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-xs text-yellow-500 hover:underline"
                >
                  {isEditing ? 'Cancelar' : 'Editar'}
                </button>
              )}
          </div>
        </div>
        {isEditing ? (
          <div className="mt-2">
            <input
              type="text"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />
            <button
              onClick={handleEdit}
              className="mt-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Salvar
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            {comment.descricao}
          </p>
        )}
        {/* Botão de Curtida no Comentário */}
        <div className="flex items-center space-x-2 mt-1">
          <button
            onClick={toggleLike}
            className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <Star
              className={`w-3 h-3 ${
                hasLiked ? 'text-amber-300 fill-amber-300' : 'text-gray-300'
              }`}
            />
            <span>{comment.listaUsuarioCurtida.length}</span>
          </button>
        </div>
      </div>

      {/* Renderizar Comentários Filhos */}
      {comment.listaComentarios &&
        comment.listaComentarios.map((reply) => (
          <CommentItem
            key={reply.idComentario}
            comment={reply}
            handleLikeComment={handleLikeComment}
            handleUpdateComment={handleUpdateComment}
            loggedUser={loggedUser} // Passar loggedUser
          />
        ))}
    </div>
  )
}

const CommentsDialog: React.FC<CommentsDialogProps> = ({
  isOpen,
  onClose,
  comments,
  loading,
  postId,
  loggedUser,
  handleDeleteComment,
}) => {
  const { handleCreateComment, handleUpdateComment } = useFeed() // Usar o hook
  const [newComment, setNewComment] = useState('')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    if (isOpen) {
      setPage(0)
      setHasMore(true)
      loadComments(0)
    }
  }, [isOpen])

  const loadComments = async (pageToLoad: number) => {
    try {
      const response = await fetchComments(postId, pageToLoad)
      if (response.length < 10) {
        setHasMore(false)
      } else {
        setPage((prev) => prev + 1)
      }
    } catch (error) {
      console.error('Erro ao carregar comentários:', error)
      toast.error('Erro ao carregar comentários.')
    }
  }

  const handleLikeComment = async (commentId: number) => {
    if (!loggedUser?.idUsuario) {
      toast.error('Usuário não autenticado')
      return
    }

    const commentIndex = comments.findIndex(
      (comment) => comment.idComentario === commentId,
    )
    if (commentIndex === -1) return

    const hasLiked = comments[commentIndex].listaUsuarioCurtida.some(
      (user) => user.idUsuario === loggedUser.idUsuario,
    )

    try {
      if (hasLiked) {
        await unlikeComment(loggedUser.idUsuario, commentId)
        comments[commentIndex].listaUsuarioCurtida = comments[
          commentIndex
        ].listaUsuarioCurtida.filter(
          (user) => user.idUsuario !== loggedUser.idUsuario,
        )
      } else {
        await likeComment(loggedUser.idUsuario, commentId)
        comments[commentIndex].listaUsuarioCurtida.push({
          idUsuario: loggedUser.idUsuario,
        })
      }
      setComments([...comments])
    } catch (error) {
      console.error('Erro ao atualizar curtida do comentário:', error)
      toast.error('Erro ao atualizar curtida do comentário.')
    }
  }

  const submitComment = async () => {
    if (!newComment.trim()) {
      toast.error('Digite um comentário válido.')
      return
    }
    try {
      const createdComment = await handleCreateComment(postId, newComment)
      setComments([createdComment, ...comments])
      setNewComment('')
    } catch (error) {
      console.error('Erro ao criar comentário:', error)
      toast.error('Erro ao criar comentário.')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Comentários</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              // ...existing Skeleton components...
              <Skeleton
                key={idx}
                className="h-20 w-full mb-2 rounded-lg dark:bg-gray-700"
              />
            ))
          ) : (
            <>
              {comments.length ? (
                comments.map((comment) => (
                  <CommentItem
                    key={comment.idComentario}
                    comment={comment}
                    handleLikeComment={handleLikeComment}
                    handleUpdateComment={handleUpdateComment}
                    loggedUser={loggedUser} // Passar loggedUser
                  />
                ))
              ) : (
                <p className="text-gray-600 dark:text-gray-400 p-4">
                  Sem comentários até o momento.
                </p>
              )}
            </>
          )}
          {loading && (
            <div className="flex justify-center my-4">
              <p>Carregando...</p>
            </div>
          )}
          {hasMore && !loading && (
            <div className="flex justify-center my-4">
              <button
                onClick={() => loadComments(page)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded"
              >
                Carregar Mais Comentários
              </button>
            </div>
          )}
        </div>
        {/* Formulário de Novo Comentário Sempre Visível */}
        <div className="mt-4 flex items-center space-x-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Adicione um comentário..."
            className="flex-1 p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          />
          <button
            onClick={submitComment}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Enviar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
} // Fechar o componente CommentsDialog corretamente

export default CommentsDialog
