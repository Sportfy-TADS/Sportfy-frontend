'use client'

import { useEffect, useMemo, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import {
    createModalidade,
    Modalidade,
    updateModalidade,
    useModalidades,
} from '@/http/modality'
import { decodeToken } from '@/utils/apiUtils'

export default function ModalidadeInscricaoPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [modalidadeNome, setModalidadeNome] = useState('')
  const [modalidadeDescricao, setModalidadeDescricao] = useState('')
  const [modalidadeId, setModalidadeId] = useState<number | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      const { roles } = decodeToken(token)
      setIsAdmin(roles.includes('ADMIN'))
    }
  }, [])

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        document.querySelector('body > nextjs-portal')?.remove()
      }, 10)
    }
  }, [])

  const { data: modalidades = [], isLoading, isError, error } = useModalidades()

  useEffect(() => {
    if (isError) {
      console.error('Erro ao carregar modalidades:', error)
    }
  }, [isError, error])

  const displayedModalidades = useMemo(() => {
    let filteredModalidades = Array.isArray(modalidades)
      ? ([...modalidades] as Modalidade[])
      : []

    if (filter === 'inscrito') {
      filteredModalidades = filteredModalidades.filter(
        (modalidade) => modalidade.inscrito,
      )
    } else if (filter === 'nao_inscrito') {
      filteredModalidades = filteredModalidades.filter(
        (modalidade) => !modalidade.inscrito,
      )
    }

    if (searchTerm) {
      filteredModalidades = filteredModalidades.filter((modalidade) =>
        modalidade.nome.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    return filteredModalidades
  }, [modalidades, filter, searchTerm])

  interface CreateModalidadeData {
    nome: string
    descricao: string
  }

  interface CreateModalidadeError {
    response?: {
      status: number
    }
  }

  const handleCreateModalidade = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault()
    try {
      await createModalidade({
        nome: modalidadeNome,
        descricao: modalidadeDescricao,
      } as CreateModalidadeData)
      toast.success('Modalidade cadastrada com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['modalidades'] })
      setIsSheetOpen(false)
    } catch (error) {
      const err = error as CreateModalidadeError
      if (err.response && err.response.status === 409) {
        toast.error('Modalidade já existe')
      } else {
        toast.error('Erro ao cadastrar modalidade')
      }
    }
  }

  const handleUpdateModalidade = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault()
    try {
      if (modalidadeId !== null) {
        await updateModalidade({
          idModalidadeEsportiva: modalidadeId!,
          nome: modalidadeNome,
          descricao: modalidadeDescricao,
          dataCriacao: new Date().toISOString(), // Add the dataCriacao property
          inscrito: false,
        })
      } else {
        toast.error('ID da modalidade é inválido')
      }
      toast.success('Modalidade atualizada com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['modalidades'] })
      setIsSheetOpen(false)
    } catch (error) {
      toast.error('Erro ao atualizar modalidade')
    }
  }

  interface ModalidadeEdit {
    idModalidadeEsportiva: number
    nome: string
    descricao: string
  }

  const handleEditClick = (modalidade: ModalidadeEdit) => {
    setModalidadeId(modalidade.idModalidadeEsportiva)
    setModalidadeNome(modalidade.nome)
    setModalidadeDescricao(modalidade.descricao)
    setIsSheetOpen(true)
  }

  const handleNewClick = () => {
    setModalidadeId(null)
    setModalidadeNome('')
    setModalidadeDescricao('')
    setIsSheetOpen(true)
  }

  async function deactivateModalidade(idModalidadeEsportiva: number) {
    const token = localStorage.getItem('token')
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/modalidadeEsportiva/desativar/${idModalidadeEsportiva}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    )
    if (!res.ok) throw new Error('Erro ao desativar modalidade.')
    return await res.json()
  }

  const handleDeactivateModalidade = async (idModalidadeEsportiva: number) => {
    try {
      await deactivateModalidade(idModalidadeEsportiva)
      toast.success('Modalidade desativada com sucesso.')
      queryClient.invalidateQueries({ queryKey: ['modalidades'] })
    } catch (error) {
      toast.error('Erro ao desativar modalidade.')
    }
  }

  return (
    <>
      <Header />
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="container mx-auto p-4 flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Modalidades</h1>
            <div className="flex space-x-4">
              <Select onValueChange={setFilter} defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="inscrito">Inscritas</SelectItem>
                  <SelectItem value="nao_inscrito">Não inscritas</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Buscar modalidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
              {isAdmin && (
                <Button
                  className="bg-blue-500 hover:bg-blue-600"
                  onClick={handleNewClick}
                >
                  Cadastrar Modalidade
                </Button>
              )}
            </div>
          </div>

          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>
                  {modalidadeId
                    ? 'Editar Modalidade'
                    : 'Cadastrar Nova Modalidade'}
                </SheetTitle>
              </SheetHeader>
              <form
                className="space-y-4 mt-4"
                onSubmit={
                  modalidadeId ? handleUpdateModalidade : handleCreateModalidade
                }
              >
                <Input
                  placeholder="Nome da Modalidade"
                  value={modalidadeNome}
                  onChange={(e) => setModalidadeNome(e.target.value)}
                  required
                />
                <Input
                  placeholder="Descrição"
                  value={modalidadeDescricao}
                  onChange={(e) => setModalidadeDescricao(e.target.value)}
                  required
                />
                {/* Campo de foto escondido por enquanto */}
                <input type="hidden" value={''} />
                <Button type="submit" className="w-full">
                  Salvar
                </Button>
              </form>
            </SheetContent>
          </Sheet>

          {isLoading ? (
            <Skeleton />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedModalidades.map((modalidade) => (
                <Card key={modalidade.idModalidadeEsportiva}>
                  <CardHeader>
                    <CardTitle>{modalidade.nome}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{modalidade.descricao}</p>
                    {isAdmin && (
                      <>
                        <Button
                          className="mt-4"
                          onClick={() => handleEditClick(modalidade)}
                        >
                          Editar
                        </Button>
                        <Button
                          className="mt-4 ml-2 bg-red-500 hover:bg-red-600"
                          onClick={() =>
                            handleDeactivateModalidade(
                              modalidade.idModalidadeEsportiva,
                            )
                          }
                        >
                          Desativar
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
