'use client'

import { useEffect, useState } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import GoalForm from '@/components/goals/GoalForm'
import GoalList from '@/components/goals/GoalList'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
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
  // Campos extras para metas esportivas
  idMetaEsportiva?: number;
  descricao?: string;
  idAcademico?: number;
  foto?: string | null;
  ativo?: boolean;
  idModalidadeEsportiva?: number;
}

// Define the CreateGoalData interface
interface CreateGoalData {
  titulo: string;
  descricao: string;
  progressoItem: string;
  progressoMaximo: number;
}

export default function GoalsPage() {
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [goalType, setGoalType] = useState('daily')
  const [deletedGoalIds, setDeletedGoalIds] = useState<Set<number>>(new Set()) // Rastrear metas excluídas
  const userData = useUserData()
  const queryClient = useQueryClient()
  const idAcademico = userData?.idAcademico

  const {
    data: metasEsportivas = [],
    isLoading: isLoadingMetasEsportivas,
    isError: isErrorMetasEsportivas,
    error: errorMetasEsportivas,
    refetch: refetchMetasEsportivas,
  } = useQuery({
    queryKey: ['metasEsportivas', userData?.idAcademico],
    queryFn: () => getMetaEsportiva(idAcademico!),
    enabled: !!userData?.idAcademico,
    refetchInterval: 3000, // Refetch a cada 3 segundos para maior responsividade
    refetchOnWindowFocus: true, // Refetch quando a janela receber foco
    staleTime: 0, // Dados sempre considerados stale para garantir atualizações
    gcTime: 0, // Não manter cache para forçar refetch (gcTime é a nova propriedade)
  })

  const updateMetaEsportivaMutation = useMutation({
    mutationFn: updateMetaEsportiva,
    onSuccess: () => {
      // Atualização forçada e imediata
      queryClient.invalidateQueries({ queryKey: ['metasEsportivas', idAcademico!] })
      queryClient.invalidateQueries({ queryKey: ['goals', idAcademico!] })
      queryClient.refetchQueries({ queryKey: ['metasEsportivas', idAcademico!] })
      queryClient.refetchQueries({ queryKey: ['goals', idAcademico!] })
    },
    onError: (error: unknown) => {
      console.error('Erro ao atualizar meta esportiva:', error)
      toast.error('Erro ao atualizar meta esportiva.')
    },
  })

  const deleteGoalMutation = useMutation({
    mutationFn: deleteGoal,
    onSuccess: (_, goalId) => {
      // Adicionar à lista de excluídas para filtrar imediatamente
      setDeletedGoalIds(prev => new Set([...prev, goalId]))
      
      // Atualização imediata após exclusão bem-sucedida
      queryClient.invalidateQueries({ queryKey: ['goals', idAcademico!] })
      queryClient.invalidateQueries({ queryKey: ['metasEsportivas', idAcademico!] })
      // Forçar refetch imediato
      queryClient.refetchQueries({ queryKey: ['goals', idAcademico!] })
      queryClient.refetchQueries({ queryKey: ['metasEsportivas', idAcademico!] })
      
      // Log para debug
      console.log('Meta excluída com sucesso, atualizando interface...', goalId)
      toast.success('✅ Meta excluída com sucesso!')
    },
    onError: (error: unknown) => {
      console.error('Erro ao excluir meta:', error)
      toast.error('Erro ao excluir meta.')
    },
  })

  const handleUpdateGoal = async (goal: Goal) => {
    try {
      // Validação antes de atualizar
      if (goal.progressoAtual > goal.progressoMaximo) {
        toast.error('O progresso não pode ser maior que o objetivo!')
        return
      }

      // Atualizar no servidor
      if (goal.isSports) {
        await updateMetaEsportivaMutation.mutateAsync({
          idMetaEsportiva: goal.idMetaEsportiva!,
          titulo: goal.titulo,
          descricao: goal.descricao ?? '',
          progressoAtual: goal.progressoAtual,
          progressoMaximo: goal.progressoMaximo,
          progressoItem: goal.progressoItem,
          idAcademico: goal.idAcademico!,
          foto: goal.foto,
          ativo: goal.ativo,
          idModalidadeEsportiva: goal.idModalidadeEsportiva,
        })
      } else {
        await updateGoal({ ...goal, idAcademico: idAcademico! })
        // Atualização imediata para metas diárias
        queryClient.invalidateQueries({ queryKey: ['goals', idAcademico!] })
        queryClient.refetchQueries({ queryKey: ['goals', idAcademico!] })
      }

      // Verificar se meta foi atingida
      if (goal.progressoAtual >= goal.progressoMaximo) {
        // Adicionar à lista de excluídas IMEDIATAMENTE para remover da interface
        setDeletedGoalIds(prev => new Set([...prev, goal.idMetaDiaria]))
        
        // Fechar modal imediatamente
        setEditingGoal(null)
        toast.success('🎉 Meta atingida! Excluindo...')
        
        console.log('Meta atingida, iniciando exclusão:', goal.idMetaDiaria)
        
        // Exclusão no servidor
        try {
          await deleteGoalMutation.mutateAsync(goal.idMetaDiaria)
          console.log('Exclusão completada com sucesso')
        } catch (error) {
          console.error('Erro na exclusão automática:', error)
          // Remover da lista de excluídas se falhou
          setDeletedGoalIds(prev => {
            const newSet = new Set(prev)
            newSet.delete(goal.idMetaDiaria)
            return newSet
          })
          toast.error('Erro ao excluir meta automaticamente')
        }
      } else {
        toast.success('✅ Meta atualizada!')
        // Forçar atualização imediata de todas as queries
        queryClient.invalidateQueries({ queryKey: ['goals', idAcademico!] })
        queryClient.invalidateQueries({ queryKey: ['metasEsportivas', idAcademico!] })
        queryClient.refetchQueries({ queryKey: ['goals', idAcademico!] })
        queryClient.refetchQueries({ queryKey: ['metasEsportivas', idAcademico!] })
      }
    } catch (error: unknown) {
      console.error('Erro ao atualizar meta:', error)
      toast.error(`Erro ao atualizar meta: ${(error as Error).message}`)
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

  // Atualização automática quando idAcademico mudar
  useEffect(() => {
    if (idAcademico) {
      queryClient.invalidateQueries({ queryKey: ['goals', idAcademico] })
      queryClient.invalidateQueries({ queryKey: ['metasEsportivas', idAcademico] })
    }
  }, [idAcademico, queryClient])

  // Forçar refetch quando mudar tipo de meta
  useEffect(() => {
    if (idAcademico) {
      if (goalType === 'sports') {
        refetchMetasEsportivas()
      } else {
        queryClient.invalidateQueries({ queryKey: ['goals', idAcademico] })
      }
    }
  }, [goalType, idAcademico, queryClient, refetchMetasEsportivas])

  const filteredGoals = ((goals as unknown) as Goal[])
    .filter((goal: Goal) => !deletedGoalIds.has(goal.idMetaDiaria)) // Filtrar metas excluídas
    .filter((goal: Goal) => {
      // Filtro por situação
      const matchesFilter = filter === 'all' || goal.situacaoMetaDiaria === (filter === 'completed' ? 1 : 0)
      
      // Filtro por termo de busca
      const matchesSearch = searchTerm === '' || 
        goal.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goal.objetivo.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesFilter && matchesSearch
    })

  // Filtrar metas esportivas também
  const filteredSportsGoals = (metasEsportivas as any[])
    .map((meta: any) => ({
      idMetaDiaria: meta.idMetaEsportiva,
      titulo: meta.titulo,
      objetivo: meta.descricao,
      progressoItem: meta.progressoItem,
      progressoAtual: 0,
      progressoMaximo: meta.progressoMaximo,
      situacaoMetaDiaria: meta.ativo ? 1 : 0,
      isSports: true,
      // Preservar campos necessários para updateMetaEsportiva
      idMetaEsportiva: meta.idMetaEsportiva,
      descricao: meta.descricao,
      idAcademico: meta.idAcademico,
      foto: meta.foto,
      ativo: meta.ativo,
      idModalidadeEsportiva: meta.idModalidadeEsportiva,
    }))
    .filter((goal: Goal) => !deletedGoalIds.has(goal.idMetaDiaria)) // Filtrar metas excluídas
    .filter((goal: Goal) => {
      const matchesFilter = filter === 'all' || goal.situacaoMetaDiaria === (filter === 'completed' ? 1 : 0)
      const matchesSearch = searchTerm === '' || 
        goal.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goal.objetivo.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesFilter && matchesSearch
    })

  const handleCreateGoal = async (data: CreateGoalData) => {
    try {
      console.log('Creating goal with data:', data)
      await originalHandleCreateGoal(data)
      
      // Atualização forçada e imediata após criação
      queryClient.invalidateQueries({ queryKey: ['goals', idAcademico!] })
      queryClient.invalidateQueries({ queryKey: ['metasEsportivas', idAcademico!] })
      queryClient.refetchQueries({ queryKey: ['goals', idAcademico!] })
      queryClient.refetchQueries({ queryKey: ['metasEsportivas', idAcademico!] })
      
      toast.success('✅ Meta criada com sucesso!')
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
        <Sidebar />
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
                          <Skeleton className="w-1/2 h-6 mb-2" />
                        </CardHeader>
                        <CardContent>
                          <Skeleton
                            className="w-full h-4 mb-2"
                          />
                          <Skeleton className="w-3/4 h-4" />
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
                goals={filteredSportsGoals}
                isLoading={isLoadingMetasEsportivas}
                onEdit={setEditingGoal}
                onDelete={undefined}
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
