export interface ApoioSaude {
  idApoioSaude: number
  nome: string
  email: string
  telefone: string
  descricao: string
  dataPublicacao: string
  idAdministrador: number
  ativo: boolean
}

export interface CreateApoioSaudeDTO {
  nome: string
  email: string
  telefone: string
  descricao: string
  dataPublicacao: string
  idAdministrador: number
  ativo: boolean
}

export interface UpdateApoioSaudeDTO {
  nome: string
  email: string
  telefone: string
  descricao: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
