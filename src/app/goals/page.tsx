'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar'; // Importando a Sidebar
import { Skeleton } from "@/components/ui/skeleton"

// Função API para buscar metas
async function getGoals(idDoUsuarioLogado: number) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/metaDiaria/listar/${idDoUsuarioLogado}`);
  if (!response.ok) throw new Error('Erro ao buscar metas');
  return await response.json();
}

// Função API para criar uma nova meta
async function createGoal(data: { titulo: string; objetivo: string; quantidadeConcluida: number; progressoMaximo: number; progressoItem: string; idAcademico: number }) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/metaDiaria`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Erro ao criar meta');
  return await response.json();
}

// Função API para excluir uma meta
async function deleteGoal(idMetaDiaria: number) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/metaDiaria/deletar`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idMetaDiaria }),
  });
  if (!response.ok) throw new Error('Erro ao deletar meta');
}

// Zod schema para validação de formulário
const createGoalSchema = z.object({
  titulo: z.string().min(1, 'Informe a atividade que deseja praticar'),
  objetivo: z.string().min(1, 'Informe o objetivo da meta'),
  progressoMaximo: z.coerce.number().min(1, 'Informe o progresso máximo para a meta'),
});

type CreateGoalSchema = z.infer<typeof createGoalSchema>;

export default function GoalsPage() {
  const [filter, setFilter] = useState('all');
  const [idDoUsuarioLogado, setIdDoUsuarioLogado] = useState<number | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setIdDoUsuarioLogado(payload.idUsuario);
    }
  }, []);

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals', idDoUsuarioLogado],
    queryFn: () => getGoals(idDoUsuarioLogado as number),
    enabled: idDoUsuarioLogado !== null,
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateGoalSchema>({
    resolver: zodResolver(createGoalSchema),
  });

  const handleCreateGoal = async (data: CreateGoalSchema) => {
    try {
      const goalData = {
        ...data,
        quantidadeConcluida: 0,
        progressoAtual: 0,
        progressoItem: 'Kilômetros',
        idAcademico: idDoUsuarioLogado as number,
        situacaoMetaDiaria: 0,
      };
  
      const response = await createGoal(goalData);
      reset();
      queryClient.invalidateQueries({ queryKey: ['goals', idDoUsuarioLogado] });
      toast.success('Meta criada com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar a meta');
    }
  };

  const handleDeleteGoal = async (idMetaDiaria: number) => {
    try {
      await deleteGoal(idMetaDiaria);
      queryClient.invalidateQueries({ queryKey: ['goals', idDoUsuarioLogado] });
      toast.success('Meta excluída com sucesso!');
    } catch {
      toast.error('Erro ao excluir a meta');
    }
  };

  const filteredGoals = goals.filter((goal: any) => {
    if (filter === 'all') return true;
    return goal.situacaoMetaDiaria === (filter === 'completed' ? 1 : 0);
  });

  return (
    <>
      <Header />
      <div className="flex h-screen">
        <Sidebar className="flex-none" /> {/* Certifique-se de que a Sidebar esteja configurada para ocupar a altura total */}
        <div className="container mx-auto p-4 flex-1 overflow-y-auto"> {/* Adicionando overflow-y-auto para rolagem */}
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
                  <Button className="bg-blue-500 hover:bg-blue-600">Cadastrar Meta</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Cadastrar Meta</SheetTitle>
                  </SheetHeader>
                  <form onSubmit={handleSubmit(handleCreateGoal)} className="space-y-4 mt-8">
                    <div>
                      <Label htmlFor="titulo">Atividade</Label>
                      <Input id="titulo" placeholder="Praticar exercícios..." {...register('titulo')} />
                      {errors.titulo && <p className="text-red-500">{errors.titulo.message}</p>}
                    </div>

                    <div>
                      <Label htmlFor="objetivo">Objetivo</Label>
                      <Input id="objetivo" placeholder="Correr 5 km todos os dias..." {...register('objetivo')} />
                      {errors.objetivo && <p className="text-red-500">{errors.objetivo.message}</p>}
                    </div>

                    <div>
                      <Label htmlFor="progressoMaximo">Progresso Máximo</Label>
                      <Input id="progressoMaximo" type="number" placeholder="5" {...register('progressoMaximo')} />
                      {errors.progressoMaximo && <p className="text-red-500">{errors.progressoMaximo.message}</p>}
                    </div>

                    <Button type="submit" className="w-full bg-green-500 hover:bg-green-600">Salvar Meta</Button>
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
                    Objetivo: {goal.objetivo}
                    <p>Progresso: {goal.quantidadeConcluida}/{goal.progressoMaximo} {goal.progressoItem}</p>
                    <p>Status: {goal.situacaoMetaDiaria === 1 ? 'Concluída' : 'Em andamento'}</p>
                    <Button onClick={() => handleDeleteGoal(goal.idMetaDiaria)} className="bg-red-500 hover:bg-red-600 mt-2">Excluir</Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p>Não há metas cadastradas.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
