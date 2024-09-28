export async function getGoals(userId: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/goals?userId=${userId}`);
  if (!response.ok) {
    throw new Error('Erro ao buscar metas');
  }
  return await response.json();
}
