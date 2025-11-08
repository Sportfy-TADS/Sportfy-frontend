'use client'

import { Save } from 'lucide-react'
import { useCallback } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ApoioSaudeFormProps {
  formData: {
    nome: string
    email: string
    telefone: string
    descricao: string
  }
  onFormDataChange: (data: any) => void
  onSubmit: (e: React.FormEvent) => void
  isSubmitting: boolean
  editMode: boolean
}

function maskPhoneNumber(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d{4,5})(\d{4})$/, '$1-$2')
}

export function ApoioSaudeForm({ 
  formData, 
  onFormDataChange, 
  onSubmit, 
  isSubmitting, 
  editMode 
}: ApoioSaudeFormProps) {
  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedPhone = maskPhoneNumber(e.target.value)
    onFormDataChange({
      ...formData,
      telefone: maskedPhone,
    })
  }, [formData, onFormDataChange])

  const handleChange = useCallback((field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onFormDataChange({
      ...formData,
      [field]: e.target.value,
    })
  }, [formData, onFormDataChange])

  return (
    <form className="space-y-4 mt-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="nome">Nome *</Label>
        <Input
          id="nome"
          placeholder="Nome do apoio à saúde"
          value={formData.nome}
          onChange={handleChange('nome')}
          required
          disabled={isSubmitting}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          placeholder="email@exemplo.com"
          value={formData.email}
          onChange={handleChange('email')}
          required
          disabled={isSubmitting}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="telefone">Telefone *</Label>
        <Input
          id="telefone"
          placeholder="(11) 99999-9999"
          value={formData.telefone}
          onChange={handlePhoneChange}
          maxLength={15}
          required
          disabled={isSubmitting}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição *</Label>
        <Input
          id="descricao"
          placeholder="Descrição do apoio à saúde"
          value={formData.descricao}
          onChange={handleChange('descricao')}
          required
          disabled={isSubmitting}
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        <Save className="h-4 w-4 mr-2" />
        {isSubmitting ? 'Salvando...' : 'Salvar'}
      </Button>
    </form>
  )
}
