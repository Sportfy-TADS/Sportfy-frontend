'use client'

import { useState, useEffect, useMemo } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
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
import GoalForm from '@/components/goals/GoalForm'
import GoalList from '@/components/goals/GoalList'
import { useUserData } from '@/hooks/useUserData'
import { useGoals } from '@/hooks/useGoals'
import {
  createGoal,
  getMetaEsportiva,
  updateMetaEsportiva,
  updateGoal,
  deleteGoal, // Import the deleteGoal function
} from '@/http/goals'
import { Alert } from '@/components/ui/alert' // Import the Alert component

interface MetaEsportiva {
  idMetaEsportiva: number
  titulo: string
  descricao: string
  progressoMaximo: number
  progressoItem: string
  foto: string | null
  ativo: boolean
  idModalidadeEsportiva: number
}

export default function GoalsPage() {
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingGoal, setEditingGoal] = useState<any>(null) // Certifique-se de que editingGoal é inicializado como null
  const [goalType, setGoalType] = useState('daily')
  const userData = useUserData()
  const isAdmin = userData?.role === 'ADMIN' // Assuming userData contains a role field
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

  // Add useMutation for updating MetaEsportiva
  const updateMutation = useMutation({
    mutationFn: updateMetaEsportiva,
    onSuccess: () => {
      queryClient.invalidateQueries(['metasEsportivas', userData?.idAcademico])
      toast.success('Meta esportiva atualizada com sucesso!')
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar meta esportiva:', error)
      toast.error('Erro ao atualizar meta esportiva.')
    },
  })

  // Add separate mutation for updating MetaEsportiva
  const updateMetaEsportivaMutation = useMutation({
    mutationFn: updateMetaEsportiva,
    onSuccess: () => {
      queryClient.invalidateQueries(['metasEsportivas', userData?.idAcademico])
      toast.success('Meta esportiva atualizada com sucesso!')
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar meta esportiva:', error)
      toast.error('Erro ao atualizar meta esportiva.')
    },
  })

  // Modify handleUpdateGoal to delete the goal if progressoAtual reaches progressoMaximo
  const handleUpdateGoal = async (goal: any) => {
    try {
      if (goal.isSports) {
        await updateMetaEsportivaMutation.mutateAsync({
          ...goal,
          progressoAtual: goal.progressoAtual, // Update only the progressoAtual field
        })
      } else {
        await updateGoal(goal) // Call updateGoal for daily goals
      }

      if (goal.progressoAtual >= goal.progressoMaximo) {
        // Show confirmation alert before deletion
        Alert.confirm({
          title: 'Conclusão de Meta',
          message: `
            <strong>Título:</strong> ${goal.titulo} <br>
            <strong>Objetivo:</strong> ${goal.objetivo || 'Não definido'} <br>
            <strong>Progresso:</strong> ${goal.progressoAtual} / ${goal.progressoMaximo} ${goal.progressoItem} <br>
            <strong>Situação:</strong> ${goal.situacaoMetaDiaria === 0 ? 'Pendente' : 'Concluída'}
          `,
          onConfirm: async () => {
            await deleteGoal(goal.idMetaDiaria) // Delete the goal if progressoAtual reaches progressoMaximo
            toast.success('Meta atingida e excluída com sucesso!')
            queryClient.invalidateQueries([
              'metasEsportivas',
              userData?.idAcademico,
            ]) // Invalidate queries to refresh data
            queryClient.invalidateQueries(['goals', userData?.idAcademico]) // Invalidate queries to refresh data
          },
        })
      } else {
        toast.success('Meta atualizada com sucesso!')
        queryClient.invalidateQueries([
          'metasEsportivas',
          userData?.idAcademico,
        ]) // Invalidate queries to refresh data
        queryClient.invalidateQueries(['goals', userData?.idAcademico]) // Invalidate queries to refresh data
      }
    } catch (error: any) {
      console.error(
        'Erro detalhado ao atualizar meta esportiva:',
        error.message,
      )
      toast.error(`Erro ao atualizar meta esportiva: ${error.message}`)
    }
  }

  const {
    goals,
    isLoading: isLoadingGoals,
    handleCreateGoal: originalHandleCreateGoal,
    handleDeleteGoal,
  } = useGoals(idAcademico || 0) // Ensure useGoals is always called

  useEffect(() => {
    if (isErrorMetasEsportivas) {
      console.error('Erro ao carregar metas esportivas:', errorMetasEsportivas)
      toast.error('Erro ao carregar metas esportivas.')
    }
  }, [isErrorMetasEsportivas, errorMetasEsportivas])

  const filteredMetasEsportivas = useMemo(() => {
    if (!searchTerm) return metasEsportivas
    return metasEsportivas.filter(
      (meta) => meta.titulo.toLowerCase().includes(searchTerm.toLowerCase()), // Changed 'nome' to 'titulo'
    )
  }, [metasEsportivas, searchTerm])

  const filteredGoals = goals.filter((goal: any) => {
    if (filter === 'all') return true
    return goal.situacaoMetaDiaria === (filter === 'completed' ? 1 : 0)
  })

  const handleCreateGoal = async (data: any) => {
    try {
      console.log('Creating goal with data:', data)

      // Call `originalHandleCreateGoal` with `data`
      const createdGoal = await originalHandleCreateGoal(data)

      toast.success('Meta criada com sucesso!')
    } catch (error: any) {
      console.error('Erro ao criar meta:', error)
      toast.error(`Erro ao criar meta: ${error.message}`)
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
              <h1 className="text-3xl font-bold">Metas</h1>{' '}
              {/* Add the page title */}
              <div className="flex space-x-4">
                {/* Filter for metas completas e em andamento */}
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

                {/* Filter for metas diarias e esportivas */}
                <Select onValueChange={setGoalType} defaultValue="daily">
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de Meta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Metas Diárias</SelectItem>
                    <SelectItem value="sports">Metas Esportivas</SelectItem>
                  </SelectContent>
                </Select>

                {/* Search Input */}
                <Input
                  placeholder="Buscar meta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              {/* Cadastrar Meta Button */}
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
                    } // Allow deletion only for daily goals
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
                  progressoAtual: 0, // Initialize progress
                  progressoMaximo: meta.progressoMaximo,
                  situacaoMetaDiaria: meta.ativo ? 1 : 0,
                  isSports: true, // Flag to identify sports goals
                }))}
                isLoading={isLoadingMetasEsportivas}
                onEdit={setEditingGoal}
                onDelete={undefined} // Do not allow deletion for sports goals
                userRole={userData?.role} // Pass user role
              />
            )}

            {/* Move the edit Sheet outside the goalType conditional */}
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
                    onSubmit={(data: any) => {
                      handleUpdateGoal({ ...editingGoal, ...data })
                      setEditingGoal(null)
                    }}
                    defaultValues={{
                      titulo: editingGoal.titulo,
                      descricao: editingGoal.objetivo, // Map 'objetivo' to 'descricao'
                      progressoItem: editingGoal.progressoItem,
                      progressoMaximo: editingGoal.progressoMaximo,
                      // Add other fields as necessary
                    }}
                    isEditMode={true} // Pass isEditMode prop
                  />
                </SheetContent>
              </Sheet>
            )}

            {/* Adicione Skeleton para o formulário se necessário */}
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
