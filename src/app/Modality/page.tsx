'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import { Label } from '@/components/ui/label';

interface Modalidade {
  id: string;
  name: string;
  description: string;
  schedule: string;
  location: string;
  inscrito: boolean;
}

// Função para buscar modalidades
async function getModalidades(userId: string) {
  const [sportsRes, inscricoesRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/sports`),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/inscricoes?userId=${userId}`)
  ]);

  if (!sportsRes.ok || !inscricoesRes.ok) {
    throw new Error('Erro ao buscar modalidades ou inscrições');
  }

  const [sports, inscricoes] = await Promise.all([sportsRes.json(), inscricoesRes.json()]);

  return sports.map((modalidade: Modalidade) => ({
    ...modalidade,
    inscrito: inscricoes.some((inscricao: any) => inscricao.modalidadeId === modalidade.id)
  }));
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

// Função para criar/editar modalidades
async function salvarModalidade(data: Modalidade, isEdit: boolean) {
  const method = isEdit ? 'PATCH' : 'POST';
  const url = isEdit
    ? `${process.env.NEXT_PUBLIC_API_URL}/sports/${data.id}`
    : `${process.env.NEXT_PUBLIC_API_URL}/sports`;

  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Erro ao salvar modalidade');
  }

  return await response.json();
}

export default function ModalidadeInscricaoPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false); // Verificar se o usuário é admin
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Modalidade>();

  // Verificar se o `localStorage` está disponível no lado do cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('userId');
      const adminStatus = localStorage.getItem('isAdmin'); // Pega o valor de `isAdmin` do localStorage
      
      console.log('UserId no localStorage:', storedUserId); // Verificando UserId
      console.log('AdminStatus no localStorage:', adminStatus); // Verificando AdminStatus

      if (storedUserId) {
        setUserId(storedUserId);
        setIsAdmin(adminStatus === 'true'); // Verifica se o valor de `isAdmin` é "true"
        
        console.log('isAdmin após verificação:', adminStatus === 'true'); // Verificando se isAdmin está correto
      }
    }
  }, []);

  // Query para buscar modalidades com inscrição
  const { data: modalidades = [], isLoading } = useQuery({
    queryKey: ['modalidades', userId],
    queryFn: () => getModalidades(userId!),
    enabled: !!userId, // Executa a query apenas se houver userId
  });

  // Mutation para inscrever o usuário
  const { mutate: inscreverMutate } = useMutation({
    mutationFn: (modalidadeId: string) => inscreverUsuario({ userId: userId!, modalidadeId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['modalidades', userId]);
      toast.success('Inscrição realizada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao realizar inscrição.');
    },
  });

  // Mutation para criar/editar modalidades
  const { mutate: salvarModalidadeMutate } = useMutation({
    mutationFn: (data: Modalidade) => salvarModalidade(data, !!data.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['modalidades', userId]);
      toast.success('Modalidade salva com sucesso!');
      reset();
    },
    onError: () => {
      toast.error('Erro ao salvar modalidade.');
    },
  });

  const handleInscricao = (modalidadeId: string) => {
    inscreverMutate(modalidadeId);
  };

  const handleSalvarModalidade = (data: Modalidade) => {
    salvarModalidadeMutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-gray-500" />
      </div>
    );
  }

  const filteredModalidades = modalidades.filter((modalidade: { inscrito: boolean }) => {
    if (filter === 'all') return true;
    return filter === 'inscrito' ? modalidade.inscrito : !modalidade.inscrito;
  });

  return (
    <>
      <Header />

      <div className="container mx-auto p-4">
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

            {/* Verificação de admin e exibição do botão de Nova Modalidade */}
            {isAdmin && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button className="bg-blue-500 hover:bg-blue-600">Nova Modalidade</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Nova Modalidade</SheetTitle>
                  </SheetHeader>
                  <form onSubmit={handleSubmit(handleSalvarModalidade)} className="space-y-4 mt-8">
                    <div>
                      <Label htmlFor="name">Nome</Label>
                      <Input id="name" {...register('name', { required: true })} />
                      {errors.name && <p className="text-red-500">Campo obrigatório</p>}
                    </div>

                    <div>
                      <Label htmlFor="schedule">Horário</Label>
                      <Input id="schedule" {...register('schedule', { required: true })} />
                      {errors.schedule && <p className="text-red-500">Campo obrigatório</p>}
                    </div>

                    <div>
                      <Label htmlFor="location">Local</Label>
                      <Input id="location" {...register('location', { required: true })} />
                      {errors.location && <p className="text-red-500">Campo obrigatório</p>}
                    </div>

                    <Button type="submit" className="w-full bg-green-500 hover:bg-green-600">
                      Salvar Modalidade
                    </Button>
                  </form>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredModalidades.length ? (
            filteredModalidades.map((modalidade: Modalidade) => (
              <Card key={modalidade.id}>
                <CardHeader>
                  <CardTitle>{modalidade.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Horário: {modalidade.schedule}</p>
                  <p className="text-sm">Local: {modalidade.location}</p>
                  <Button
                    onClick={() => handleInscricao(modalidade.id)}
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
    </>
  );
}
