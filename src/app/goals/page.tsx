'use client'

import { useEffect, useState } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import GoalForm from '@/components/goals/GoalForm'
import GoalList from '@/components/goals/GoalList'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
import { useGoals } from '@/hooks/useGoals'
import { useUserData } from '@/hooks/useUserData'
import {
  deleteGoal,
  getMetaEsportiva,
  updateGoal,
  updateMetaEsportiva,
} from '@/http/goals'

// Adicione esta definição de interface
interface Goal {
  idMetaDiaria: number;
  titulo: string;
  objetivo: string;
  progressoItem: string;
  progressoAtual: number;
  progressoMaximo: number;
  situacaoMetaDiaria: number;
  isSports?: boolean;
}

export default function GoalsPage() {
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [goalType, setGoalType] = useState('daily')
  const userData = useUserData()
  const queryClient = useQueryClient()
  const idAcademico = userData?.idAcademico

  const {
    data: metasEsportivas = [],
    isLoading: isLoadingMetasEsportivas,
    isError: isErrorMetasEsportivas,
    error: errorMetasEsportivas,
  } = useQuery({
    queryKey: ['metasEsportivas', userData?.idAcademico],
    queryFn: () => getMetaEsportiva(userData?.idAcademico),
    enabled: !!userData?.idAcademico,
  })

  const updateMetaEsportivaMutation = useMutation({
    mutationFn: updateMetaEsportiva,
    onSuccess: () => {
      queryClient.invalidateQueries(['metasEsportivas', idAcademico!])
      toast.success('Meta esportiva atualizada com sucesso!')
    },
    onError: (error: unknown) => {
      console.error('Erro ao atualizar meta esportiva:', error)
      toast.error('Erro ao atualizar meta esportiva.')
    },
  })

  const handleUpdateGoal = async (goal: Goal) => {
    try {
      if (goal.isSports) {
        await updateMetaEsportivaMutation.mutateAsync({
          ...goal,
          progressoAtual: goal.progressoAtual,
        })
      } else {
        await updateGoal(goal)
      }

      if (goal.progressoAtual >= goal.progressoMaximo) {
        Alert.confirm({
          title: 'Conclus��o de Meta',
          message: `
            <strong>Título:</strong> ${goal.titulo} <br>
            <strong>Objetivo:</strong> ${goal.objetivo || 'Não definido'} <br>
            <strong>Progresso:</strong> ${goal.progressoAtual} / ${goal.progressoMaximo} ${goal.progressoItem} <br>
            <strong>Situação:</strong> ${goal.situacaoMetaDiaria === 0 ? 'Pendente' : 'Concluída'}
          `,
          onConfirm: async () => {
            await deleteGoal(goal.idMetaDiaria)
            toast.success('Meta atingida e excluída com sucesso!')
            queryClient.invalidateQueries([
              'metasEsportivas',
              idAcademico!,
            ])
            queryClient.invalidateQueries(['goals', idAcademico!])
          },
        })
      } else {
        toast.success('Meta atualizada com sucesso!')
        queryClient.invalidateQueries([
          'metasEsportivas',
          idAcademico!,
        ])
        queryClient.invalidateQueries(['goals', idAcademico!])
      }
    } catch (error: unknown) {
      console.error(
        'Erro detalhado ao atualizar meta esportiva:',
        (error as Error).message,
      )
      toast.error(
        `Erro ao atualizar meta esportiva: ${(error as Error).message}`,
      )
    }
  }

  const {
    goals,
    isLoading: isLoadingGoals,
    handleCreateGoal: originalHandleCreateGoal,
    handleDeleteGoal,
  } = useGoals(idAcademico || 0)

  useEffect(() => {
    if (isErrorMetasEsportivas) {
      console.error('Erro ao carregar metas esportivas:', errorMetasEsportivas)
      toast.error('Erro ao carregar metas esportivas.')
    }
  }, [isErrorMetasEsportivas, errorMetasEsportivas])

  const filteredGoals = goals.filter((goal: Goal) => {
    if (filter === 'all') return true
    return goal.situacaoMetaDiaria === (filter === 'completed' ? 1 : 0)
  })

  const handleCreateGoal = async (data: CreateGoalData) => {
    try {
      console.log('Creating goal with data:', data)
      await originalHandleCreateGoal(data)
      toast.success('Meta criada com sucesso!')
    } catch (error: unknown) {
      console.error('Erro ao criar meta:', error)
      toast.error(`Erro ao criar meta: ${(error as Error).message}`)
    }
  }

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        document.querySelector('body > nextjs-portal')?.remove()
      }, 10)
    }
  }, [])

  return (
    <>
      <Header />
      <div className="flex h-screen">
        <Sidebar className="flex-none" />
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Metas</h1>
              <div className="flex space-x-4">
                <Select onValueChange={setFilter} defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar Situação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="completed">Completas</SelectItem>
                    <SelectItem value="in_progress">Em andamento</SelectItem>
                  </SelectContent>
                </Select>
                <Select onValueChange={setGoalType} defaultValue="daily">
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de Meta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Metas Diárias</SelectItem>
                    <SelectItem value="sports">Metas Esportivas</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Buscar meta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
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
                  <GoalForm onSubmit={handleCreateGoal} />
                </SheetContent>
              </Sheet>
            </div>

            {goalType === 'daily' ? (
              <>
                {isLoadingGoals ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Card
                        key={index}
                        className="p-4 border border-amber-300 rounded-md shadow-sm"
                      >
                        <CardHeader>
                          <Skeleton variant="text" className="w-1/2 h-6 mb-2" />
                        </CardHeader>
                        <CardContent>
                          <Skeleton
                            variant="text"
                            className="w-full h-4 mb-2"
                          />
                          <Skeleton variant="text" className="w-3/4 h-4" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <GoalList
                    goals={filteredGoals}
                    isLoading={isLoadingGoals}
                    onEdit={setEditingGoal}
                    onDelete={
                      goalType === 'daily' ? handleDeleteGoal : undefined
                    }
                  />
                )}
              </>
            ) : (
              <GoalList
                goals={metasEsportivas.map((meta) => ({
                  idMetaDiaria: meta.idMetaEsportiva,
                  titulo: meta.titulo,
                  objetivo: meta.descricao,
                  progressoItem: meta.progressoItem,
                  progressoAtual: 0,
                  progressoMaximo: meta.progressoMaximo,
                  situacaoMetaDiaria: meta.ativo ? 1 : 0,
                  isSports: true,
                }))}
                isLoading={isLoadingMetasEsportivas}
                onEdit={setEditingGoal}
                onDelete={undefined}
                userRole={userData?.role}
              />
            )}

            {editingGoal && (
              <Sheet
                open={Boolean(editingGoal)}
                onOpenChange={(open) => {
                  if (!open) setEditingGoal(null)
                }}
              >
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Editar Meta</SheetTitle>
                  </SheetHeader>
                  <GoalForm
                    onSubmit={(data: CreateGoalData) => {
                      handleUpdateGoal({ ...editingGoal, ...data })
                      setEditingGoal(null)
                    }}
                    defaultValues={{
                      titulo: editingGoal.titulo,
                      descricao: editingGoal.objetivo,
                      progressoItem: editingGoal.progressoItem,
                      progressoMaximo: editingGoal.progressoMaximo,
                    }}
                    isEditMode={true}
                  />
                </SheetContent>
              </Sheet>
            )}

            {isLoadingMetasEsportivas && (
              <Sheet open={false}>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Editar Meta</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-4">
                    <Skeleton className="w-full h-6" />
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-full h-4" />
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
