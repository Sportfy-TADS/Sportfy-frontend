import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

async function fetchApoioSaude() {
  const response = await fetch('http://localhost:8081/apoioSaude', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (!response.ok) {
    throw new Error('Erro ao buscar apoios à saúde')
  }
  return response.json()
}

export function useApoioSaude() {
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const { data: apoiosSaude = [], isLoading, isError, error } = useQuery({
    queryKey: ['apoiosSaude'],
    queryFn: fetchApoioSaude,
  })

  useEffect(() => {
    if (isError) {
      console.error('Erro ao carregar apoios à saúde:', error)
    }
  }, [isError, error])

  const displayedApoios = useMemo(() => {
    let filteredApoios = [...apoiosSaude]

    if (filter === 'ufpr') {
      filteredApoios = filteredApoios.filter((apoio) => apoio.idAdministrador === 1)
    } else if (filter === 'externo') {
      filteredApoios = filteredApoios.filter((apoio) => apoio.idAdministrador !== 1)
    }

    if (searchTerm) {
      filteredApoios = filteredApoios.filter((apoio) =>
        apoio.nome.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    return filteredApoios
  }, [apoiosSaude, filter, searchTerm])

  return {
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    displayedApoios,
    isLoading,
  }
}