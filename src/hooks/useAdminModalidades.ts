import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { jwtDecode, JwtPayload } from 'jwt-decode'
import { toast } from 'sonner'

import {
    createModalidade,
    desativarModalidade,
    getModalidades,
    inscreverModalidade,
    Modalidade,
    searchModalidade,
    updateModalidade,
} from '@/http/modality'

interface DecodedToken extends JwtPayload {
  role: string
  idUsuario: number
}

export function useAdminModalidades() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [userId, setUserId] = useState<number | null>(null)
  const [filter, setFilter] = useState('all')
  const [modalidadeForm, setModalidadeForm] = useState<Partial<Modalidade>>({
    nome: '',
    descricao: '',
  })
  const [editMode, setEditMode] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    const checkAdminStatus = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth')
        return
      }

      const decoded = jwtDecode<DecodedToken>(token)
      if (decoded.role !== 'ADMINISTRADOR') {
        toast.error(
          'Acesso negado! Somente administradores podem acessar esta página.',
        )
        router.push('/')
        return
      }

      setUserId(decoded.idUsuario)
      setIsAdmin(true)
    }
    checkAdminStatus()
  }, [router])

  const { data: modalidades = [], isLoading } = useQuery({
    queryKey: ['modalidades'],
    queryFn: getModalidades,
    enabled: isAdmin,
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<Modalidade>) => createModalidade(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modalidades'] })
      toast.success('Modalidade criada com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao criar modalidade')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: Modalidade) => updateModalidade(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modalidades'] })
      toast.success('Modalidade editada com sucesso!')
      setEditMode(false)
    },
    onError: () => {
      toast.error('Erro ao editar modalidade')
    },
  })

  const desativarMutation = useMutation({
    mutationFn: (id: number) => desativarModalidade(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modalidades'] })
      toast.success('Modalidade desativada com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao desativar modalidade')
    },
  })

  const inscreverMutation = useMutation({
    mutationFn: (idModalidadeEsportiva: number) =>
      inscreverModalidade(userId!, idModalidadeEsportiva),
    onSuccess: () => {
      toast.success('Inscrição realizada com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao se inscrever na modalidade')
    },
  })

  const handleCreateModalidade = () => {
    if (!modalidadeForm.nome || !modalidadeForm.descricao) {
      toast.error('Todos os campos são obrigatórios')
      return
    }
    createMutation.mutate(modalidadeForm)
  }

  const handleEditModalidade = (modalidade: Modalidade) => {
    setEditMode(true)
    setModalidadeForm(modalidade)
  }

  const handleUpdateModalidade = () => {
    if (!modalidadeForm.nome || !modalidadeForm.descricao) {
      toast.error('Todos os campos são obrigatórios')
      return
    }
    updateMutation.mutate(modalidadeForm as Modalidade)
  }

  const handleDesativarModalidade = (id: number) => {
    desativarMutation.mutate(id)
  }

  const handleInscrever = (idModalidadeEsportiva: number) => {
    inscreverMutation.mutate(idModalidadeEsportiva)
  }

  const handleSearch = async () => {
    try {
      const data = await searchModalidade(searchTerm)
      queryClient.setQueryData(['modalidades'], [data])
    } catch (error) {
      toast.error('Modalidade não encontrada')
    }
  }

  return {
    isAdmin,
    userId,
    filter,
    setFilter,
    modalidadeForm,
    setModalidadeForm,
    editMode,
    setEditMode,
    searchTerm,
    setSearchTerm,
    modalidades,
    isLoading,
    handleCreateModalidade,
    handleEditModalidade,
    handleUpdateModalidade,
    handleDesativarModalidade,
    handleInscrever,
    handleSearch,
  }
}
