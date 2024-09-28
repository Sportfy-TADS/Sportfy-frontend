export async function createGoal({ title, desiredWeeklyFrequency, userId: String }) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, desiredWeeklyFrequency, userId }),
  });
  if (!response.ok) {
    throw new Error('Erro ao criar a meta');
  }
  return await response.json();
}
