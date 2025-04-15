import axios from 'axios'

import { z } from 'zod'

const createGoalSchema = z.object({
  title: z.string(),
  frequency: z.number(),
})

type CreateGoalInput = z.infer<typeof createGoalSchema>

export async function createGoal(data: CreateGoalInput) {
  // Ajuste a URL conforme necessário para o endpoint correto
  await axios.post('/api/goals', data)
}
