'use client'

import { useState, useEffect, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
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
  SheetTrigger,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { useModalidades, useInscreverUsuario, createModalidade, updateModalidade } from '@/http/modality'
import { decodeToken } from '@/utils/apiUtils'

export interface Modalidade {
  id: number;
  idModalidadeEsportiva: number;
  nome: string;
  descricao: string;
  inscrito: boolean;
}

export default function ModalidadeInscricaoPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [modalidadeNome, setModalidadeNome] = useState('')
  const [modalidadeDescricao, setModalidadeDescricao] = useState('')
  const [modalidadeId, setModalidadeId] = useState(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      const { roles, sub } = decodeToken(token)
      console.log('Roles:', roles)
      setIsAdmin(roles.includes('ADMIN'))
      console.log('isAdmin:', roles.includes('ADMIN'))

      const userData = {
        idAcademico: 11,
        curso: 'tads',
        username: sub,
        email: 'carlos@ufpr.br',
        nome: 'thiago dos Santos',
      }
      localStorage.setItem('userData', JSON.stringify(userData))
      console.log('Dados do usuário armazenados no localStorage:', userData)
    }
  }, [])

  const { data: modalidades = [], isLoading, isError, error } = useModalidades()

  useEffect(() => {
    if (isError) {
      console.error('Erro ao carregar modalidades:', error)
    }
  }, [isError, error])

  const displayedModalidades = useMemo(() => {
    let filteredModalidades = Array.isArray(modalidades) ? [...modalidades] as Modalidade[] : []

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

  const { mutate } = useInscreverUsuario(queryClient)

  const handleCreateModalidade = async (e) => {
    e.preventDefault()
    try {
      console.log('Tentando criar modalidade com:', { nome: modalidadeNome, descricao: modalidadeDescricao })
      await createModalidade({
        nome: modalidadeNome,
        descricao: modalidadeDescricao,
      })
      toast.success('Modalidade cadastrada com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['modalidades'] })
      setIsSheetOpen(false)
    } catch (error) {
      if (error.response && error.response.status === 409) {
        toast.error('Modalidade já existe')
      } else {
        toast.error('Erro ao cadastrar modalidade')
      }
      console.error('Erro ao cadastrar modalidade:', error)
    }
  }

  const handleUpdateModalidade = async (e) => {
    e.preventDefault()
    try {
      console.log('Tentando atualizar modalidade com:', { idModalidadeEsportiva: modalidadeId, nome: modalidadeNome, descricao: modalidadeDescricao })
      await updateModalidade({
        idModalidadeEsportiva: modalidadeId,
        nome: modalidadeNome,
        descricao: modalidadeDescricao,
        foto: null,
      })
      toast.success('Modalidade atualizada com sucesso!')
      queryClient.invalidateQueries(['modalidades'])
      setIsSheetOpen(false)
    } catch (error) {
      toast.error('Erro ao atualizar modalidade')
      console.error('Erro ao atualizar modalidade:', error)
    }
  }

  const handleEditClick = (modalidade) => {
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

  return (
    <>
      <Header />
      <div className="flex min-h-screen">
        <Sidebar className="flex-none" />
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
                <Button className="bg-blue-500 hover:bg-blue-600" onClick={handleNewClick}>
                  Cadastrar Modalidade
                </Button>
              )}
            </div>
          </div>

          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{modalidadeId ? 'Editar Modalidade' : 'Cadastrar Nova Modalidade'}</SheetTitle>
              </SheetHeader>
              <form className="space-y-4 mt-4" onSubmit={modalidadeId ? handleUpdateModalidade : handleCreateModalidade}>
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
                <Button type="submit" className="w-full">
                  Salvar
                </Button>
              </form>
            </SheetContent>
          </Sheet>

          {isLoading ? (
            <Skeleton count={5} height={40} />
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
                      <Button 
                      className='mt-4'
                        onClick={() => handleEditClick(modalidade)}
                      >
                        Editar
                      </Button>
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