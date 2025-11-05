'use client'

import { useEffect, useState } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { AlertCircle, Edit, Plus, Power, RefreshCw, Save, Trash2, Wifi, WifiOff } from 'lucide-react'
import { toast } from 'sonner'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
/*
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
 */
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'

// Funções de API
interface ApoioSaude {
  idApoioSaude: number
  nome: string
  email: string
  telefone: string
  descricao: string
  dataPublicacao: string
  idAdministrador: number
  ativo: boolean
}

// Enhanced error handling function
function getErrorMessage(error: any): string {
  if (error?.message?.includes('CORS') || error?.message?.includes('fetch')) {
    return 'Problema de conexão com o servidor. Verifique se o backend está rodando na porta 8081 e configurado para aceitar requisições CORS.'
  }
  if (error?.message?.includes('404')) {
    return 'Serviço não encontrado. Verifique se o servidor está funcionando.'
  }
  if (error?.message?.includes('401')) {
    return 'Sua sessão expirou. Faça login novamente.'
  }
  if (error?.message?.includes('403')) {
    return 'Você não tem permissão para realizar esta ação.'
  }
  if (error?.message?.includes('500')) {
    return 'Erro interno do servidor. Tente novamente em alguns minutos.'
  }
  if (error?.message?.includes('NetworkError') || error?.name === 'TypeError') {
    return 'Erro de conexão. Verifique se o servidor backend está rodando e acessível.'
  }
  return error?.message || 'Ocorreu um erro inesperado. Tente novamente.'
}

async function fetchApoioSaude(): Promise<ApoioSaude[]> {
  const token = localStorage.getItem('token')
  
  if (!token) {
    throw new Error('Token de autenticação não encontrado. Faça login novamente.')
  }
  
  try {
    const response = await fetch('http://localhost:8081/apoioSaude/listar', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      mode: 'cors', // Explicitly set CORS mode
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token')
        throw new Error('Sua sessão expirou. Redirecionando para login...')
      }
      throw new Error(`Erro ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('Dados recebidos da API:', data)
    
    // The API returns a direct array, not a paginated object
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Erro detalhado:', error)
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('CORS: Erro de conexão. Verifique se o servidor backend está configurado para aceitar requisições do frontend.')
    }
    throw error
  }
}

async function createApoioSaude(data: {
  nome: string
  email: string
  telefone: string
  descricao: string
  dataPublicacao: string
  idAdministrador: number
  ativo: boolean
}): Promise<ApoioSaude> {
  const token = localStorage.getItem('token')
  
  if (!token) {
    throw new Error('Token de autenticação não encontrado.')
  }

  if (!data.nome.trim() || !data.email.trim() || !data.telefone.trim() || !data.descricao.trim()) {
    throw new Error('Todos os campos são obrigatórios.')
  }

  try {
    const response = await fetch('http://localhost:8081/apoioSaude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Erro ao cadastrar: ${errorData || response.statusText}`)
    }
    
    return response.json()
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Erro de conexão ao cadastrar apoio à saúde.')
    }
    throw error
  }
}

async function updateApoioSaude(
  id: number,
  data: {
    nome: string
    email: string
    telefone: string
    descricao: string
  },
): Promise<ApoioSaude> {
  const token = localStorage.getItem('token')
  const response = await fetch(`http://localhost:8081/apoioSaude/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Erro ao atualizar apoio à saúde')
  }
  return response.json()
}

async function deleteApoioSaude(id: number): Promise<{ success: boolean }> {
  const token = localStorage.getItem('token')
  const response = await fetch(`http://localhost:8081/apoioSaude/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    throw new Error('Erro ao deletar apoio à saúde')
  }
  return response.json()
}

