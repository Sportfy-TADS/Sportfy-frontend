import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Heart } from 'lucide-react'
import { Comentario } from '@/interface/types'
import { useFeed } from '@/hooks/useFeed' // Importar o hook
import { useState, useEffect } from 'react'
import { toast } from 'sonner' // Importar toast

interface CommentsDialogProps {
  isOpen: boolean
  onClose: () => void
  comments: Comentario[] // Alterar para Comentario[]
  loading: boolean
  postId: number | null // Adicionado
}


// Componente Recursivo para Exibir e Editar Comentários Aninhados
const CommentItem: React.FC<{
  comment: Comentario;
  addReply: (parentId: number, descricao: string) => void;
  updateComment: (commentId: number, descricao: string, idPublicacao: number) => void; // Atualizado
  loggedUser: Usuario | null; // Adicionado
}> = ({ comment, addReply, updateComment, loggedUser }) => {
  const [showReply, setShowReply] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(comment.descricao)

  const handleReply = async () => {
    if (replyContent.trim()) {
      await addReply(comment.idComentario, replyContent)
      setReplyContent('')
      setShowReply(false)
    } else {
      toast.error('Digite um comentário válido.')
    }
  }

  const handleEdit = async () => {
    if (editedContent.trim()) {
      await updateComment(comment.idComentario, editedContent, comment.idPublicacao) // Passar idPublicacao
      setIsEditing(false)
    } else {
      toast.error('Digite um conteúdo válido.')
    }
  }

  return (
    <div className="ml-4 mt-2">
      <div className="p-2 border rounded bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img
              src={comment.Usuario?.foto || 'https://via.placeholder.com/40'}
              alt="Avatar"
              className="w-8 h-8 rounded-full"
            />
            <span className="font-semibold text-sm dark:text-white">{comment.Usuario?.nome}</span>
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
            {(loggedUser?.permissao?.toUpperCase() === 'ACADEMICO' && 
              loggedUser?.idUsuario === comment.Usuario.idUsuario) && ( // Verifica permissão e idUsuario de forma case-insensitive
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
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{comment.descricao}</p>
        )}
        {/* Botão de Curtida no Comentário */}
        <div className="flex items-center space-x-2 mt-1">
          <button className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
            <Heart className="w-3 h-3" />
            <span>{comment.listaUsuarioCurtida.length}</span>
          </button>
        </div>
      </div>

      {/* Renderizar Comentários Filhos */}
      {comment.listaComentarios && comment.listaComentarios.map((reply) => (
        <CommentItem 
          key={reply.idComentario} 
          comment={reply} 
          addReply={addReply} 
          updateComment={updateComment} 
          loggedUser={loggedUser} // Passar loggedUser
        />
      ))}
    </div>
  )
}

const CommentsDialog: React.FC<CommentsDialogProps> = ({ isOpen, onClose, comments, loading, postId }) => {
  const { handleCreateComment, handleUpdateComment, loggedUser } = useFeed() // Usar o hook
  const [newComment, setNewComment] = useState('')
  const [localComments, setLocalComments] = useState<Comentario[]>(comments)

  useEffect(() => {
    setLocalComments(comments)
  }, [comments])

  const addReply = async (parentId: number, descricao: string) => {
    if (postId === null) {
      toast.error('ID da publicação não encontrado.')
      return
    }
    try {
      const createdReply = await handleCreateComment(postId, descricao)
      // Atualizar localComments com a resposta criada
      setLocalComments((prev) =>
        prev.map((comment) =>
          comment.idComentario === parentId
            ? {
                ...comment,
                listaComentarios: comment.listaComentarios
                  ? [createdReply, ...comment.listaComentarios]
                  : [createdReply],
              }
            : comment
        )
      )
    } catch {
      // Erros já são tratados no hook
    }
  }

  const updateCommentHandler = async (commentId: number, descricao: string) => {
    if (postId !== null) {
      try {
        const updatedComment = await handleUpdateComment(commentId, descricao, postId)
        // Atualizar localComments com o comentário atualizado
        setLocalComments((prev) =>
          prev.map((comment) =>
            comment.idComentario === commentId
              ? { ...comment, descricao: updatedComment.descricao, dataComentario: updatedComment.dataComentario }
              : comment
          )
        )
      } catch {
        // Erros já são tratados no hook
      }
    } else {
      toast.error('ID da publicação não encontrado.')
    }
  }

  const submitComment = async () => {
    if (postId && newComment.trim()) {
      try {
        const createdComment = await handleCreateComment(postId, newComment)
        setLocalComments((prev) => [createdComment, ...prev])
        setNewComment('')
      } catch {
        // Erros já são tratados no hook
      }
    } else {
      toast.error('Digite um comentário válido.')
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
              <Skeleton key={idx} className="h-20 w-full mb-2 rounded-lg dark:bg-gray-700" />
            ))
          ) : (
            <>
              {localComments.length ? (
                localComments.map((comment) => (
                  <CommentItem 
                    key={comment.idComentario} 
                    comment={comment} 
                    addReply={addReply} 
                    updateComment={updateCommentHandler} 
                    loggedUser={loggedUser} // Passar loggedUser
                  />
                ))
              ) : (
                <p className="text-gray-600 dark:text-gray-400 p-4">Sem comentários até o momento.</p>
              )}
            </>
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
