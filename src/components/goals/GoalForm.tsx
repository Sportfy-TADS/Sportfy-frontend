import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createGoalSchema } from '@/schemas'

type CreateGoalSchema = z.infer<typeof createGoalSchema>

export default function GoalForm({ onSubmit, defaultValues = {} }: any) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateGoalSchema>({
    resolver: zodResolver(createGoalSchema),
    defaultValues,
  })

  const handleFormSubmit = (data: CreateGoalSchema) => {
    onSubmit(data)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 mt-8">
      <div>
        <Label htmlFor="titulo">Atividade</Label>
        <Input
          id="titulo"
          placeholder="Praticar exercícios..."
          {...register('titulo')}
        />
        {errors.titulo && (
          <p className="text-red-500">{errors.titulo.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="objetivo">Objetivo</Label>
        <Input
          id="objetivo"
          placeholder="Correr 5 km todos os dias..."
          {...register('objetivo')}
        />
        {errors.objetivo && (
          <p className="text-red-500">{errors.objetivo.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="progressoMaximo">Progresso Máximo</Label>
        <Input
          id="progressoMaximo"
          type="number"
          placeholder="5"
          {...register('progressoMaximo')}
        />
        {errors.progressoMaximo && (
          <p className="text-red-500">{errors.progressoMaximo.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full bg-green-500 hover:bg-green-600">
        Salvar Meta
      </Button>
    </form>
  )
}
