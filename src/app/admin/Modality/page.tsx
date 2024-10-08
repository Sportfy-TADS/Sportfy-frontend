'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';

interface Modalidade {
  id: string;
  name: string;
  description: string;
  schedule: string;
  location: string;
}

// Função para buscar modalidades
async function getModalidades() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sports`);
  if (!res.ok) {
    throw new Error('Erro ao buscar modalidades');
  }
  return await res.json();
}

// Função para criar nova modalidade
async function createModalidade(data: Partial<Modalidade>) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error('Erro ao cadastrar modalidade');
  }
  return res.json();
}

// Função para editar modalidade existente
async function updateModalidade(id: string, data: Partial<Modalidade>) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sports/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error('Erro ao editar modalidade');
  }
  return res.json();
}

// Função para deletar modalidade
async function deleteModalidade(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sports/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Erro ao deletar modalidade');
  }
  return res.json();
}

// Função para verificar se o usuário é admin no backend
async function checkIsAdmin(userId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`);
  if (!res.ok) {
    throw new Error('Erro ao verificar status de administrador');
  }
  const user = await res.json();
  return user.isAdmin;
}

export default function AdminModalidadesPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [filter, setFilter] = useState('all');
  const [modalidadeForm, setModalidadeForm] = useState<Partial<Modalidade>>({
    name: '',
    description: '',
    schedule: '',
    location: '',
  });
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editingModalidadeId, setEditingModalidadeId] = useState<string | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Verificar se o usuário é admin e se o localStorage está disponível
  useEffect(() => {
    const verifyAdminStatus = async () => {
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        setUserId(storedUserId);
        try {
          const isAdminStatus = await checkIsAdmin(storedUserId);
          if (!isAdminStatus) {
            toast.error('Acesso negado! Somente administradores podem acessar esta página.');
            router.push('/'); // Redireciona se não for admin
          } else {
            setIsAdmin(true); // Usuário é admin
          }
        } catch (error) {
          toast.error('Erro ao verificar status de administrador');
          router.push('/auth');
        }
      } else {
        router.push('/auth'); // Redireciona para login se não houver userId
      }
    };

    verifyAdminStatus();
  }, [router]);

  // Query para buscar modalidades
  const { data: modalidades = [], isLoading } = useQuery({
    queryKey: ['modalidades'],
    queryFn: getModalidades,
    enabled: isAdmin, // Só executa a query se for admin
  });

  // Mutation para criar modalidade
  const createMutation = useMutation({
    mutationFn: (data: Partial<Modalidade>) => createModalidade(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['modalidades']);
      toast.success('Modalidade criada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao criar modalidade');
    },
  });

  // Mutation para editar modalidade
  const updateMutation = useMutation({
    mutationFn: (data: Partial<Modalidade>) => updateModalidade(editingModalidadeId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['modalidades']);
      toast.success('Modalidade editada com sucesso!');
      setEditMode(false); // Sair do modo de edição
    },
    onError: () => {
      toast.error('Erro ao editar modalidade');
    },
  });

  // Mutation para deletar modalidade
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteModalidade(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['modalidades']);
      toast.success('Modalidade excluída com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao excluir modalidade');
    },
  });

  const handleCreateModalidade = () => {
    if (!modalidadeForm.name || !modalidadeForm.description || !modalidadeForm.schedule || !modalidadeForm.location) {
      toast.error('Todos os campos são obrigatórios');
      return;
    }
    createMutation.mutate(modalidadeForm);
  };

  const handleEditModalidade = (modalidade: Modalidade) => {
    setEditMode(true);
    setEditingModalidadeId(modalidade.id);
    setModalidadeForm(modalidade);
  };

  const handleUpdateModalidade = () => {
    if (!modalidadeForm.name || !modalidadeForm.description || !modalidadeForm.schedule || !modalidadeForm.location) {
      toast.error('Todos os campos são obrigatórios');
      return;
    }
    updateMutation.mutate(modalidadeForm);
  };

  const handleDeleteModalidade = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Gerenciar Modalidades</h1>
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
          </div>
        </div>

        {/* Formulário para cadastrar nova modalidade - Apenas administradores */}
        {isAdmin && (
          <Sheet>
            <SheetTrigger asChild>
              <Button className="bg-blue-500 hover:bg-blue-600">
                {editMode ? 'Editar Modalidade' : 'Cadastrar Modalidade'}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{editMode ? 'Editar Modalidade' : 'Cadastrar Nova Modalidade'}</SheetTitle>
              </SheetHeader>
              <form className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={modalidadeForm.name}
                    onChange={(e) => setModalidadeForm({ ...modalidadeForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={modalidadeForm.description}
                    onChange={(e) => setModalidadeForm({ ...modalidadeForm, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="schedule">Horário</Label>
                  <Input
                    id="schedule"
                    value={modalidadeForm.schedule}
                    onChange={(e) => setModalidadeForm({ ...modalidadeForm, schedule: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Localização</Label>
                  <Input
                    id="location"
                    value={modalidadeForm.location}
                    onChange={(e) => setModalidadeForm({ ...modalidadeForm, location: e.target.value })}
                  />
                </div>
                <Button
                  onClick={editMode ? handleUpdateModalidade : handleCreateModalidade}
                  className="w-full bg-green-500 hover:bg-green-600"
                >
                  {editMode ? 'Salvar Edição' : 'Salvar Modalidade'}
                </Button>
              </form>
            </SheetContent>
          </Sheet>
        )}

        {/* Lista de modalidades */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          {modalidades.length ? (
            modalidades.map((modalidade: Modalidade) => (
              <Card key={modalidade.id}>
                <CardHeader>
                  <CardTitle>{modalidade.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Horário: {modalidade.schedule}</p>
                  <p className="text-sm">Local: {modalidade.location}</p>

                  {/* Botões de edição e exclusão só aparecem para admin */}
                  {isAdmin && (
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleEditModalidade(modalidade)}
                        className="mt-4 w-full bg-yellow-500 hover:bg-yellow-600"
                      >
                        Editar
                      </Button>
                      <Button
                        onClick={() => handleDeleteModalidade(modalidade.id)}
                        className="mt-4 w-full bg-red-500 hover:bg-red-600"
                      >
                        Excluir
                      </Button>
                    </div>
                  )}
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
