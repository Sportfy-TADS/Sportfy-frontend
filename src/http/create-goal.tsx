// http/create-goal.ts
export async function createGoal(data: { title: string; frequency: number }) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Erro ao criar meta');
  return await response.json();
}
