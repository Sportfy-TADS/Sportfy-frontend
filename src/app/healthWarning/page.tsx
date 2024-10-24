'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

// Função para buscar dados de apoio à saúde
async function getApoioSaude() {
  const token = localStorage.getItem('token');

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/apoioSaude`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao buscar apoio à saúde');
  }

  return await response.json();
}

interface ApoioSaude {
  idApoioSaude: number;
  nome: string;
  email: string;
  telefone: string;
  descricao: string;
  dataPublicacao: string;
  idAdministrador: number;
}

export default function ApoioSaudePage() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Query para buscar os dados de apoio à saúde
  const { data: apoios = [], isLoading } = useQuery({
    queryKey: ['apoioSaude'],
    queryFn: getApoioSaude,
  });

  // Função de filtro
  const filteredApoios = apoios.filter((apoio: ApoioSaude) => {
    if (filter === 'all') return true;
    return filter === 'ufpr' ? apoio.idAdministrador === 1 : apoio.idAdministrador !== 1;
  });

  // Filtrando com base no termo de busca
  const displayedApoios = searchTerm
    ? filteredApoios.filter((apoio: ApoioSaude) =>
        apoio.nome.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : filteredApoios;

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
      <div className="flex min-h-screen">
        <Sidebar className="flex-none" />
        <div className="container mx-auto p-4 flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Apoio à Saúde</h1>
            <div className="flex space-x-4">
              <Select onValueChange={setFilter} defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ufpr">UFPR</SelectItem>
                  <SelectItem value="externo">Externo</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Buscar apoio à saúde..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full" 
              />
              <Button onClick={() => setSearchTerm(searchTerm)}>Buscar</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {displayedApoios.length ? (
              displayedApoios.map((apoio: ApoioSaude) => (
                <Card key={apoio.idApoioSaude}>
                  <CardHeader>
                    <CardTitle>{apoio.nome}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">Email: {apoio.email}</p>
                    <p className="text-sm">Telefone: {apoio.telefone}</p>
                    <p className="text-sm mt-2">Descrição: {apoio.descricao}</p>
                    <Button className="mt-4 w-full">Ver Detalhes</Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center col-span-full">Nenhum apoio à saúde disponível.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
