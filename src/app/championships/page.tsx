'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/Header';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from "@/components/ui/skeleton"; // Importa o componente Skeleton
import { useForm } from 'react-hook-form';
import Sidebar from '@/components/Sidebar';

interface Campeonato {
  idCampeonato: number;
  titulo: string;
  descricao: string;
  aposta: string;
  dataInicio: string;
  dataFim: string;
  ativo: boolean;
  limiteTimes: number;
  limiteParticipantes: number;
  endereco: {
    rua: string;
    numero: string;
    cidade: string;
    estado: string;
    cep: string;
  };
}

// Função para buscar os campeonatos
async function getCampeonatos() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/campeonatos/listar`);
  if (!res.ok) {
    console.error('Erro ao buscar campeonatos', await res.text());
    throw new Error('Erro ao buscar campeonatos');
  }
  return res.json();
}

// Função para criar um novo campeonato
async function createCampeonato(data: Partial<Campeonato>) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/campeonatos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao criar campeonato');
  return res.json();
}

// Função para atualizar um campeonato existente
async function updateCampeonato(idCampeonato: number, data: Partial<Campeonato>) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/campeonatos/${idCampeonato}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao atualizar campeonato');
  return res.json();
}

// Função para excluir um campeonato
async function deleteCampeonato(idCampeonato: number) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/campeonatos/${idCampeonato}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Erro ao excluir campeonato');
  return res.json();
}

export default function CampeonatoPage() {
  const queryClient = useQueryClient();
  const [selectedCampeonato, setSelectedCampeonato] = useState<Campeonato | null>(null);

  const { register, handleSubmit, reset } = useForm<Partial<Campeonato>>({
    defaultValues: selectedCampeonato || {},
  });

  const { data: campeonatos = [], isLoading } = useQuery({
    queryKey: ['campeonatos'],
    queryFn: getCampeonatos,
  });

  const createMutation = useMutation({
    mutationFn: createCampeonato,
    onSuccess: () => {
      queryClient.invalidateQueries(['campeonatos']);
      toast.success('Campeonato criado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao criar campeonato');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ idCampeonato, data }: { idCampeonato: number; data: Partial<Campeonato> }) =>
      updateCampeonato(idCampeonato, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['campeonatos']);
      toast.success('Campeonato atualizado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar campeonato');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCampeonato,
    onSuccess: () => {
      queryClient.invalidateQueries(['campeonatos']);
      toast.success('Campeonato excluído com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao excluir campeonato');
    },
  });

  const handleCreateCampeonato = (data: Partial<Campeonato>) => {
    createMutation.mutate(data);
    reset();
  };

  const handleUpdateCampeonato = (data: Partial<Campeonato>) => {
    if (selectedCampeonato) {
      updateMutation.mutate({ idCampeonato: selectedCampeonato.idCampeonato, data });
      reset();
      setSelectedCampeonato(null);
    }
  };

  const handleDeleteCampeonato = (idCampeonato: number) => {
    deleteMutation.mutate(idCampeonato);
  };

  return (
    <>
      <Header />
      <div className="flex h-screen">
        <Sidebar className="h-full" />
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Campeonatos</h1>
            <Sheet>
              <SheetTrigger asChild>
                <Button className="bg-blue-500 hover:bg-blue-600">Cadastrar Campeonato</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Cadastrar Novo Campeonato</SheetTitle>
                </SheetHeader>
                <form onSubmit={handleSubmit(handleCreateCampeonato)} className="space-y-4 mt-4">
                  {/* Campos do formulário */}
                </form>
              </SheetContent>
            </Sheet>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-10 w-full bg-gray-300" />
                </Card>
              ))
            ) : (
              campeonatos.map((campeonato: Campeonato) => (
                <Card key={campeonato.idCampeonato}>
                  <CardHeader>
                    <CardTitle>{campeonato.titulo}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">Descrição: {campeonato.descricao}</p>
                    <p className="text-sm">Aposta: {campeonato.aposta}</p>
                    <p className="text-sm">Início: {new Date(campeonato.dataInicio).toLocaleDateString()}</p>
                    <p className="text-sm">Fim: {new Date(campeonato.dataFim).toLocaleDateString()}</p>

                    <Button
                      onClick={() => setSelectedCampeonato(campeonato)}
                      className="mt-4 w-full bg-yellow-500 hover:bg-yellow-600"
                    >
                      Atualizar
                    </Button>

                    <Button
                      onClick={() => handleDeleteCampeonato(campeonato.idCampeonato)}
                      className="mt-2 w-full bg-red-500 hover:bg-red-600"
                    >
                      Excluir
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
