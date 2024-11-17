import { z } from 'zod'

// Esquema de validação usando zod para username e password
export const signInSchema = z.object({
  username: z
    .string()
    .min(3, 'Nome de usuário deve ter pelo menos 3 caracteres'),
  password: z.string().min(4, 'A senha deve ter pelo menos 6 caracteres'),
})

// Esquema de validação usando zod para sign up
export const signUpSchema = z.object({
  curso: z.string().min(3, 'O curso deve ter pelo menos 3 caracteres'),
  username: z
    .string()
    .min(3, 'Nome de usuário deve ter pelo menos 3 caracteres'),
  email: z
    .string()
    .email()
    .regex(/@ufpr\.br$/, 'Email deve ser do domínio @ufpr.br'),
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 caracteres'),
  dataNascimento: z.string(),
})

export const createGoalSchema = z.object({
  titulo: z.string().min(1, 'Informe a atividade que deseja praticar'),
  objetivo: z.string().min(1, 'Informe o objetivo da meta'),
  progressoMaximo: z.coerce
    .number()
    .min(1, 'Informe o progresso máximo para a meta'),
})
