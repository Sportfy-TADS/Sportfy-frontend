import { CheckCircle2 } from 'lucide-react';

interface WeeklySummaryProps {
  summary: any[]; // Adaptar conforme a estrutura de dados que você possui
}

export function WeeklySummary({ summary }: WeeklySummaryProps) {
  return (
    <main className="max-w-[540px] py-10 px-5 mx-auto flex flex-col gap-6">
      <h2 className="text-xl font-medium">Suas Metas</h2>
      <ul className="space-y-3">
        {summary.map(goal => (
          <li key={goal.id} className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-pink-500" />
            <span className="text-sm text-zinc-400">
              {goal.title} - Status: <span className={goal.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}>
                {goal.status === 'completed' ? 'Concluída' : 'Em Andamento'}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
