// components/CreateGoal.tsx
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { createGoal } from '@/http/create-goal'

const createGoalSchema = z.object({
  title: z.string().min(1, 'Informe a atividade que deseja praticar'),
  frequency: z.coerce
    .number()
    .min(1)
    .max(7, 'Escolha entre 1 e 7 vezes na semana'),
})

type CreateGoalSchema = z.infer<typeof createGoalSchema>

export function CreateGoal() {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<CreateGoalSchema>({
    resolver: zodResolver(createGoalSchema),
  })

  async function handleCreateGoal(data: CreateGoalSchema) {
    try {
      await createGoal(data)
      reset()
      queryClient.invalidateQueries(['goals'])
      toast.success('Meta criada com sucesso!')
    } catch {
      toast.error('Erro ao criar a meta')
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Cadastrar Meta</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit(handleCreateGoal)} className="space-y-4">
        <div>
          <Label htmlFor="title">Atividade</Label>
          <Input
            id="title"
            placeholder="Ex: Praticar exercícios"
            {...register('title')}
          />
          {errors.title && (
            <p className="text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div>
          <Label>Frequência Semanal</Label>
          <Controller
            name="frequency"
            control={control}
            render={({ field }) => (
              <RadioGroup
                value={String(field.value)}
                onValueChange={field.onChange}
              >
                {Array.from({ length: 7 }).map((_, i) => (
                  <RadioGroupItem key={i} value={String(i + 1)}>
                    {i + 1}x por semana
                  </RadioGroupItem>
                ))}
              </RadioGroup>
            )}
          />
          {errors.frequency && (
            <p className="text-red-500">{errors.frequency.message}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="secondary">Cancelar</Button>
          <Button type="submit">Salvar</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
