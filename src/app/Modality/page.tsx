'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Input } from '@/components/ui/input';

interface Modalidade {
  idModalidadeEsportiva: number;
  nome: string;
  descricao: string;
  dataCriacao: string;
  inscrito: boolean;
}

// Função para buscar modalidades
async function getModalidades() {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/modalidadeEsportiva/listar`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao buscar modalidades');
  }

  return await response.json();
}

// Função para inscrever o usuário em uma modalidade
async function inscreverUsuario(data: { userId: string; modalidadeId: string }) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/modalidadeEsportiva/inscrever/${data.userId}/${data.modalidadeId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Erro ao realizar inscrição');
  }

  return await response.json();
}

export default function ModalidadeInscricaoPage() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [filter, setFilter] = useState('all');
  const [selectedModalidade, setSelectedModalidade] = useState<Modalidade | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: modalidades = [], isLoading } = useQuery({
    queryKey: ['modalidades'],
    queryFn: () => getModalidades(),
  });

  const { mutate } = useMutation({
    mutationFn: (modalidadeId: string) => inscreverUsuario({ userId: '1', modalidadeId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['modalidades']);
      toast.success('Inscrição realizada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao realizar inscrição.');
    },
  });

  const handleInscricao = (modalidadeId: string) => {
    mutate(modalidadeId);
  };

  const filteredModalidades = modalidades.filter((modalidade) => {
    if (filter === 'all') return true;
    return filter === 'inscrito' ? modalidade.inscrito : !modalidade.inscrito;
  });

  const displayedModalidades = searchTerm
    ? filteredModalidades.filter((modalidade) =>
        modalidade.nome.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : filteredModalidades;

  return (
    <>
      <Header />
      <div className="flex min-h-screen">
        <Sidebar className="flex-none" />
        <div className="container mx-auto p-4 flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Modalidades</h1>
            <div className="flex space-x-4">
              <Select onValueChange={setFilter} defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="inscrito">Inscritas</SelectItem>
                  <SelectItem value="nao_inscrito">Não inscritas</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Buscar modalidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
              <Button onClick={() => setSearchTerm(searchTerm)}>Buscar</Button>
            </div>
          </div>

          {isAdmin && (
            <div className="mb-6">
              <Sheet>
                <SheetTrigger asChild>
                  <Button className="bg-blue-500 hover:bg-blue-600">Cadastrar Modalidade</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Cadastrar Nova Modalidade</SheetTitle>
                  </SheetHeader>
                  <form>
                    <Input placeholder="Nome da Modalidade" required />
                    <Input placeholder="Descrição" required />
                    <Input placeholder="Horário" required />
                    <Input placeholder="Local" required />
                    <Button type="submit" className="mt-4 bg-green-500 hover:bg-green-600">Salvar</Button>
                  </form>
                </SheetContent>
              </Sheet>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-8 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : displayedModalidades.length ? (
              displayedModalidades.map((modalidade) => (
                <Card key={modalidade.idModalidadeEsportiva}>
                  <CardHeader>
                    <CardTitle>
                      <span 
                        onClick={() => setSelectedModalidade(modalidade)}
                        className="text-blue-600 cursor-pointer hover:underline"
                      >
                        {modalidade.nome}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">Inscrito: {modalidade.inscrito ? 'Sim' : 'Não'}</p>
                    <Button
                      onClick={() => handleInscricao(modalidade.idModalidadeEsportiva)}
                      className="mt-4 w-full"
                      disabled={modalidade.inscrito}
                    >
                      {modalidade.inscrito ? 'Inscrito' : 'Inscrever-se'}
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center col-span-full">Nenhuma modalidade disponível.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