async function deactivateApoioSaude(id: number): Promise<{ success: boolean }> {
  const token = localStorage.getItem('token')
  const response = await fetch(
    `http://localhost:8081/apoioSaude/desativar/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )
  if (!response.ok) {
    throw new Error('Erro ao desativar apoio à saúde')
  }
  return response.json()
}

// Add phone formatting functions
function maskPhoneNumber(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d{4,5})(\d{4})$/, '$1-$2')
}

function cleanPhone(p: string) {
  return p ? String(p).replace(/\D/g, '') : p
}

export default function ApoioSaudePage() {
  const [newApoioSaude, setNewApoioSaude] = useState({
    nome: '',
    email: '',
    telefone: '',
    descricao: '',
    dataPublicacao: new Date().toISOString(),
    idAdministrador: 1,
    ativo: true,
  })
  const [editApoioSaude, setEditApoioSaude] = useState<{
    idApoioSaude: number
    nome: string
    email: string
    telefone: string
    descricao: string
    dataPublicacao: string
    idAdministrador: number
    ativo: boolean
  } | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>('online')
  const [currentPage, setCurrentPage] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(6)
  const [searchTerm, setSearchTerm] = useState('')
  const queryClient = useQueryClient()

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

  const {
    data: apoiosSaude = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['apoiosSaude'],
    queryFn: fetchApoioSaude,
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error?.message?.includes('401') || error?.message?.includes('403')) {
        return false
      }
      return failureCount < 2
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const createMutation = useMutation({
    mutationFn: createApoioSaude,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apoiosSaude'] })
      toast.success('Apoio à saúde cadastrado com sucesso!')
      setIsSheetOpen(false)
      setNewApoioSaude({
        nome: '',
        email: '',
        telefone: '',
        descricao: '',
        dataPublicacao: new Date().toISOString(),
        idAdministrador: 1,
        ativo: true,
      })
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
      console.error('Erro ao cadastrar:', error)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (variables: {
      id: number
      data: { nome: string; email: string; telefone: string; descricao: string }
    }) => updateApoioSaude(variables.id, variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apoiosSaude'] })
      toast.success('Apoio à saúde atualizado com sucesso!')
      setIsSheetOpen(false)
      setEditApoioSaude(null)
      setNewApoioSaude({
        nome: '',
        email: '',
        telefone: '',
        descricao: '',
        dataPublicacao: new Date().toISOString(),
        idAdministrador: 1,
        ativo: true,
      })
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
      console.error('Erro ao atualizar:', error)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteApoioSaude,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apoiosSaude'] })
      toast.success('Apoio à saúde removido com sucesso!')
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
      console.error('Erro ao deletar:', error)
    },
  })

  const deactivateMutation = useMutation({
    mutationFn: deactivateApoioSaude,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apoiosSaude'] })
      toast.success('Apoio à saúde desativado com sucesso!')
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
      console.error('Erro ao desativar:', error)
    },
  })

  // Handle auth errors by redirecting to login
  useEffect(() => {
    if (isError && error?.message?.includes('401')) {
      setTimeout(() => {
        window.location.href = '/login'
      }, 3000)
    }
  }, [isError, error])

  useEffect(() => {
    if (isError) {
      console.error('Erro ao carregar apoios à saúde:', error)
      toast.error('Erro ao carregar dados dos apoios à saúde')
    }
  }, [isError, error])

  useEffect(() => {
    console.log('Estado atual - isLoading:', isLoading, 'apoiosSaude:', apoiosSaude)
    if (!isLoading) {
      if (apoiosSaude.length === 0) {
        console.warn('Nenhum apoio à saúde encontrado')
      } else {
        console.log(`${apoiosSaude.length} apoios à saúde carregados:`, apoiosSaude)
      }
    }
  }, [isLoading, apoiosSaude])

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        document.querySelector('body > nextjs-portal')?.remove()
      }, 10)
    }
  }, [])

  // Client-side filtering and pagination
  const filteredApoios = apoiosSaude.filter((apoio) =>
    apoio.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apoio.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apoio.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredApoios.length / itemsPerPage)
  const startIndex = currentPage * itemsPerPage
  const paginatedApoios = filteredApoios.slice(startIndex, startIndex + itemsPerPage)

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(0)
  }, [searchTerm])

  const handleCreateApoioSaude = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const payload = {
      ...newApoioSaude,
      telefone: cleanPhone(newApoioSaude.telefone),
    }
    createMutation.mutate(payload)
  }

  const handleUpdateApoioSaude = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (editApoioSaude) {
      updateMutation.mutate({
        id: editApoioSaude.idApoioSaude,
        data: {
          nome: newApoioSaude.nome,
          email: newApoioSaude.email,
          telefone: cleanPhone(newApoioSaude.telefone),
          descricao: newApoioSaude.descricao,
        },
      })
    }
  }

  const handleDeleteClick = (id: number) => {
    if (confirm('Tem certeza que deseja deletar este apoio à saúde?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleDeactivateClick = (id: number) => {
    if (confirm('Tem certeza que deseja desativar este apoio à saúde?')) {
      deactivateMutation.mutate(id)
    }
  }

  const handleEditClick = (apoio: ApoioSaude) => {
    setEditApoioSaude(apoio)
    setNewApoioSaude({
      nome: apoio.nome,
      email: apoio.email,
      telefone: maskPhoneNumber(apoio.telefone),
      descricao: apoio.descricao,
      dataPublicacao: apoio.dataPublicacao,
      idAdministrador: apoio.idAdministrador,
      ativo: apoio.ativo,
    })
    setIsSheetOpen(true)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedPhone = maskPhoneNumber(e.target.value)
    setNewApoioSaude({
      ...newApoioSaude,
      telefone: maskedPhone,
    })
  }

  const handleNewClick = () => {
    setEditApoioSaude(null)
    setNewApoioSaude({
      nome: '',
      email: '',
      telefone: '',
      descricao: '',
      dataPublicacao: new Date().toISOString(),
      idAdministrador: 1,
      ativo: true,
    })
    setIsSheetOpen(true)
  }

  const handleRetry = () => {
    refetch()
    toast.info('Tentando novamente...')
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

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
                      onClick={handleNewClick}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Cadastrar Apoio à Saúde
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>
                        {editApoioSaude
                          ? 'Editar Apoio à Saúde'
                          : 'Cadastrar Apoio à Saúde'}
                      </SheetTitle>
                    </SheetHeader>
                    <form
                      className="space-y-4 mt-4"
                      onSubmit={
                        editApoioSaude
                          ? handleUpdateApoioSaude
                          : handleCreateApoioSaude
                      }
                    >
                      <Input
                        placeholder="Nome"
                        value={newApoioSaude.nome}
                        onChange={(e) =>
                          setNewApoioSaude({
                            ...newApoioSaude,
                            nome: e.target.value,
                          })
                        }
                        required
                      />
                      <Input
                        placeholder="Email"
                        type="email"
                        value={newApoioSaude.email}
                        onChange={(e) =>
                          setNewApoioSaude({
                            ...newApoioSaude,
                            email: e.target.value,
                          })
                        }
                        required
                      />
                      <Input
                        placeholder="Telefone"
                        value={newApoioSaude.telefone}
                        onChange={handlePhoneChange}
                        maxLength={15}
                        required
                      />
                      <Input
                        placeholder="Descrição"
                        value={newApoioSaude.descricao}
                        onChange={(e) =>
                          setNewApoioSaude({
                            ...newApoioSaude,
                            descricao: e.target.value,
                          })
                        }
                        required
                      />
                      <Button type="submit" className="w-full">
                        <Save className="h-4 w-4 mr-2" />
                        Salvar
                      </Button>
                    </form>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Results summary */}
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

            {/* Enhanced Error State with CORS guidance */}
            {isError && (
              <div className="mb-6 p-6 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-6 w-6 text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">
                      Problema de Conexão
                    </h3>
                    <p className="text-red-700 mb-4">
                      {getErrorMessage(error)}
                    </p>
                    
                    {/* CORS-specific guidance */}
                    {(error?.message?.includes('CORS') || error?.message?.includes('Failed to fetch')) && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                        <h4 className="font-semibold text-yellow-800 mb-2">Como resolver:</h4>
                        <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
                          <li>Verifique se o servidor backend está rodando na porta 8081</li>
                          <li>Certifique-se de que o CORS está configurado no backend para aceitar requisições de http://localhost:3000</li>
                          <li>Tente acessar diretamente: <a href="http://localhost:8081/apoioSaude/listar" target="_blank" className="underline">http://localhost:8081/apoioSaude/listar</a></li>
                        </ol>
                      </div>
                    )}
                    
                    <div className="flex space-x-3">
                      <Button 
                        onClick={handleRetry}
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

            {/* Empty State */}
            {!isLoading && !isError && filteredApoios.length === 0 && !searchTerm && (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <Plus className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Nenhum apoio à saúde cadastrado
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Comece cadastrando o primeiro apoio à saúde para aparecer aqui.
                  </p>
                  <Button 
                    onClick={handleNewClick}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar Primeiro Apoio
                  </Button>
                </div>
              </div>
            )}

            {/* No search results */}
            {!isLoading && !isError && filteredApoios.length === 0 && searchTerm && (
              <div className="text-center py-16">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Nenhum resultado encontrado
                </h2>
                <p className="text-gray-600 mb-6">
                  Tente buscar com outros termos ou{' '}
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="text-blue-600 hover:underline"
                  >
                    limpe o filtro
                  </button>
                  .
                </p>
              </div>
            )}

            {/* Success State - Data Grid */}
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
                            onClick={() => handleEditClick(apoio)}
                            size="sm"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDeleteClick(apoio.idApoioSaude)}
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Deletar
                          </Button>
                          <Button
                            className="bg-yellow-500 hover:bg-yellow-600 text-white"
                            onClick={() => handleDeactivateClick(apoio.idApoioSaude)}
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

                {/* Bottom Pagination */}
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
                    
                    {/* Page numbers */}
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
