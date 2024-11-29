import { useState } from 'react'

interface GoalFormProps {
  onSubmit: (data: any) => void
  defaultValues?: any
}

const GoalForm = ({ onSubmit, defaultValues }: GoalFormProps) => {
  const [titulo, setTitulo] = useState(defaultValues?.titulo || '')
  const [objetivo, setObjetivo] = useState(defaultValues?.objetivo || '')
  const [progressoAtual, setProgressoAtual] = useState(defaultValues?.progressoAtual || 0)
  const [progressoMaximo, setProgressoMaximo] = useState(defaultValues?.progressoMaximo || 0)
  const [progressoItem, setProgressoItem] = useState(defaultValues?.progressoItem || 'unidade')
  const [situacaoMetaDiaria, setSituacaoMetaDiaria] = useState(defaultValues?.situacaoMetaDiaria || 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      titulo,
      objetivo,
      progressoAtual,
      progressoMaximo,
      progressoItem,
      situacaoMetaDiaria,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Título</label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Objetivo</label>
        <input
          type="text"
          value={objetivo}
          onChange={(e) => setObjetivo(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Progresso Atual</label>
        <input
          type="number"
          value={progressoAtual}
          onChange={(e) => setProgressoAtual(Number(e.target.value))}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Progresso Máximo</label>
        <input
          type="number"
          value={progressoMaximo}
          onChange={(e) => setProgressoMaximo(Number(e.target.value))}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Progresso Item</label>
        <input
          type="text"
          value={progressoItem}
          onChange={(e) => setProgressoItem(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Situação Meta Diária</label>
        <select
          value={situacaoMetaDiaria}
          onChange={(e) => setSituacaoMetaDiaria(Number(e.target.value))}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value={0}>Em andamento</option>
          <option value={1}>Concluída</option>
        </select>
      </div>
      <button
        type="submit"
        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Salvar
      </button>
    </form>
  )
}

export default GoalForm
