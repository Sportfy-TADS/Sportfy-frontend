"use client"

import Link from 'next/link';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, UsersIcon, LockIcon, UnlockIcon } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Breadcrumb, BreadcrumbItem } from '@/components/ui/breadcrumb';

async function fetchCampeonato(idCampeonato: string) {
  const res = await fetch(`http://localhost:8081/campeonatos/filtrar?idCampeonato=${idCampeonato}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Falha ao carregar o campeonato.');
  const campeonatos = await res.json();
  return campeonatos.find((campeonato: any) => campeonato.idCampeonato === parseInt(idCampeonato));
}

export default function CampeonatoDetailsPage({ params }: { params: { idCampeonato: string } }) {
  const [campeonato, setCampeonato] = useState<any>(null);
  const [teamName, setTeamName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const loadCampeonato = async () => {
      try {
        const data = await fetchCampeonato(params.idCampeonato);
        setCampeonato(data);
      } catch (error) {
        console.error('Erro ao carregar o campeonato:', error);
        toast.error('Erro ao carregar o campeonato.');
        router.push('/championships');
      }
    };
    loadCampeonato();
  }, [params.idCampeonato, router]);

  const handleCreateTeam = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Add logic to create a team
  };

  if (!campeonato) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Header />
      <div className="flex h-screen">
        <Sidebar className="h-full" />
        <div className="flex-1 p-4 overflow-y-auto">
          {/*
          <Breadcrumb>
            <BreadcrumbItem href="/championships">Campeonatos</BreadcrumbItem>
            <BreadcrumbItem>{campeonato.titulo}</BreadcrumbItem>
          </Breadcrumb>
          */}
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold">{campeonato.titulo}</h1>
            <div className="space-x-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button>Criar Time</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Criar Novo Time</SheetTitle>
                  </SheetHeader>
                  <form onSubmit={handleCreateTeam} className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="teamName">Nome do Time <span className="text-red-500">*</span></Label>
                      <Input id="teamName" name="teamName" value={teamName} onChange={(e) => setTeamName(e.target.value)} required />
                    </div>
                    <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                      Salvar
                    </Button>
                  </form>
                </SheetContent>
              </Sheet>
              <Link href={`/championships/${campeonato.idCampeonato}/times`}>
                <Button variant="outline">Ver Times</Button>
              </Link>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informações do Campeonato</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Descrição</h2>
                  <p className="text-gray-600">{campeonato.descricao}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    {campeonato.privacidadeCampeonato === 'PUBLICO' ? (
                      <UnlockIcon className="h-5 w-5 text-green-500" />
                    ) : (
                      <LockIcon className="h-5 w-5 text-red-500" />
                    )}
                    <span>
                      {campeonato.privacidadeCampeonato === 'PUBLICO' ? 'Público' : 'Privado'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-5 w-5 text-blue-500" />
                    <span>Início: {new Date(campeonato.dataInicio).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-5 w-5 text-blue-500" />
                    <span>Fim: {new Date(campeonato.dataFim).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

