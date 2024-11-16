'use client'

import { useRouter } from 'next/navigation'

import { Heart, MessageCircle } from 'lucide-react'
import { Toaster } from 'sonner'

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

export default function FeedPage() {
  const {
    posts,
    loading,
    newPostContent,
    setNewPostContent,
    formatDate,
    handleLikePost,
    handleNewPost,
    loggedUser,
  } = useFeed()
  const router = useRouter()

  return (
    <>
      <Header />
      <Toaster richColors />
      <div className="flex h-screen bg-gray-100">
        <Sidebar className="flex-none" />
        <div className="container mx-auto p-4 flex-1 overflow-y-auto">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mb-4 w-full py-2 text-xl font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-md">
                Nova Publicação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Publicação</DialogTitle>
              </DialogHeader>
              <Textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="No que você está pensando?"
                className="mt-2 p-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-md"
              />
              <Button
                onClick={handleNewPost}
                className="mt-4 w-full bg-blue-500 text-white hover:bg-blue-600"
              >
                Publicar
              </Button>
            </DialogContent>
          </Dialog>

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Feed de Publicações</h1>
          </div>

          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <Skeleton
                  key={idx}
                  className="h-32 w-full rounded-lg shadow-md"
                />
              ))
            ) : posts.length ? (
              posts.map((post) => (
                <Card
                  key={post.idPublicacao}
                  className="p-4 rounded-lg shadow-lg bg-white dark:bg-gray-800"
                >
                  <CardHeader className="flex items-center space-x-3 pb-2">
                    <img
                      src={
                        post.Usuario.foto || `https://via.placeholder.com/50`
                      }
                      alt="Avatar"
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-base">
                        {post.Usuario.nome}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        @{post.Usuario.username} •{' '}
                        {formatDate(post.dataPublicacao)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="mt-2">
                    <p className="text-md text-gray-800 dark:text-gray-200 mb-2">
                      {post.descricao}
                    </p>
                    <div className="flex items-center justify-start space-x-6 text-gray-600 dark:text-gray-400 mt-2 border-t border-gray-300 pt-2">
                      <button
                        onClick={() => handleLikePost(post.idPublicacao)}
                        className="flex items-center space-x-1 text-sm"
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            post.listaUsuarioCurtida?.includes(
                              loggedUser?.idUsuario,
                            )
                              ? 'text-red-500'
                              : ''
                          }`}
                        />
                        <span>{post.listaUsuarioCurtida?.length || 0}</span>
                      </button>
                      <button className="flex items-center space-x-1 text-sm">
                        <MessageCircle className="w-5 h-5" />
                        <span>{post.listaComentario?.length || 0}</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p>Não há publicações.</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
