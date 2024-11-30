import { useState } from 'react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../ui/select'
import { Button } from '../ui/button'

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
  const [customProgressoItem, setCustomProgressoItem] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = {
      titulo,
      objetivo,
      progressoAtual,
      progressoMaximo,
      progressoItem: progressoItem === 'outro' ? customProgressoItem : progressoItem,
      situacaoMetaDiaria: Number(situacaoMetaDiaria)
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
          required
        />
      </div>
      <div className="mb-4">
        <Label>Objetivo</Label>
        <Input
          type="text"
          value={objetivo}
          onChange={(e) => setObjetivo(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <Label>Progresso Atual</Label>
        <Input
          type="number"
          value={progressoAtual}
          onChange={(e) => setProgressoAtual(Number(e.target.value))}
          required
        />
      </div>
      <div className="mb-4">
        <Label>Progresso Máximo</Label>
        <Input
          type="number"
          value={progressoMaximo}
          onChange={(e) => setProgressoMaximo(Number(e.target.value))}
          required
        />
      </div>
      <div className="mb-4">
        <Label>Progresso Item</Label>
        <Select
          value={progressoItem}
          onValueChange={(value) => setProgressoItem(value)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma opção" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="litros">Litros</SelectItem>
            <SelectItem value="metros">Metros</SelectItem>
            <SelectItem value="quilometros">Quilômetros</SelectItem>
            <SelectItem value="repeticoes">Repetições</SelectItem>
            <SelectItem value="paginas">Páginas</SelectItem>
            <SelectItem value="horas_estudo">Horas de Estudo</SelectItem>
            <SelectItem value="horas_exercicio">Horas de Exercício</SelectItem>
            <SelectItem value="nao_se_aplica">Não se aplica</SelectItem>
            <SelectItem value="outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {progressoItem === 'outro' && (
        <div className="mb-4">
          <Label>Especifique o Progresso Item</Label>
          <Input
            type="text"
            value={customProgressoItem}
            onChange={(e) => setCustomProgressoItem(e.target.value)}
            required
          />
        </div>
      )}
      <div className="mb-4">
        <Label>Situação Meta Diária</Label>
        <Select
          value={situacaoMetaDiaria.toString()}
          onValueChange={(value) => setSituacaoMetaDiaria(Number(value))}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma opção" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Em andamento</SelectItem>
            <SelectItem value="1">Concluída</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit">Salvar</Button>
    </form>
  )
}

export default GoalForm
