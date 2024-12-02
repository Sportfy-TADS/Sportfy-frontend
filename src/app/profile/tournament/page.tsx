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
import { Tournament, PaginatedResponse } from '@/interface/types';

async function getTournaments(pageIndex: number): Promise<PaginatedResponse> {
  const response = await fetch(`http://localhost:8081/campeonatos/11/inscritos?page=${pageIndex}&size=10&sort=dataCriacao,desc`);
  if (!response.ok) {
    throw new Error('Erro ao buscar campeonatos');
  }
  return response.json();
}

export default function TournamentHistory() {
  const [pageIndex, setPageIndex] = useState(0);

  const { data: paginatedData, isFetching, isLoading } = useQuery<PaginatedResponse, Error>({
    queryKey: ['tournaments', pageIndex],
    queryFn: () => getTournaments(pageIndex),
  });

  const tournaments = paginatedData?.content || [];
  const totalCount = paginatedData?.totalElements || 0;
  const totalPages = paginatedData?.totalPages || 0;

  const handlePaginate = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold tracking-tight mb-4">
          Histórico de Campeonatos
          <span className="text-sm font-normal ml-2 text-gray-500">
            Total de {totalCount} item(s)
          </span>
        </h1>
        {isFetching && <Loader2Icon className="h-5 w-5 animate-spin text-muted-foreground" />}
        
        <div className="space-y-2.5">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aposta</TableHead>
                  <TableHead>Local</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && tournaments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      Carregando...
                    </TableCell>
                  </TableRow>
                )}
                {tournaments.length > 0 ? (
                  tournaments.map((tournament: Tournament) => (
                    <TableRow key={tournament.idCampeonato}>
                      <TableCell>{tournament.codigo}</TableCell>
                      <TableCell>{tournament.titulo}</TableCell>
                      <TableCell>
                        {new Date(tournament.dataInicio).toLocaleDateString()} até{' '}
                        {new Date(tournament.dataFim).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{tournament.situacaoCampeonato}</TableCell>
                      <TableCell>{tournament.aposta || 'Sem aposta'}</TableCell>
                      <TableCell>{`${tournament.endereco.cidade}, ${tournament.endereco.uf}`}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      Nenhum campeonato encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {tournaments.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Página {pageIndex + 1} de {totalPages}
              </span>
              <Pagination 
                pageIndex={pageIndex} 
                totalCount={totalCount} 
                perPage={10} 
                onPageChange={handlePaginate} 
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
