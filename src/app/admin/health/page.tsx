'use client'

import { motion } from 'framer-motion'
import { AlertCircle, Edit, Plus, Power, RefreshCw, Trash2, Wifi, WifiOff } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { ApoioSaudeForm } from '@/components/apoio-saude/apoio-saude-form'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { useApoioSaude } from '@/hooks/use-apoio-saude'
import { getErrorGuidance } from '@/lib/utils/api-error-handler'
import { ApoioSaude } from '@/types/apoio-saude'

const ITEMS_PER_PAGE = 6

function maskPhoneNumber(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d{4,5})(\d{4})$/, '$1-$2')
}

function cleanPhone(phone: string) {
  return phone ? String(phone).replace(/\D/g, '') : phone
}

export default function ApoioSaudePage() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    descricao: '',
  })
  const [editingItem, setEditingItem] = useState<ApoioSaude | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>('online')
  const [currentPage, setCurrentPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')

  const { apoiosSaude, isLoading, isError, error, refetch, mutations } = useApoioSaude()

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setNetworkStatus('online')
    const handleOffline = () => setNetworkStatus('offline')
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Clean up development artifacts
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const cleanup = setInterval(() => {
        document.querySelector('body > nextjs-portal')?.remove()
      }, 10)
      return () => clearInterval(cleanup)
    }
  }, [])

  // Memoized filtered and paginated data
  const { filteredApoios, totalPages, paginatedApoios } = useMemo(() => {
    const filtered = apoiosSaude.filter((apoio) =>
      apoio.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apoio.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apoio.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
    const startIndex = currentPage * ITEMS_PER_PAGE
    const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE)
    
    return { filteredApoios: filtered, totalPages, paginatedApoios: paginated }
  }, [apoiosSaude, searchTerm, currentPage])

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(0)
  }, [searchTerm])

  const resetForm = useCallback(() => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      descricao: '',
    })
    setEditingItem(null)
  }, [])

  const handleCreateSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    
    const payload = {
      ...formData,
      telefone: cleanPhone(formData.telefone),
      dataPublicacao: new Date().toISOString(),
      idAdministrador: 1,
      ativo: true,
    }
    
    mutations.create.mutate(payload, {
      onSuccess: () => {
        setIsSheetOpen(false)
        resetForm()
      }
    })
  }, [formData, mutations.create, resetForm])

  const handleUpdateSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingItem) return
    
    mutations.update.mutate({
      id: editingItem.idApoioSaude,
      data: {
        ...formData,
        telefone: cleanPhone(formData.telefone),
      },
    }, {
      onSuccess: () => {
        setIsSheetOpen(false)
        resetForm()
      }
    })
  }, [editingItem, formData, mutations.update, resetForm])

  const handleEdit = useCallback((apoio: ApoioSaude) => {
    setEditingItem(apoio)
    setFormData({
      nome: apoio.nome,
      email: apoio.email,
      telefone: maskPhoneNumber(apoio.telefone),
      descricao: apoio.descricao,
    })
    setIsSheetOpen(true)
  }, [])

  const handleNew = useCallback(() => {
    resetForm()
    setIsSheetOpen(true)
  }, [resetForm])

  const handleDelete = useCallback((id: number) => {
    if (confirm('Tem certeza que deseja deletar este apoio à saúde?')) {
      mutations.delete.mutate(id)
    }
  }, [mutations.delete])

  const handleDeactivate = useCallback((id: number) => {
    if (confirm('Tem certeza que deseja desativar este apoio à saúde?')) {
      mutations.deactivate.mutate(id)
    }
  }, [mutations.deactivate])

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage)
  }, [])

  const isSubmitting = mutations.create.isPending || mutations.update.isPending

  return (
    <>
      <Header />
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="container mx-auto p-4 flex-1">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Network Status Indicator */}
            {networkStatus === 'offline' && (
              <div className="mb-4 p-3 bg-orange-100 border border-orange-300 rounded-lg flex items-center">
                <WifiOff className="h-5 w-5 text-orange-600 mr-2" />
                <span className="text-orange-800">
                  Você está offline. Algumas funcionalidades podem não estar disponíveis.
                </span>
              </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold">Apoios à Saúde</h1>
                {networkStatus === 'online' && (
                  <Wifi className="h-5 w-5 text-green-500" />
                )}
              </div>
              <div className="flex items-center space-x-4">
                <Input
                  placeholder="Buscar apoios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                    <Button
                      className="bg-blue-500 hover:bg-blue-600"
                      onClick={handleNew}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Cadastrar Apoio à Saúde
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>
                        {editingItem ? 'Editar Apoio à Saúde' : 'Cadastrar Apoio à Saúde'}
                      </SheetTitle>
                    </SheetHeader>
                    <ApoioSaudeForm
                      formData={formData}
                      onFormDataChange={setFormData}
                      onSubmit={editingItem ? handleUpdateSubmit : handleCreateSubmit}
                      isSubmitting={isSubmitting}
                      editMode={!!editingItem}
                    />
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Results Summary */}
            {!isLoading && !isError && (
              <div className="mb-4 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Mostrando {paginatedApoios.length} de {filteredApoios.length} apoios
                  {searchTerm && ` (filtrado de ${apoiosSaude.length} total)`}
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0}
                    >
                      Anterior
                    </Button>
                    <span className="text-sm">
                      Página {currentPage + 1} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages - 1}
                    >
                      Próxima
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Error State */}
            {isError && (
              <div className="mb-6 p-6 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-6 w-6 text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">
                      Problema de Conexão
                    </h3>
                    <p className="text-red-700 mb-4">{error.message}</p>
                    
                    {getErrorGuidance(error)}
                    
                    <div className="flex space-x-3 mt-4">
                      <Button 
                        onClick={refetch}
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                        disabled={isLoading}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Tentar Novamente
                      </Button>
                      <Button 
                        onClick={() => window.location.reload()}
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        Recarregar Página
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && !isError && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="w-full h-48 rounded-lg" />
                ))}
              </div>
            )}

            {/* Empty States */}
            {!isLoading && !isError && filteredApoios.length === 0 && (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <Plus className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum apoio à saúde cadastrado'}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {searchTerm ? (
                      <>
                        Tente buscar com outros termos ou{' '}
                        <button 
                          onClick={() => setSearchTerm('')}
                          className="text-blue-600 hover:underline"
                        >
                          limpe o filtro
                        </button>
                        .
                      </>
                    ) : (
                      'Comece cadastrando o primeiro apoio à saúde para aparecer aqui.'
                    )}
                  </p>
                  {!searchTerm && (
                    <Button 
                      onClick={handleNew}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Cadastrar Primeiro Apoio
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Data Grid */}
            {!isLoading && !isError && paginatedApoios.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedApoios.map((apoio: ApoioSaude) => (
                    <Card
                      className="border border-emerald-500 hover:shadow-lg transition-shadow"
                      key={apoio.idApoioSaude}
                    >
                      <CardHeader>
                        <CardTitle className="text-emerald-500 text-lg">
                          {apoio.nome}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <p><strong>Email:</strong> {apoio.email}</p>
                          <p><strong>Telefone:</strong> {maskPhoneNumber(apoio.telefone)}</p>
                          <p><strong>Descrição:</strong> {apoio.descricao}</p>
                          <p><strong>Publicado em:</strong> {' '}
                            {new Date(apoio.dataPublicacao).toLocaleDateString('pt-BR')}
                          </p>
                          <p><strong>Status:</strong> {' '}
                            <span className={`px-2 py-1 rounded text-xs ${
                              apoio.ativo 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {apoio.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </p>
                        </div>
                        <div className="flex flex-col space-y-2 mt-4">
                          <Button
                            variant="outline"
                            onClick={() => handleEdit(apoio)}
                            size="sm"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDelete(apoio.idApoioSaude)}
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Deletar
                          </Button>
                          <Button
                            className="bg-yellow-500 hover:bg-yellow-600 text-white"
                            onClick={() => handleDeactivate(apoio.idApoioSaude)}
                            size="sm"
                          >
                            <Power className="h-4 w-4 mr-2" />
                            Desativar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-8 space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(0)}
                      disabled={currentPage === 0}
                      size="sm"
                    >
                      Primeira
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0}
                      size="sm"
                    >
                      Anterior
                    </Button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(0, Math.min(currentPage - 2 + i, totalPages - 5 + i))
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          onClick={() => handlePageChange(pageNum)}
                          size="sm"
                        >
                          {pageNum + 1}
                        </Button>
                      )
                    })}

                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages - 1}
                      size="sm"
                    >
                      Próxima
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(totalPages - 1)}
                      disabled={currentPage >= totalPages - 1}
                      size="sm"
                    >
                      Última
                    </Button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>
    </>
  )
}
