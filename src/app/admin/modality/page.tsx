'use client'

import { useState, useEffect, useMemo } from 'react'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
import { getModalidades, inscreverUsuario } from '@/http/modality'
import { decodeToken, getIdAcademico } from '@/utils/apiUtils'

export default function ModalidadeInscricaoPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const queryClient = useQueryClient()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      const { roles, sub, idUsuario } = decodeToken(token)
      setIsAdmin(roles === 'ADMIN')

      // Simulação de armazenamento de dados do usuário no localStorage
      const userData = {
        idAcademico: 11, // Substitua pelo valor correto
        curso: 'tads', // Substitua pelo valor correto
        username: sub,
        email: 'carlos@ufpr.br', // Substitua pelo valor correto
        nome: 'thiago dos Santos', // Substitua pelo valor correto
      }
      localStorage.setItem('userData', JSON.stringify(userData))
      console.log('Dados do usuário armazenados no localStorage:', userData)
    }
  }, [])

  const {
    data: modalidades = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['modalidades'],
    queryFn: getModalidades,
    onSuccess: (data) => {
      console.log('Modalidades carregadas com sucesso:', data)
    },
    onError: (error) => {
      console.error('Erro ao carregar modalidades:', error)
    },
  })

  useEffect(() => {
    if (isError) {
      console.error('Erro ao carregar modalidades:', error)
    }
  }, [isError, error])

  const displayedModalidades = useMemo(() => {
    let filteredModalidades = [...modalidades]

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

  const { mutate } = useMutation({
    mutationFn: inscreverUsuario,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['modalidades'])
      toast.success('Inscrição realizada com sucesso!')
      console.log('Inscrição realizada com sucesso:', data)
    },
    onError: (error: Error) => {
      console.error('Erro detalhado:', error)
      toast.error(`Erro ao realizar inscrição: ${error.message}`)
    },
  })

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
            </div>
          </div>

          {isAdmin && (
            <div className="mb-6">
              <Sheet>
                <SheetTrigger asChild>
                  <Button className="bg-blue-500 hover:bg-blue-600">
                    Cadastrar Modalidade
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Cadastrar Nova Modalidade</SheetTitle>
                  </SheetHeader>
                  <form className="space-y-4 mt-4">
                    <Input placeholder="Nome da Modalidade" required />
                    <Input placeholder="Descrição" required />
                    <Button type="submit" className="w-full">
                      Salvar
                    </Button>
                  </form>
                </SheetContent>
              </Sheet>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-8 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : displayedModalidades.length ? (
              displayedModalidades.map((modalidade) => (
                <Card key={modalidade.idModalidadeEsportiva}>
                  <CardHeader>
                    <CardTitle>{modalidade.nome}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-2">{modalidade.descricao}</p>
                    <Button
                      onClick={() => mutate(modalidade.idModalidadeEsportiva)}
                      className="w-full"
                      disabled={modalidade.inscrito}
                    >
                      {modalidade.inscrito ? 'Inscrito' : 'Inscrever-se'}
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center col-span-full">
                Nenhuma modalidade disponível.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
