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
    <form onSubmit={handleSubmit}>
      <div>
        <label>Título</label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Objetivo</label>
        <input
          type="text"
          value={objetivo}
          onChange={(e) => setObjetivo(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Progresso Atual</label>
        <input
          type="number"
          value={progressoAtual}
          onChange={(e) => setProgressoAtual(Number(e.target.value))}
          required
        />
      </div>
      <div>
        <label>Progresso Máximo</label>
        <input
          type="number"
          value={progressoMaximo}
          onChange={(e) => setProgressoMaximo(Number(e.target.value))}
          required
        />
      </div>
      <div>
        <label>Progresso Item</label>
        <input
          type="text"
          value={progressoItem}
          onChange={(e) => setProgressoItem(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Situação Meta Diária</label>
        <select
          value={situacaoMetaDiaria}
          onChange={(e) => setSituacaoMetaDiaria(Number(e.target.value))}
          required
        >
          <option value={0}>Em andamento</option>
          <option value={1}>Concluída</option>
        </select>
      </div>
      <button type="submit">Salvar</button>
    </form>
  )
}

export default GoalForm
