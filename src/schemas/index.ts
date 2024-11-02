import { z } from 'zod';

// Esquema de validação usando zod para username e password
export const signInSchema = z.object({
  username: z.string().min(3, 'Nome de usuário deve ter pelo menos 3 caracteres'),
  password: z.string().min(3, 'A senha deve ter pelo menos 6 caracteres'),
});

//
