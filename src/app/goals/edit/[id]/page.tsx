'use client'

import { useState, useEffect } from 'react'

import { useRouter, useParams } from 'next/navigation'

import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function EditGoalPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('in_progress') // Estado padrão
  const [error, setError] = useState('')
  const router = useRouter()
  const { id } = useParams() // Captura o ID da meta da URL

  useEffect(() => {
    const fetchGoal = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/goals/${id}`,
        )
        if (!res.ok) throw new Error('Erro ao carregar meta')

        const goal = await res.json()
        setTitle(goal.title)
        setDescription(goal.description)
        setStatus(goal.status)
      } catch (e) {
        setError('Erro ao carregar a meta')
      }
    }
    fetchGoal()
  }, [id])

  const handleUpdate = async () => {
    if (!title || !description) {
      setError('Por favor, preencha todos os campos.')
      return
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/goals/${id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description, status }),
        },
      )
      if (res.ok) {
        alert('Meta atualizada com sucesso!')
        router.push('/goals')
      } else {
        setError('Erro ao atualizar a meta')
      }
    } catch (e) {
      setError('Erro ao atualizar a meta')
    }
  }

  return (
    <>
      <Header />

      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
        <div className="w-full max-w-md bg-white p-8 rounded-md shadow-md dark:bg-gray-800">
          <h2 className="mb-4 text-2xl font-semibold text-center text-black dark:text-white">
            Editar Meta
          </h2>
          {error && (
            <div className="mb-4 text-red-500 text-center">{error}</div>
          )}

          <Input
            type="text"
            className="w-full p-2 mb-4 text-black dark:text-white"
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Input
            type="text"
            className="w-full p-2 mb-4 text-black dark:text-white"
            placeholder="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2 text-black dark:text-white">
              Status:
            </label>
            <Select onValueChange={setStatus} value={status}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Escolha um status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleUpdate}
            className="w-full p-2 font-semibold text-white bg-blue-500 hover:bg-blue-600"
          >
            Atualizar Meta
          </Button>
        </div>
      </div>
    </>
  )
}
