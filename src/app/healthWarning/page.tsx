'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';

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
  const [isAdmin, setIsAdmin] = useState(false); // Verificar se o usuário é admin
  const [editingCasa, setEditingCasa] = useState<CasaDeSaude | null>(null); // Para edição
  const [formData, setFormData] = useState<CasaDeSaude>({
    id: 0,
    nome: '',
    endereco: '',
    telefone: '',
    horario: ''
  });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddOrUpdate = async () => {
    try {
      const method = editingCasa ? 'PATCH' : 'POST';
      const url = editingCasa
        ? `${process.env.NEXT_PUBLIC_API_URL}/casasDeSaude/${editingCasa.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/casasDeSaude`;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Erro ao salvar a casa de saúde.');

      const updatedData = await res.json();
      if (editingCasa) {
        setCasasDeSaude(casasDeSaude.map(c => (c.id === updatedData.id ? updatedData : c)));
      } else {
        setCasasDeSaude([...casasDeSaude, updatedData]);
      }

      toast.success('Casa de Saúde salva com sucesso!');
      setFormData({ id: 0, nome: '', endereco: '', telefone: '', horario: '' });
      setEditingCasa(null);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEdit = (casa: CasaDeSaude) => {
    setEditingCasa(casa);
    setFormData(casa);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Você realmente deseja excluir esta casa de saúde?')) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/casasDeSaude/${id}`, {
          method: 'DELETE',
        });
        
        if (!res.ok) throw new Error('Erro ao excluir a casa de saúde.');

        setCasasDeSaude(casasDeSaude.filter(casa => casa.id !== id));
        toast.success('Casa de Saúde excluída com sucesso!');
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 m-4">
          <h1 className="text-3xl font-bold text-center text-emerald-600 dark:text-emerald-400 mb-8">
            Avisos de Saúde
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Informações importantes sobre as Casas de Saúde da UFPR.
          </p>

          {/* Exibição das casas de saúde */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {casasDeSaude.map((casa) => (
              <Card key={casa.id} className="shadow-md">
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
                  {isAdmin && (
                    <div className="flex mt-4 space-x-2">
                      <Button onClick={() => handleEdit(casa)} className="bg-yellow-500 hover:bg-yellow-600">
                        Editar
                      </Button>
                      <Button onClick={() => handleDelete(casa.id)} className="bg-red-500 hover:bg-red-600">
                        Excluir
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Formulário para adicionar/editar casas de saúde */}
          {isAdmin && (
            <Sheet>
              <SheetTrigger asChild>
                <Button className="bg-blue-500 hover:bg-blue-600">Adicionar Casa de Saúde</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>{editingCasa ? 'Editar Casa de Saúde' : 'Adicionar Casa de Saúde'}</SheetTitle>
                </SheetHeader>
                <div className="space-y-4">
                  <Input
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Nome da Casa de Saúde"
                  />
                  <Input
                    name="endereco"
                    value={formData.endereco}
                    onChange={handleChange}
                    placeholder="Endereço"
                  />
                  <Input
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    placeholder="Telefone"
                  />
                  <Input
                    name="horario"
                    value={formData.horario}
                    onChange={handleChange}
                    placeholder="Horário"
                  />
                  <Button onClick={handleAddOrUpdate} className="bg-green-500 hover:bg-green-600">
                    {editingCasa ? 'Atualizar' : 'Salvar'}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </>
  );
}
