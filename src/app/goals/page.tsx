'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, X } from 'lucide-react';
import Header from '@/components/Header';

// API function to fetch goals
async function getGoals() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/goals`);
  if (!response.ok) throw new Error('Erro ao buscar metas');
  return await response.json();
}

// API function to create a new goal
async function createGoal(data: { title: string; frequency: number }) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Erro ao criar meta');
  return await response.json();
}

// Zod schema for form validation
const createGoalSchema = z.object({
  title: z.string().min(1, 'Informe a atividade que deseja praticar'),
  frequency: z.coerce.number().min(1).max(7, 'Escolha entre 1 e 7 vezes na semana'),
});

type CreateGoalSchema = z.infer<typeof createGoalSchema>;

export default function GoalsPage() {
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();
  
  // Atualizando o uso de `useQuery` para usar a forma com objeto
  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: getGoals
  });
  
  // Form setup
  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<CreateGoalSchema>({
    resolver: zodResolver(createGoalSchema),
  });

  const handleCreateGoal = async (data: CreateGoalSchema) => {
    try {
      await createGoal(data);
      reset();
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Meta criada com sucesso!');
    } catch {
      toast.error('Erro ao criar a meta');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="text-gray-500 animate-spin" />
      </div>
    );
  }

  const filteredGoals = goals.filter((goal: any) => {
    if (filter === 'all') return true;
    return goal.status === filter;
  });

  return (
    <>
      <Header />
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Metas</h1>
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
                <Button className="bg-blue-500 hover:bg-blue-600">Cadastrar Meta</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Cadastrar Meta</SheetTitle>
                </SheetHeader>
                <form onSubmit={handleSubmit(handleCreateGoal)} className="space-y-4 mt-8">
                  <div>
                    <Label htmlFor="title">Atividade</Label>
                    <Input id="title" placeholder="Praticar exercícios..." {...register('title')} />
                    {errors.title && <p className="text-red-500">{errors.title.message}</p>}
                  </div>

                  <div>
                    <Label>Frequência Semanal</Label>
                    <Controller
                      name="frequency"
                      control={control}
                      render={({ field }) => (
                        <RadioGroup value={String(field.value)} onValueChange={field.onChange}>
                          {Array.from({ length: 7 }).map((_, i) => (
                            <RadioGroupItem key={i} value={String(i + 1)}>
                              <span>{i + 1}x por semana</span>
                            </RadioGroupItem>
                          ))}
                        </RadioGroup>
                      )}
                    />
                    {errors.frequency && <p className="text-red-500">{errors.frequency.message}</p>}
                  </div>

                  <Button type="submit" className="w-full bg-green-500 hover:bg-green-600">Salvar Meta</Button>
                </form>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredGoals.length ? (
            filteredGoals.map((goal: any) => (
              <Card key={goal.id}>
                <CardHeader>
                  <CardTitle>{goal.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  Frequência: {goal.frequency}x por semana
                  <p>Status: {goal.status === 'completed' ? 'Concluída' : 'Em andamento'}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p>Nenhuma meta encontrada</p>
          )}
        </div>
      </div>
    </>
  );
}
