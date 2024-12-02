'use client'

import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUserIdFromToken } from '@/utils/auth' // Use auth.ts for token validation
import { toast } from 'sonner'
import { motion } from 'framer-motion'

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
import { Medal } from 'lucide-react'

interface TokenPayload {
  sub: string
  roles: string
  idUsuario: number
  iss: string
  exp: number
}

interface UserData {
  idAcademico: number
  curso: string
  username: string
  email: string
  nome: string
}

interface Modalidade {
  idModalidadeEsportiva: number
  nome: string
  descricao: string
  dataCriacao: string
  inscrito: boolean
}

function getIdAcademico(): number {
  const userDataStr = localStorage.getItem('userData')
  console.log('Dados do usuário no localStorage:', userDataStr)
  if (!userDataStr) throw new Error('Dados do usuário não encontrados')

  const userData: UserData = JSON.parse(userDataStr)
  console.log('Dados do usuário após parse:', userData)
  console.log('ID Acadêmico:', userData.idAcademico) // Added log
  return userData.idAcademico
}

function decodeToken(token: string): TokenPayload {
  const decoded = getUserIdFromToken() // Use auth.ts function
  console.log('Token decodificado:', decoded)
  return decoded
}

async function getModalidades() {
  const token = localStorage.getItem('token')
  if (!token) {
    console.error('Token não encontrado')
    throw new Error('Token não encontrado')
  }

  const idAcademico = getIdAcademico()
  console.log('Buscando modalidades para idAcademico:', idAcademico)

  const allModalidadesUrl = `${process.env.NEXT_PUBLIC_API_URL}/modalidadeEsportiva/listar`
  const inscritasUrl = `${process.env.NEXT_PUBLIC_API_URL}/modalidadeEsportiva/listar/${idAcademico}`
  console.log('URL da API para todas modalidades:', allModalidadesUrl)
  console.log('URL da API para modalidades inscritas:', inscritasUrl)

  try {
    const [allModalidadesResponse, inscritasResponse] = await Promise.all([
      fetch(allModalidadesUrl, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }),
      fetch(inscritasUrl, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }),
    ])

    console.log('Status da resposta para todas modalidades:', allModalidadesResponse.status)
    console.log('Status da resposta para modalidades inscritas:', inscritasResponse.status)

    if (!allModalidadesResponse.ok) {
      const errorText = await allModalidadesResponse.text()
      console.error('Erro na resposta da API para todas modalidades:', errorText)
      throw new Error(`Erro ao buscar todas modalidades: ${errorText}`)
    }

    if (!inscritasResponse.ok) {
      const errorText = await inscritasResponse.text()
      console.error('Erro na resposta da API para modalidades inscritas:', errorText)
      throw new Error(`Erro ao buscar modalidades inscritas: ${errorText}`)
    }

    const allModalidades = await allModalidadesResponse.json()
    const inscritas = await inscritasResponse.json()
    console.log('Dados recebidos da API para todas modalidades:', allModalidades)
    console.log('Dados recebidos da API para modalidades inscritas:', inscritas)

    // Mark modalidades as inscrito
    const modalidadesWithInscrito = allModalidades.map((modalidade: Modalidade) => ({
      ...modalidade,
      inscrito: inscritas.some(
        (inscrita: { idModalidadeEsportiva: number }) =>
          inscrita.idModalidadeEsportiva === modalidade.idModalidadeEsportiva
      ),
    }))

    return modalidadesWithInscrito
  } catch (error) {
    console.error('Erro ao buscar modalidades:', error)
    throw error
  }
}

