'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { Loader2, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Função para buscar todos os usuários
async function fetchUsers() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`);
  if (!res.ok) throw new Error('Erro ao buscar usuários.');
  return await res.json();
}

// Função para adicionar/remover administrador
async function toggleAdminStatus(userId: string, isAdmin: boolean) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isAdmin }),
  });
  if (!res.ok) throw new Error('Erro ao atualizar status de administrador.');
  return res.json();
}

// Função para verificar se o usuário logado é administrador
async function isAdmin(userId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`);
  const user = await res.json();
  return user.isAdmin;
}

// Função para cadastrar um novo usuário como administrador
async function addNewAdmin(userData: { name: string; email: string; username: string; password: string }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...userData, isAdmin: true }),
  });
  if (!res.ok) throw new Error('Erro ao cadastrar novo administrador.');
  return res.json();
}

// Função para excluir um usuário
async function deleteUser(userId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Erro ao excluir usuário.');
  return res.json();
}

export default function AdminCrudPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', username: '', password: '' });
  const [showAdminsOnly, setShowAdminsOnly] = useState(true); // Mostra apenas admins por padrão
  const router = useRouter();
  const queryClient = useQueryClient();

  // Verifica se o usuário logado é admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      const loggedInUserId = localStorage.getItem('userId');
      if (!loggedInUserId) {
        router.push('/auth'); // Redireciona para login se não houver ID do usuário
        return;
      }
      setUserId(loggedInUserId);
      const adminStatus = await isAdmin(loggedInUserId);
      if (!adminStatus) {
        toast.error('Acesso negado! Somente administradores podem acessar esta página.');
        router.push('/'); // Redireciona para a página principal
      } else {
        setIsUserAdmin(true);
      }
    };
    checkAdminStatus();
  }, [router]);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    enabled: isUserAdmin, // Só faz a consulta se o usuário for admin
  });

  const toggleAdminMutation = useMutation({
    mutationFn: toggleAdminStatus,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('Status de administrador atualizado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar o status de administrador.');
    },
  });

  const addAdminMutation = useMutation({
    mutationFn: addNewAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('Novo administrador cadastrado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao cadastrar novo administrador.');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('Usuário excluído com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao excluir usuário.');
    },
  });

  const handleToggleAdmin = (userId: string, isAdmin: boolean) => {
    toggleAdminMutation.mutate({ userId, isAdmin: !isAdmin });
  };

  const handleAddAdmin = () => {
    if (newUser.name && newUser.email && newUser.username && newUser.password) {
      addAdminMutation.mutate(newUser);
    } else {
      toast.error('Preencha todos os campos.');
    }
  };

  const handleDeleteUser = (userId: string) => {
    deleteUserMutation.mutate(userId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-gray-500" />
      </div>
    );
  }

  const filteredUsers = showAdminsOnly ? users.filter((user: any) => user.isAdmin) : users;

  return (
    <>
      <Header />
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gerenciar Administradores</h1>
          
          {/* Filtro para mostrar apenas admins ou todos */}
          <Select onValueChange={(value) => setShowAdminsOnly(value === 'admins')}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar usuários" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admins">Mostrar apenas Admins</SelectItem>
              <SelectItem value="all">Mostrar Todos</SelectItem>
            </SelectContent>
          </Select>

          {/* Botão para cadastrar novo administrador */}
          <Sheet>
            <SheetTrigger asChild>
              <Button className="bg-blue-500 hover:bg-blue-600">Adicionar Novo Administrador</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Cadastrar Novo Administrador</SheetTitle>
              </SheetHeader>
              <form className="space-y-4 mt-8">
                <Input
                  placeholder="Nome"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
                <Input
                  placeholder="Email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
                <Input
                  placeholder="Username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                />
                <Input
                  type="password"
                  placeholder="Senha"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
                <Button onClick={handleAddAdmin} className="w-full bg-green-500 hover:bg-green-600">
                  Salvar
                </Button>
              </form>
            </SheetContent>
          </Sheet>
        </div>

        {/* Listar todos os usuários com checkbox para definir admin */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user: any) => (
            <Card key={user.id} className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-bold">
                  {user.name} ({user.username})
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span>{user.email}</span>
                <Checkbox
                  checked={user.isAdmin}
                  onCheckedChange={() => handleToggleAdmin(user.id, user.isAdmin)}
                >
                  Admin
                </Checkbox>
                <Button variant="destructive" onClick={() => handleDeleteUser(user.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
