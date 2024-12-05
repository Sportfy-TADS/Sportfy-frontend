import { useState } from 'react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

interface GoalFormProps {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  defaultValues?: any
}

export default function GoalForm({ onSubmit, defaultValues }: GoalFormProps) {
  const [titulo, setTitulo] = useState(defaultValues?.titulo || '')
  const [descricao, setDescricao] = useState(defaultValues?.descricao || '')
  const [progressoMaximo, setProgressoMaximo] = useState(
    defaultValues?.progressoMaximo || 0,
  )
  const [progressoItem, setProgressoItem] = useState(
    defaultValues?.progressoItem || 'unidade',
  )
  const [customProgressoItem, setCustomProgressoItem] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = {
      titulo,
      descricao,
      progressoMaximo,
      progressoItem:
        progressoItem === 'outro' ? customProgressoItem : progressoItem,
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
        />
        {progressoItem === '' && (
          <p className="error-message">A medida é obrigatória.</p>
        )}
      </div>
      <Button
        type="submit"
        disabled={!titulo || !descricao || !progressoMaximo || !progressoItem}
      >
        Criar
      </Button>
    </form>
  )
}
