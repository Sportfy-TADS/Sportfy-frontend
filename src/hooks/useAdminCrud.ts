import { useState } from 'react'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { createAdmin, fetchAdmins, inactivateAdmin } from '@/http/admin'

export default function useAdminCrud(currentAdmin: any) {
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    password: '',
    nome: '',
    telefone: '',
    dataNascimento: '',
    foto: null as File | null,
    dataCriacao: null as Date | null,
    ativo: null as boolean | null,
  })
  const [showAdminsOnly, setShowAdminsOnly] = useState(true)
  const queryClient = useQueryClient()

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ['admins'],
    queryFn: fetchAdmins,
    enabled: !!currentAdmin,
  })

  const filteredAdmins = showAdminsOnly
    ? admins.filter((admin: any) => admin.isAdmin)
    : admins

  const handleCreateAdmin = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) {
        toast.error('Você precisa estar autenticado para cadastrar um administrador.')
        return
      }

      await createAdmin(newAdmin)
      toast.success('Administrador cadastrado com sucesso.')
      queryClient.invalidateQueries({ queryKey: ['admins'] })
      setNewAdmin({
        username: '',
        password: '',
        nome: '',
        telefone: '',
        dataNascimento: '',
        foto: null,
        dataCriacao: null,
        ativo: null,
      }) // Resetar o formulário
    } catch (error) {
      toast.error('Erro ao cadastrar o administrador.')
    }
  }

  const handleInactivateAdmin = async (id: number) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) {
        toast.error('Você precisa estar autenticado para inativar um administrador.')
        return
      }

      await inactivateAdmin(id)
      toast.success('Administrador inativado com sucesso.')
      queryClient.invalidateQueries({ queryKey: ['admins'] })
    } catch (error) {
      toast.error('Erro ao inativar o administrador.')
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
