import { useState } from 'react'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

interface GoalFormData {
  titulo: string
  descricao: string
  progressoMaximo: number
  progressoItem: string
  situacaoMetaDiaria?: number
  progressoAtual?: number
}

interface GoalFormProps {
  onSubmit: (data: GoalFormData) => void
  defaultValues?: GoalFormData
  isEditMode?: boolean
}

export default function GoalForm({
  onSubmit,
  defaultValues,
  isEditMode = false,
}: GoalFormProps) {
  const [titulo, setTitulo] = useState(defaultValues?.titulo || '')
  const [descricao, setDescricao] = useState(defaultValues?.descricao || '')
  const [progressoMaximo, setProgressoMaximo] = useState(
    defaultValues?.progressoMaximo || 0,
  )
  const [progressoItem, setProgressoItem] = useState(
    defaultValues?.progressoItem || 'unidade',
  )
  const [progressoAtual, setProgressoAtual] = useState(
    defaultValues?.progressoAtual || 0,
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData: GoalFormData = {
      titulo,
      descricao,
      progressoMaximo,
      progressoItem,
      situacaoMetaDiaria: defaultValues?.situacaoMetaDiaria || 0,
    }

    if (isEditMode) {
      formData.progressoAtual = progressoAtual
    }

    try {
      onSubmit(formData)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <Label>Título</Label>
        <Input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Exemplo: Hidrate-se"
          required
          disabled={isEditMode}
        />
        {titulo === '' && (
          <p className="error-message">O título é obrigatório.</p>
        )}
      </div>
      <div className="mb-4">
        <Label>Descrição</Label>
        <Input
          type="text"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Exemplo: Beber 2 litros de água"
          required
          disabled={isEditMode}
        />
        {descricao === '' && (
          <p className="error-message">A descrição é obrigatória.</p>
        )}
      </div>
      <div className="mb-4">
        <Label>Objetivo</Label>
        <Input
          type="number"
          value={progressoMaximo}
          onChange={(e) => setProgressoMaximo(Number(e.target.value))}
          placeholder="Exemplo: 2"
          required
          disabled={isEditMode}
        />
        {progressoMaximo === 0 && (
          <p className="error-message">O objetivo é obrigatório.</p>
        )}
      </div>
      <div className="mb-4">
        <Label>Medida</Label>
        <Input
          type="text"
          value={progressoItem}
          onChange={(e) => setProgressoItem(e.target.value)}
          placeholder="Exemplo: Litros, Quilômetros, Páginas"
          required
          disabled={isEditMode}
        />
        {progressoItem === '' && (
          <p className="error-message">A medida é obrigatória.</p>
        )}
      </div>

      {isEditMode && (
        <div className="mb-4">
          <Label>Progresso Atual</Label>
          <Input
            type="number"
            value={progressoAtual}
            onChange={(e) => setProgressoAtual(Number(e.target.value))}
            placeholder="Exemplo: 1"
            required
          />
        </div>
      )}

      <Button
        type="submit"
        disabled={
          isEditMode
            ? !progressoAtual
            : !titulo || !descricao || !progressoMaximo || !progressoItem
        }
      >
        {isEditMode ? 'Atualizar' : 'Criar'}
      </Button>
    </form>
  )
}
