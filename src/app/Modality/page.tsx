'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import Header from '@/components/Header';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useRouter } from 'next/navigation';

interface Modalidade {
  id: string;
  name: string;
  description: string;
  schedule: string;
  location: string;
  inscrito: boolean;
}

export default function ModalidadeInscricaoPage() {
  const [modalidades, setModalidades] = useState<Modalidade[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  // Buscar modalidades e verificar se o usuário já está inscrito
  useEffect(() => {
    const fetchModalidades = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        router.push('/auth'); // Redireciona para login se não houver ID do usuário
        return;
      }
      setUserId(userId);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sports`);
      const data = await res.json();

      // Verificar se o usuário já está inscrito em cada modalidade
      const inscricoesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inscricoes?userId=${userId}`);
      const inscricoesData = await inscricoesRes.json();

      const modalidadesComInscricao = data.map((modalidade: Modalidade) => ({
        ...modalidade,
        inscrito: inscricoesData.some((inscricao: any) => inscricao.modalidadeId === modalidade.id),
      }));

      setModalidades(modalidadesComInscricao);
    };

    fetchModalidades();
  }, [router]);

  // Função para inscrever o usuário em uma modalidade
  const handleInscricao = async (modalidadeId: string) => {
    if (!userId) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inscricoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, modalidadeId }),
      });

      if (res.ok) {
        const updatedModalidades = modalidades.map((modalidade) =>
          modalidade.id === modalidadeId ? { ...modalidade, inscrito: true } : modalidade
        );
        setModalidades(updatedModalidades);
        alert('Inscrição realizada com sucesso!');
      } else {
        alert('Erro ao realizar inscrição.');
      }
    } catch (e) {
      console.error('Erro ao realizar inscrição:', e);
    }
  };

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
        <div className="w-full max-w-7xl">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Modalidades Disponíveis</h1>

          {/* Exibição das modalidades disponíveis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {modalidades.length > 0 ? (
              modalidades.map((modalidade) => (
                <Card key={modalidade.id} className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">{modalidade.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-800 dark:text-gray-200 mb-2">{modalidade.description}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <strong>Horário:</strong> {modalidade.schedule}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <strong>Local:</strong> {modalidade.location}
                    </p>
                    <Button
                      onClick={() => handleInscricao(modalidade.id)}
                      className="w-full"
                      disabled={modalidade.inscrito}
                    >
                      {modalidade.inscrito ? 'Inscrito' : 'Inscrever-se'}
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center col-span-full text-gray-700 dark:text-gray-300">Nenhuma modalidade disponível.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
