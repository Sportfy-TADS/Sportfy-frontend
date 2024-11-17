import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'

import { getApoioSaude } from '@/http/health'
import { ApoioSaude } from '@/interface/types'

export function useApoioSaude() {
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Query para buscar os dados de apoio à saúde
  const { data: apoios = [], isLoading } = useQuery({
    queryKey: ['apoioSaude'],
    queryFn: getApoioSaude,
  })

  // Função de filtro
  const filteredApoios = apoios.filter((apoio: ApoioSaude) => {
    if (filter === 'all') return true
    return filter === 'ufpr'
      ? apoio.idAdministrador === 1
      : apoio.idAdministrador !== 1
  })

  // Filtrando com base no termo de busca
  const displayedApoios = searchTerm
    ? filteredApoios.filter((apoio: ApoioSaude) =>
        apoio.nome.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : filteredApoios

  return {
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    displayedApoios,
    isLoading,
  }
}
