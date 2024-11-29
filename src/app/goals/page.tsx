'use client'

import { useState } from 'react'

import { Toaster } from 'sonner'

import GoalForm from '@/components/goals/GoalForm'
import GoalList from '@/components/goals/GoalList'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
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
import { useGoals } from '@/hooks/useGoals'
import { useUserData } from '@/hooks/useUserData'

export default function GoalsPage() {
  const [filter, setFilter] = useState('all')
  const [editingGoal, setEditingGoal] = useState<any>(null)
  const userData = useUserData()
  const {
    goals,
    isLoading,
    handleCreateGoal,
    handleDeleteGoal,
    handleUpdateGoal,
  } = useGoals(userData?.idAcademico) // Pass idAcademico instead of username

  if (!userData) {
    return <div>Loading...</div>
  }

  const filteredGoals = Array.isArray(goals) ? goals.filter((goal: any) => {
    if (filter === 'all') return true
    return goal.situacaoMetaDiaria === (filter === 'completed' ? 1 : 0)
  }) : []

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
                  <GoalForm onSubmit={handleCreateGoal} />
                </SheetContent>
              </Sheet>
            </div>
          </div>
          <GoalList
            goals={filteredGoals}
            isLoading={isLoading}
            onEdit={setEditingGoal}
            onDelete={handleDeleteGoal}
          />
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
                    handleUpdateGoal({ ...editingGoal, ...data })
                    setEditingGoal(null)
                  }}
                  defaultValues={editingGoal}
                />
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </>
  )
}
