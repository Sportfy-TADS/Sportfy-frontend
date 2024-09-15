'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import Header from '@/components/Header';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from '@/components/ui/button';

// Tipagem para as Casas de Saúde
interface CasaDeSaude {
  id: number;
  nome: string;
  endereco: string;
  telefone: string;
  horario: string;
}

export default function HealthWarningPage() {
  const [casasDeSaude, setCasasDeSaude] = useState<CasaDeSaude[]>([]);
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false); // Verificar se o usuário é admin
  const router = useRouter();

  // Carregar dados das casas de saúde do json-server
  useEffect(() => {
    const fetchCasasDeSaude = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/casasDeSaude`);
      const data = await res.json();
      setCasasDeSaude(data);
    };

    fetchCasasDeSaude();
    
    // Verificar se o usuário é admin
    const adminStatus = localStorage.getItem('isAdmin');
    setIsAdmin(adminStatus === 'true');
  }, []);

  // Atualizar estado do carrossel
  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  // Funções de navegação
  const goToAddHealthCenter = () => {
    router.push('/admin/health-centers/add');
  };

  const goToEditHealthCenter = () => {
    router.push('/admin/health-centers/edit');
  };

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen p-6 transition-colors">
        <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 m-4">
          <h1 className="text-3xl font-bold text-center text-emerald-600 dark:text-emerald-400 mb-8">
            Avisos de Saúde
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Informações importantes sobre as Casas de Saúde da UFPR.
          </p>

          {/* Carrossel responsivo */}
          <div className="relative w-full overflow-hidden">
            <Carousel setApi={setApi} className="w-full max-w-lg mx-auto">
              <CarouselContent>
                {casasDeSaude.map((casa) => (
                  <CarouselItem key={casa.id}>
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center p-6">
                        <h2 className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
                          {casa.nome}
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-2">
                          <strong>Endereço:</strong> {casa.endereco}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 mb-2">
                          <strong>Telefone:</strong> {casa.telefone}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                          <strong>Horário:</strong> {casa.horario}
                        </p>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="absolute inset-y-0 left-4 flex items-center">
                <CarouselPrevious className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-full shadow-md" />
              </div>
              <div className="absolute inset-y-0 right-4 flex items-center">
                <CarouselNext className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-full shadow-md" />
              </div>
            </Carousel>
            <div className="py-4 text-center text-sm text-muted-foreground">
              Slide {current} de {count}
            </div>
          </div>

          {/* Botões de admin para navegação */}
          {isAdmin && (
            <div className="flex justify-center space-x-4 mt-6">
              <Button onClick={goToAddHealthCenter} className="bg-blue-500 hover:bg-blue-600">
                Adicionar Casa de Saúde
              </Button>
              <Button onClick={goToEditHealthCenter} className="bg-yellow-500 hover:bg-yellow-600">
                Editar Casas de Saúde
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
