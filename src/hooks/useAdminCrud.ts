import { useState } from 'react'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { createAdmin, fetchAdmins, inactivateAdmin } from '@/http/admin'

interface AuthData {
  isAuthenticated: boolean
  isLoading: boolean
  userId: string | null
}

interface Admin {
  idAdministrador: number
  username: string
  nome: string
  telefone: string
  dataNascimento: string
  permissao: string
  ativo: boolean
}

interface NewAdmin {
  name: string
  email: string
  username: string
  password: string
}

export default function useAdminCrud(currentAdmin: AuthData) {
  const [newAdmin, setNewAdmin] = useState<NewAdmin>({
    name: '',
    email: '',
    username: '',
    password: '',
  })
  const [showAdminsOnly, setShowAdminsOnly] = useState(true)
  const queryClient = useQueryClient()

  const { data: admins = [], isLoading } = useQuery<Admin[]>({
    queryKey: ['admins'],
    queryFn: fetchAdmins,
    enabled: !!currentAdmin,
  })

  const filteredAdmins = showAdminsOnly
    ? admins.filter((admin: Admin) => admin.permissao === 'ADMINISTRADOR')
    : admins

  const handleCreateAdmin = async () => {
    try {
      await createAdmin(newAdmin)
      toast.success('Administrador cadastrado com sucesso.')
      queryClient.invalidateQueries({ queryKey: ['admins'] })
      setNewAdmin({ name: '', email: '', username: '', password: '' }) // Resetar o formulário
    } catch (error) {
      toast.error('Erro ao criar administrador.')
    }
  }

  const handleInactivateAdmin = async (id: number) => {
    try {
      await inactivateAdmin(id)
      toast.success('Administrador inativado com sucesso.')
      queryClient.invalidateQueries({ queryKey: ['admins'] })
    } catch (error) {
      toast.error('Erro ao inativar administrador.')
    }
  }

  return {
    newAdmin,
    setNewAdmin,
    showAdminsOnly,
    setShowAdminsOnly,
    admins: filteredAdmins,
    isLoading,
    handleCreateAdmin,
    handleInactivateAdmin,
  }
}
