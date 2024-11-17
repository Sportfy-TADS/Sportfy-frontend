import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jwtDecode } from 'jwt-decode'
import { toast } from 'sonner'

import {
  fetchApoioSaude,
  createApoioSaude,
  updateApoioSaude,
  inactivateApoioSaude,
} from '@/http/health'

export function useApoioSaude() {
  const [currentApoio, setCurrentApoio] = useState(null)
  const [newApoio, setNewApoio] = useState({
    nome: '',
    email: '',
    telefone: '',
    descricao: '',
  })
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Usuário não está logado.')
      router.push('/auth')
      return
    }

    const decoded = jwtDecode(token)
    if ((decoded as any).role !== 'ADMINISTRADOR') {
      toast.error(
        'Acesso negado! Somente administradores podem acessar esta página.',
      )
      router.push('/')
    }
  }, [router])

  const { data: apoios = [], isLoading } = useQuery({
    queryKey: ['apoioSaude'],
    queryFn: fetchApoioSaude,
  })

  const createMutation = useMutation({
    mutationFn: createApoioSaude,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apoioSaude'] })
      toast.success('Apoio à saúde cadastrado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao cadastrar apoio à saúde.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string
      nome: string
      email: string
      telefone: string
      descricao: string
    }) => updateApoioSaude(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apoioSaude'] })
      toast.success('Apoio à saúde atualizado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao atualizar apoio à saúde.')
    },
  })

  const inactivateMutation = useMutation({
    mutationFn: inactivateApoioSaude,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apoioSaude'] })
      toast.success('Apoio à saúde inativado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao inativar apoio à saúde.')
    },
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(newApoio)
    setNewApoio({ nome: '', email: '', telefone: '', descricao: '' })
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentApoio) {
      updateMutation.mutate({ id: currentApoio.idApoioSaude, ...newApoio })
      setCurrentApoio(null)
      setNewApoio({ nome: '', email: '', telefone: '', descricao: '' })
    }
  }

  const handleInactivate = (id: string) => {
    inactivateMutation.mutate(id)
  }

  const filteredApoios = apoios
    .filter((apoio: any) => {
      if (filter === 'all') return true
      if (filter === 'ufpr') return apoio.idAdministrador === 1
      return apoio.idAdministrador !== 1
    })
    .filter((apoio: any) =>
      apoio.nome.toLowerCase().includes(searchTerm.toLowerCase()),
    )

  return {
    currentApoio,
    setCurrentApoio,
    newApoio,
    setNewApoio,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    isLoading,
    filteredApoios,
    handleCreate,
    handleUpdate,
    handleInactivate,
  }
}
