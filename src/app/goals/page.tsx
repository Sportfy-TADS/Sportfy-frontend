'use client'

import { useState, useEffect, useMemo } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
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
import {Skeleton} from '@/components/ui/skeleton'
import { Medal } from 'lucide-react'
import GoalForm from '@/components/goals/GoalForm'
import GoalList from '@/components/goals/GoalList'
import { useUserData } from '@/hooks/useUserData'
import { useGoals } from '@/hooks/useGoals'

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

async function getMetaEsportiva(idAcademico: number) {
  const response = await fetch(`http://localhost:8081/modalidadeEsportiva/listar/${idAcademico}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (!response.ok) {
    throw new Error('Erro ao buscar modalidades esportivas')
  }
  const modalidades = await response.json()
  const metasPromises = modalidades.map((modalidade: any) =>
    fetch(`http://localhost:8081/modalidadeEsportiva/metaEsportiva/listar/${modalidade.idModalidadeEsportiva}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res) => res.json())
  )
  const metasEsportivas = await Promise.all(metasPromises)
  return metasEsportivas.flat()
}

export default function GoalsPage() {
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingGoal, setEditingGoal] = useState<any>(null)
  const [goalType, setGoalType] = useState('daily')
  const userData = useUserData()
  const isAdmin = userData?.role === 'ADMIN' // Assuming userData contains a role field
  const queryClient = useQueryClient()

  const { data: metasEsportivas = [], isLoading: isLoadingMetasEsportivas, isError: isErrorMetasEsportivas, error: errorMetasEsportivas } = useQuery({
    queryKey: ['metasEsportivas', userData?.idAcademico],
    queryFn: () => getMetaEsportiva(userData?.idAcademico),
    enabled: !!userData?.idAcademico,
  })

  // Move updateMetaEsportiva inside the component
  const updateMetaEsportiva = async (meta: MetaEsportiva) => {
    const token = userData?.token // Ensure you have access to the user's token
    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetch(`http://localhost:8081/modalidadeEsportiva/metaEsportiva/${meta.idMetaEsportiva}`, {
      method: 'PUT', // Use PUT or PATCH based on API specification
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Include Authorization header
      },
      body: JSON.stringify(meta),
    });

    if (!response.ok) {
      const errorDetails = await response.text(); // Get detailed error message
      console.error('Resposta de erro da API:', errorDetails);
      throw new Error(`Erro ao atualizar Meta Esportiva: ${errorDetails}`);
    }

    return response.json();
  };

  // Add useMutation for updating MetaEsportiva
  const updateMutation = useMutation({
    mutationFn: updateMetaEsportiva,
    onSuccess: () => {
      queryClient.invalidateQueries(['metasEsportivas', userData?.idAcademico]);
      toast.success('Meta esportiva atualizada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar meta esportiva:', error);
      toast.error('Erro ao atualizar meta esportiva.');
    },
  });

  // Modify handleUpdateGoal to catch and log detailed errors
  const handleUpdateGoal = async (meta: MetaEsportiva) => {
    try {
      await updateMutation.mutateAsync(meta);
    } catch (error: any) {
      console.error('Erro detalhado ao atualizar meta esportiva:', error.message);
      toast.error(`Erro ao atualizar meta esportiva: ${error.message}`);
    }
  };

  const {
    goals,
    isLoading: isLoadingGoals,
    handleCreateGoal,
    handleDeleteGoal,
  } = useGoals(userData?.idAcademico)

  useEffect(() => {
    if (isErrorMetasEsportivas) {
      console.error('Erro ao carregar metas esportivas:', errorMetasEsportivas)
      toast.error('Erro ao carregar metas esportivas.')
    }
  }, [isErrorMetasEsportivas, errorMetasEsportivas])

  const filteredMetasEsportivas = useMemo(() => {
    if (!searchTerm) return metasEsportivas
    return metasEsportivas.filter((meta) =>
      meta.titulo.toLowerCase().includes(searchTerm.toLowerCase()) // Changed 'nome' to 'titulo'
    )
  }, [metasEsportivas, searchTerm])

  const filteredGoals = goals.filter((goal: any) => {
    if (filter === 'all') return true
    return goal.situacaoMetaDiaria === (filter === 'completed' ? 1 : 0)
  })

  return (
    <>
      <Header />
      <div className="flex min-h-screen">
        <Sidebar className="flex-none" />
        <div className="container mx-auto p-4 flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Metas</h1> {/* Add the page title */}
            
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
                    <Card key={index} className="p-4 border border-amber-300 rounded-md shadow-sm">
                      <CardHeader>
                        <Skeleton variant="text" className="w-1/2 h-6 mb-2" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton variant="text" className="w-full h-4 mb-2" />
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
                  onDelete={handleDeleteGoal}
                />
              )}
            </>
          ) : (
            <GoalList
              goals={metasEsportivas.map(meta => ({
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
              onDelete={isAdmin ? handleDeleteGoal : null} // Allow delete only for admins
              userRole={userData?.role} // Pass user role to GoalList
            />
          )}

          {/* Move the edit Sheet outside the goalType conditional */}
          {editingGoal && (
            <Sheet
              open={Boolean(editingGoal)}
              onOpenChange={() => setEditingGoal(null)}
            >
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Editar Meta</SheetTitle>
                </SheetHeader>
                <GoalForm
                  onSubmit={(data: any) => {
                    handleUpdateGoal({ ...editingGoal, ...data });
                    setEditingGoal(null);
                  }}
                  defaultValues={editingGoal}
                />
              </SheetContent>
            </Sheet>
          )}

          {/* Adicione Skeleton para o formulário se necessário */}
          {isLoadingMetasEsportivas && (
            <Sheet open={true}>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Editar Meta</SheetTitle>
                </SheetHeader>
                <div className="space-y-4">
                  <Skeleton variant="text" className="w-full h-6" />
                  <Skeleton variant="text" className="w-full h-4" />
                  <Skeleton variant="text" className="w-full h-4" />
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </>
  )
}
