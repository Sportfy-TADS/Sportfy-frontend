import { useMemo } from 'react'

/**
 * Hook para obter as iniciais de um nome de forma consistente
 * @param name - Nome do usuário
 * @param username - Username como fallback
 * @returns String com a inicial em maiúscula
 */
export const useInitials = (name?: string, username?: string): string => {
  return useMemo(() => {
    if (name && name.trim() !== '') {
      return name.trim().charAt(0).toUpperCase()
    }
    if (username && username.trim() !== '') {
      return username.trim().charAt(0).toUpperCase()
    }
    return 'U'
  }, [name, username])
}

/**
 * Função utilitária para obter iniciais sem usar React Hook
 * @param name - Nome do usuário
 * @param username - Username como fallback
 * @returns String com a inicial em maiúscula
 */
export const getInitials = (name?: string, username?: string): string => {
  if (name && name.trim() !== '') {
    return name.trim().charAt(0).toUpperCase()
  }
  if (username && username.trim() !== '') {
    return username.trim().charAt(0).toUpperCase()
  }
  return 'U'
}