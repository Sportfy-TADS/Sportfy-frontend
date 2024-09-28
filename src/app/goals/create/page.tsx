'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Header from '@/components/Header';

const createGoalSchema = z.object({
  title: z.string().min(1, 'Informe a atividade que deseja praticar'),
  desiredWeeklyFrequency: z.coerce.number().min(1).max(7),
});

type CreateGoalSchema = z.infer<typeof createGoalSchema>;

export default function CreateGoalPage() {
  const { register, handleSubmit, formState: { errors }, control, reset } = useForm<CreateGoalSchema>({
    resolver: zodResolver(createGoalSchema),
  });
  const router = useRouter();
  const [error, setError] = useState('');

  const handleCreateGoal = async ({ title, desiredWeeklyFrequency }: CreateGoalSchema) => {
    const userId = localStorage.getItem('userId'); // Obtém o ID do usuário
    if (!userId) {
      setError('Usuário não autenticado');
      return;
    }

    const newGoal = {
      title,
      description: `Praticar ${title} ${desiredWeeklyFrequency}x por semana`,
      userId,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGoal),
      });

      if (res.ok) {
        alert('Meta criada com sucesso!');
        reset();
        router.push('/goals'); // Redireciona para a página de metas
      } else {
        setError('Erro ao criar meta');
      }
    } catch (e) {
      setError('Erro ao criar meta');
    }
  };

  return (
    <>
    <Header />
    
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="w-full max-w-lg bg-white p-8 rounded-md shadow-md dark:bg-gray-800">
        <h2 className="mb-4 text-2xl font-semibold text-center text-black dark:text-white">Criar Nova Meta</h2>
        {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
        
        <form onSubmit={handleSubmit(handleCreateGoal)}>
          {/* Campo de Título */}
          <div className="mb-4">
            <Label htmlFor="title">Atividade</Label>
            <Input
              id="title"
              type="text"
              placeholder="Qual a atividade?"
              {...register('title')}
              className="w-full p-2 text-black dark:text-white"
            />
            {errors.title && (
              <p className="text-sm text-red-400">{errors.title.message}</p>
            )}
          </div>

          {/* Frequência Semanal Desejada */}
          <div className="mb-4">
            <Label htmlFor="desiredWeeklyFrequency">Frequência Semanal</Label>
            <Controller
              control={control}
              name="desiredWeeklyFrequency"
              defaultValue={5}
              render={({ field }) => (
                <RadioGroup value={String(field.value)} onValueChange={field.onChange}>
                  <div className="flex gap-3">
                    {Array.from({ length: 7 }).map((_, i) => {
                      const frequency = String(i + 1);
                      return (
                        <RadioGroupItem key={i} value={frequency}>
                          <span>{frequency}x na semana</span>
                        </RadioGroupItem>
                      );
                    })}
                  </div>
                </RadioGroup>
              )}
            />
          </div>

          <Button type="submit" className="w-full p-2 font-semibold text-white bg-blue-500 hover:bg-blue-600">
            Criar Meta
          </Button>
        </form>
      </div>
    </div>
    </>
  );
}
