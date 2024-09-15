'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Loader2Icon } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Header from '@/components/Header';
import { Pagination } from '@/components/pagination'; // Supondo que você tenha um componente de paginação

// Definindo tipos explícitos para torneios
interface Tournament {
  id: number;
  name: string;
  date: string;
  status: string;
  location: string;
}

// Função para buscar torneios específicos do usuário
async function getTournaments(pageIndex: number): Promise<Tournament[]> {
  const response = await fetch(`http://localhost:3001/tournaments?userId=7203&_page=${pageIndex + 1}&_limit=10`);
  if (!response.ok) {
    throw new Error('Erro ao buscar torneios');
  }
  // Certifique-se de retornar objetos simples
  const data: Tournament[] = await response.json();
  return JSON.parse(JSON.stringify(data)); // Garantir que seja serializável
}

export default function TournamentHistory() {
  const [pageIndex, setPageIndex] = useState(0);

  const { data: tournaments = [], isFetching, isLoading } = useQuery<Tournament[], Error>({
    queryKey: ['tournaments', pageIndex],
    queryFn: () => getTournaments(pageIndex),
  });

  const handlePaginate = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold tracking-tight mb-4">Histórico de Campeonatos</h1>
        {isFetching && <Loader2Icon className="h-5 w-5 animate-spin text-muted-foreground" />}
        
        <div className="space-y-2.5">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome do Torneio</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Local</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && tournaments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      Carregando...
                    </TableCell>
                  </TableRow>
                )}
                {tournaments.length > 0 ? (
                  tournaments.map((tournament: Tournament) => (
                    <TableRow key={tournament.id}>
                      <TableCell>{tournament.id}</TableCell>
                      <TableCell>{tournament.name}</TableCell>
                      <TableCell>{new Date(tournament.date).toLocaleDateString()}</TableCell>
                      <TableCell>{tournament.status}</TableCell>
                      <TableCell>{tournament.location}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      Nenhum torneio encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {tournaments.length > 0 && (
            <Pagination pageIndex={pageIndex} totalCount={100} perPage={10} onPageChange={handlePaginate} />
          )}
        </div>
      </div>
    </>
  );
}