async function inscreverUsuario(modalidadeId: number) {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('Token não encontrado')

  try {
    const idAcademico = getIdAcademico()
    console.log('Inscrevendo usuário:', { idAcademico, modalidadeId })

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/modalidadeEsportiva/inscrever/${idAcademico}/${modalidadeId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    )

    console.log('Status da resposta:', response.status)

    if (!response.ok) {
      const error = await response.text()
      console.error('Erro na resposta da API:', error)
      throw new Error(`Erro ao realizar inscrição: ${error}`)
    }

    // Handle empty response body
    const data = response.status === 204 || response.status === 200 ? null : await response.json()
    console.log('Dados recebidos da API após inscrição:', data)
    return data
  } catch (error) {
    console.error('Erro na inscrição:', error)
    throw error
  }
}

async function desinscreverUsuario(modalidadeId: number) {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('Token não encontrado')

  try {
    const idAcademico = getIdAcademico()
    console.log('Desinscrevendo usuário:', { idAcademico, modalidadeId })

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/modalidadeEsportiva/remover/${idAcademico}/${modalidadeId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    )

    console.log('Status da resposta:', response.status)

    if (!response.ok) {
      const error = await response.text()
      console.error('Erro na resposta da API:', error)
      throw new Error(`Erro ao realizar desinscrição: ${error}`)
    }

    // Handle empty response body
    const data = response.status === 204 || response.status === 200 ? null : await response.json()
    console.log('Dados recebidos da API após desinscrição:', data)
    return data
  } catch (error) {
    console.error('Erro na desinscrição:', error)
    throw error
  }
}

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

      // Retrieve idAcademico from userData instead of hard-coded value
      const userData: UserData = {
        idAcademico: getIdAcademico() || 0, // Use the function to get idAcademico
        curso: 'tads', // Replace with actual data if available
        username: sub,
        email: 'carlos@ufpr.br', // Replace with actual data if available
        nome: 'thiago dos Santos', // Replace with actual data if available
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
      toast.error('Erro ao carregar modalidades.')
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

    console.log('Applied Filters:', { filter, searchTerm })
    console.log('Displayed Modalidades:', filteredModalidades)

    return filteredModalidades
  }, [modalidades, filter, searchTerm])

  const { mutate: inscrever } = useMutation({
    mutationFn: inscreverUsuario,
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['modalidades'], (oldData: Modalidade[]) =>
        oldData.map((modalidade) =>
          modalidade.idModalidadeEsportiva === variables
            ? { ...modalidade, inscrito: true }
            : modalidade
        )
      )
      toast.success('Inscrição realizada com sucesso!')
      console.log('Inscrição realizada com sucesso:', data)
    },
    onError: (error: Error) => {
      console.error('Erro detalhado:', error)
      toast.error(`Erro ao realizar inscrição: ${error.message}`)
    },
  })

  const { mutate: desinscrever } = useMutation({
    mutationFn: desinscreverUsuario,
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['modalidades'], (oldData: Modalidade[]) =>
        oldData.map((modalidade) =>
          modalidade.idModalidadeEsportiva === variables
            ? { ...modalidade, inscrito: false }
            : modalidade
        )
      )
      toast.success('Desinscrição realizada com sucesso!')
      console.log('Desinscrição realizada com sucesso:', data)
    },
    onError: (error: Error) => {
      console.error('Erro detalhado:', error)
      toast.error(`Erro ao realizar desinscrição: ${error.message}`)
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
                <Card key={index} className="border border-blue-700">
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
                <motion.div
                  key={modalidade.idModalidadeEsportiva}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className={`border ${modalidade.inscrito ? 'border-blue-700' : 'border-red-700'}`}>
                    <CardHeader>
                      <CardTitle>
                        <Medal className={`inline-block mr-2 ${modalidade.inscrito ? 'text-blue-700' : 'text-red-700'}`} />
                        {modalidade.nome}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-2">{modalidade.descricao}</p>
                      <Button
                        onClick={() =>
                          modalidade.inscrito
                            ? desinscrever(modalidade.idModalidadeEsportiva)
                            : inscrever(modalidade.idModalidadeEsportiva)
                        }
                        className="w-full"
                      >
                        {modalidade.inscrito ? 'Desinscrever-se' : 'Inscrever-se'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
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