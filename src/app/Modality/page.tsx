'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inscricoes`, {
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

  // Query para buscar modalidades
  const { data: modalidades = [], isLoading } = useQuery({
    queryKey: ['modalidades'],
    queryFn: () => getModalidades(),
  });

  // Mutation para inscrever o usuário
  const { mutate } = useMutation({
    mutationFn: (modalidadeId: string) => inscreverUsuario({ userId: '1', modalidadeId }), // Mude para obter o userId conforme necessário
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-gray-500" />
      </div>
    );
  }

  const filteredModalidades = modalidades.filter((modalidade) => {
    if (filter === 'all') return true;
    return filter === 'inscrito' ? modalidade.inscrito : !modalidade.inscrito;
  });

  // Filtrando com base no searchTerm
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
                className="w-full" // Aumenta o tamanho para ocupar toda a largura
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
            {displayedModalidades.length ? (
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

      <Sheet open={!!selectedModalidade} onOpenChange={() => setSelectedModalidade(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selectedModalidade?.nome || 'Detalhes da Modalidade'}</SheetTitle>
          </SheetHeader>
          <div>
            <p><strong>Descrição:</strong> {selectedModalidade?.descricao || 'Nenhuma descrição disponível.'}</p>
            <Button variant="outline" onClick={() => setSelectedModalidade(null)}>Fechar</Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
