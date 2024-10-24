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
import { useForm } from 'react-hook-form';
import Sidebar from '@/components/Sidebar'; // Importa a Sidebar

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

// Função para buscar campeonatos
async function getCampeonatos() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/campeonatos/listar`);
  if (!res.ok) {
    console.error('Erro ao buscar campeonatos', await res.text());
    throw new Error('Erro ao buscar campeonatos');
  }
  const data = await res.json();
  console.log('Campeonatos:', data); // Log dos campeonatos
  return data;
}

// Função para criar novo campeonato
async function createCampeonato(data: Partial<Campeonato>) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/campeonatos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao criar campeonato');
  return res.json();
}

// Função para atualizar campeonato
async function updateCampeonato(idCampeonato: number, data: Partial<Campeonato>) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/campeonatos/${idCampeonato}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao atualizar campeonato');
  return res.json();
}

// Função para excluir campeonato
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

  // React Hook Form para criar ou atualizar campeonato
  const { register, handleSubmit, reset } = useForm<Partial<Campeonato>>({
    defaultValues: selectedCampeonato || {},
  });

  // Query para buscar campeonatos
  const { data: campeonatos = [], isLoading } = useQuery({
    queryKey: ['campeonatos'],
    queryFn: getCampeonatos,
  });

  // Mutation para criar campeonato
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

  // Mutation para atualizar campeonato
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

  // Mutation para excluir campeonato
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <>
      <Header /> {/* Header ocupando toda a largura */}
      <div className="flex h-screen"> {/* Flex com altura total */}
        <Sidebar className="h-full" /> {/* Sidebar ocupando a altura total */}
        <div className="flex-1 p-4 overflow-y-auto"> {/* Área principal com rolagem se necessário */}
          <h1 className="text-3xl font-bold mb-6">Campeonatos</h1>

          {/* Botão para cadastrar novo campeonato */}
          <Sheet>
            <SheetTrigger asChild>
              <Button className="bg-blue-500 hover:bg-blue-600">Cadastrar Campeonato</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Cadastrar Novo Campeonato</SheetTitle>
              </SheetHeader>
              <form onSubmit={handleSubmit(handleCreateCampeonato)} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="titulo">Título</Label>
                  <Input id="titulo" {...register('titulo')} required />
                </div>
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea id="descricao" {...register('descricao')} required />
                </div>
                <div>
                  <Label htmlFor="aposta">Aposta</Label>
                  <Input id="aposta" {...register('aposta')} required />
                </div>
                <div>
                  <Label htmlFor="dataInicio">Data de Início</Label>
                  <Input id="dataInicio" type="date" {...register('dataInicio')} required />
                </div>
                <div>
                  <Label htmlFor="dataFim">Data de Fim</Label>
                  <Input id="dataFim" type="date" {...register('dataFim')} required />
                </div>
                <Button type="submit" className="w-full bg-green-500 hover:bg-green-600">
                  Salvar Campeonato
                </Button>
              </form>
            </SheetContent>
          </Sheet>

          {/* Lista de Campeonatos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {campeonatos.map((campeonato: Campeonato) => (
              <Card key={campeonato.idCampeonato}>
                <CardHeader>
                  <CardTitle>{campeonato.titulo}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Descrição: {campeonato.descricao}</p>
                  <p className="text-sm">Aposta: {campeonato.aposta}</p>
                  <p className="text-sm">Início: {new Date(campeonato.dataInicio).toLocaleDateString()}</p>
                  <p className="text-sm">Fim: {new Date(campeonato.dataFim).toLocaleDateString()}</p>

                  {/* Botão para atualizar campeonato */}
                  <Button
                    onClick={() => setSelectedCampeonato(campeonato)}
                    className="mt-4 w-full bg-yellow-500 hover:bg-yellow-600"
                  >
                    Atualizar
                  </Button>

                  {/* Botão para excluir campeonato */}
                  <Button
                    onClick={() => handleDeleteCampeonato(campeonato.idCampeonato)}
                    className="mt-2 w-full bg-red-500 hover:bg-red-600"
                  >
                    Excluir
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Modal para atualizar campeonato */}
          {selectedCampeonato && (
            <Sheet>
              <SheetTrigger asChild>
                <Button className="bg-yellow-500 hover:bg-yellow-600">Atualizar Campeonato</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Atualizar Campeonato</SheetTitle>
                </SheetHeader>
                <form onSubmit={handleSubmit(handleUpdateCampeonato)} className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="titulo">Título</Label>
                    <Input id="titulo" defaultValue={selectedCampeonato.titulo} {...register('titulo')} required />
                  </div>
                  <div>
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea id="descricao" defaultValue={selectedCampeonato.descricao} {...register('descricao')} required />
                  </div>
                  <div>
                    <Label htmlFor="aposta">Aposta</Label>
                    <Input id="aposta" defaultValue={selectedCampeonato.aposta} {...register('aposta')} required />
                  </div>
                  <div>
                    <Label htmlFor="dataInicio">Data de Início</Label>
                    <Input id="dataInicio" type="date" defaultValue={selectedCampeonato.dataInicio.split('T')[0]} {...register('dataInicio')} required />
                  </div>
                  <div>
                    <Label htmlFor="dataFim">Data de Fim</Label>
                    <Input id="dataFim" type="date" defaultValue={selectedCampeonato.dataFim.split('T')[0]} {...register('dataFim')} required />
                  </div>
                  <Button type="submit" className="w-full bg-green-500 hover:bg-green-600">
                    Atualizar Campeonato
                  </Button>
                </form>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </>
  );
}
