'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { useForm } from 'react-hook-form'
import { toast, Toaster } from 'sonner'
import { z } from 'zod'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'

// Função para obter o idAcademico
async function getUserData(userId: number) {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/academico/consultar/${userId}`,
  )
  if (response.status !== 200) throw new Error('Erro ao obter dados do usuário')
  return response.data
}

// Função API para buscar metas
async function getGoals(idAcademico: number) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/metaDiaria/listar/${idAcademico}`,
  )
  if (!response.ok) throw new Error('Erro ao buscar metas')
  return await response.json()
}

// Função API para criar uma nova meta
async function createGoal(data: {
  titulo: string
  objetivo: string
  quantidadeConcluida: number
  progressoAtual: number
  progressoMaximo: number
  progressoItem: string
  idAcademico: number
  situacaoMetaDiaria: number
}) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/metaDiaria`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
  )
  if (!response.ok) throw new Error('Erro ao criar meta')
  return await response.json()
}

// Função API para excluir uma meta
async function deleteGoal(idMetaDiaria: number) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/metaDiaria/deletar`,
    {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idMetaDiaria }),
    },
  )
  if (!response.ok) throw new Error('Erro ao deletar meta')
}

// Função API para atualizar uma meta
async function updateGoal(data: {
  idMetaDiaria: number
  titulo: string
  objetivo: string
  quantidadeConcluida: number
  progressoAtual: number
  progressoMaximo: number
  progressoItem: string
  idAcademico: number
  situacaoMetaDiaria: number
}) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/metaDiaria`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
  )
  if (!response.ok) throw new Error('Erro ao atualizar meta')
  return await response.json()
}

// Zod schema para validação de formulário
const createGoalSchema = z.object({
  titulo: z.string().min(1, 'Informe a atividade que deseja praticar'),
  objetivo: z.string().min(1, 'Informe o objetivo da meta'),
  progressoMaximo: z.coerce
    .number()
    .min(1, 'Informe o progresso máximo para a meta'),
})

type CreateGoalSchema = z.infer<typeof createGoalSchema>

export default function GoalsPage() {
  const [filter, setFilter] = useState('all')
  const [idDoUsuarioLogado, setIdDoUsuarioLogado] = useState<number | null>(
    null,
  )
  const [idAcademico, setIdAcademico] = useState<number | null>(null)
  const [editingGoal, setEditingGoal] = useState<any>(null)
  const queryClient = useQueryClient()
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      console.error('Erro: Nenhum usuário logado encontrado no localStorage')
      toast.error('Usuário não está logado.')
      router.push('/auth')
      return
    }

    const loadUserData = async () => {
      try {
        const decodedToken: any = jwtDecode(token)
        console.log('Token decodificado:', decodedToken)

        const userId = decodedToken.idAcademico || decodedToken.idUsuario

        // Obter dados do usuário
        const userData = await getUserData(userId)
        console.log('Dados do usuário:', userData)

        setIdDoUsuarioLogado(userId)
        setIdAcademico(userData.idAcademico)
      } catch (error) {
        console.error('Erro ao obter dados do usuário:', error)
        toast.error('Erro ao obter dados do usuário. Faça login novamente.')
        router.push('/auth')
      }
    }

    loadUserData()
  }, [router])

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals', idAcademico],
    queryFn: () => getGoals(idAcademico as number),
    enabled: idAcademico !== null,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateGoalSchema>({
    resolver: zodResolver(createGoalSchema),
  })

  // Formulário de edição
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: errorsEdit },
    reset: resetEdit,
  } = useForm<CreateGoalSchema>({
    resolver: zodResolver(createGoalSchema),
  })

  const handleCreateGoal = async (data: CreateGoalSchema) => {
    try {
      const goalData = {
        ...data,
        quantidadeConcluida: 0,
        progressoAtual: 0,
        progressoItem: 'Kilômetros',
        idAcademico: idAcademico as number,
        situacaoMetaDiaria: 0,
      }

      console.log('Dados para criar meta:', goalData)

      await createGoal(goalData)
      reset()
      queryClient.invalidateQueries({ queryKey: ['goals', idAcademico] })
      toast.success('Meta criada com sucesso!')
    } catch (error) {
      console.error('Erro ao criar a meta:', error)
      toast.error('Erro ao criar a meta')
    }
  }

  const handleDeleteGoal = async (idMetaDiaria: number) => {
    try {
      await deleteGoal(idMetaDiaria)
      queryClient.invalidateQueries({ queryKey: ['goals', idAcademico] })
      toast.success('Meta excluída com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir a meta:', error)
      toast.error('Erro ao excluir a meta')
    }
  }

  const handleSubmitEditGoal = handleSubmitEdit(
    async (data: CreateGoalSchema) => {
      if (!editingGoal) return

      try {
        const updatedGoal = {
          ...editingGoal,
          ...data,
          idAcademico: idAcademico as number,
        }

        console.log('Dados para atualizar meta:', updatedGoal)

        await updateGoal(updatedGoal)
        resetEdit()
        setEditingGoal(null)
        queryClient.invalidateQueries({ queryKey: ['goals', idAcademico] })
        toast.success('Meta atualizada com sucesso!')
      } catch (error) {
        console.error('Erro ao atualizar a meta:', error)
        toast.error('Erro ao atualizar a meta')
      }
    },
  )

  const filteredGoals = goals.filter((goal: any) => {
    if (filter === 'all') return true
    return goal.situacaoMetaDiaria === (filter === 'completed' ? 1 : 0)
  })

  return (
    <>
      <Header />
      <Toaster richColors />
      <div className="flex h-screen">
        <Sidebar className="flex-none" />
        <div className="container mx-auto p-4 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Metas Diárias</h1>
            <div className="flex space-x-4">
              <Select onValueChange={setFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="completed">Concluídas</SelectItem>
                  <SelectItem value="in_progress">Em andamento</SelectItem>
                </SelectContent>
              </Select>

              <Sheet>
                <SheetTrigger asChild>
                  <Button className="bg-blue-500 hover:bg-blue-600">
                    Cadastrar Meta
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Cadastrar Meta</SheetTitle>
                  </SheetHeader>
                  <form
                    onSubmit={handleSubmit(handleCreateGoal)}
                    className="space-y-4 mt-8"
                  >
                    <div>
                      <Label htmlFor="titulo">Atividade</Label>
                      <Input
                        id="titulo"
                        placeholder="Praticar exercícios..."
                        {...register('titulo')}
                      />
                      {errors.titulo && (
                        <p className="text-red-500">{errors.titulo.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="objetivo">Objetivo</Label>
                      <Input
                        id="objetivo"
                        placeholder="Correr 5 km todos os dias..."
                        {...register('objetivo')}
                      />
                      {errors.objetivo && (
                        <p className="text-red-500">
                          {errors.objetivo.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="progressoMaximo">Progresso Máximo</Label>
                      <Input
                        id="progressoMaximo"
                        type="number"
                        placeholder="5"
                        {...register('progressoMaximo')}
                      />
                      {errors.progressoMaximo && (
                        <p className="text-red-500">
                          {errors.progressoMaximo.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-green-500 hover:bg-green-600"
                    >
                      Salvar Meta
                    </Button>
                  </form>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isLoading ? (
              <>
                <Skeleton />
                <Skeleton />
                <Skeleton />
                <Skeleton />
              </>
            ) : filteredGoals.length ? (
              filteredGoals.map((goal: any) => (
                <Card key={goal.idMetaDiaria}>
                  <CardHeader>
                    <CardTitle>{goal.titulo}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Objetivo: {goal.objetivo}</p>
                    <p>
                      Progresso: {goal.quantidadeConcluida}/
                      {goal.progressoMaximo} {goal.progressoItem}
                    </p>
                    <p>
                      Status:{' '}
                      {goal.situacaoMetaDiaria === 1
                        ? 'Concluída'
                        : 'Em andamento'}
                    </p>
                    <div className="flex space-x-2 mt-2">
                      <Button
                        onClick={() => setEditingGoal(goal)}
                        className="bg-yellow-500 hover:bg-yellow-600"
                      >
                        Editar
                      </Button>
                      <Button
                        onClick={() => handleDeleteGoal(goal.idMetaDiaria)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p>Não há metas cadastradas.</p>
            )}
          </div>

          {/* Formulário de Edição */}
          {editingGoal && (
            <Sheet
              open={Boolean(editingGoal)}
              onOpenChange={() => setEditingGoal(null)}
            >
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Editar Meta</SheetTitle>
                </SheetHeader>
                <form
                  onSubmit={handleSubmitEditGoal}
                  className="space-y-4 mt-8"
                >
                  <div>
                    <Label htmlFor="titulo">Atividade</Label>
                    <Input
                      id="titulo"
                      defaultValue={editingGoal.titulo}
                      {...registerEdit('titulo')}
                    />
                    {errorsEdit.titulo && (
                      <p className="text-red-500">
                        {errorsEdit.titulo.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="objetivo">Objetivo</Label>
                    <Input
                      id="objetivo"
                      defaultValue={editingGoal.objetivo}
                      {...registerEdit('objetivo')}
                    />
                    {errorsEdit.objetivo && (
                      <p className="text-red-500">
                        {errorsEdit.objetivo.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="progressoMaximo">Progresso Máximo</Label>
                    <Input
                      id="progressoMaximo"
                      type="number"
                      defaultValue={editingGoal.progressoMaximo}
                      {...registerEdit('progressoMaximo')}
                    />
                    {errorsEdit.progressoMaximo && (
                      <p className="text-red-500">
                        {errorsEdit.progressoMaximo.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-green-500 hover:bg-green-600"
                  >
                    Salvar Alterações
                  </Button>
                </form>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </>
  )
}
