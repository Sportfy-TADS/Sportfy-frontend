import { useState } from 'react'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { fetchAdmins, createAdmin, inactivateAdmin } from '@/http/admin'

export default function useAdminCrud(currentAdmin) {
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
  })
  const [showAdminsOnly, setShowAdminsOnly] = useState(true)
  const queryClient = useQueryClient()

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ['admins'],
    queryFn: fetchAdmins,
    enabled: !!currentAdmin,
  })

  const filteredAdmins = showAdminsOnly
    ? admins.filter((admin) => admin.isAdmin)
    : admins

  const handleCreateAdmin = async () => {
    try {
      await createAdmin(newAdmin)
      toast.success('Administrador cadastrado com sucesso.')
      queryClient.invalidateQueries(['admins'])
      setNewAdmin({ name: '', email: '', username: '', password: '' }) // Resetar o formulário
    } catch (error) {
      toast.error('Erro ao cadastrar o administrador.')
    }
  }

  const handleInactivateAdmin = async (id) => {
    try {
      await inactivateAdmin(id)
      toast.success('Administrador inativado com sucesso.')
      queryClient.invalidateQueries(['admins'])
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
