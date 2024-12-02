export interface Achievement {
  id: number
  userId: string | null
  title: string
  description: string
  category: string
}

export interface Sport {
  id: number
  name: string
  description: string
  location: string
  schedule: string
}

export interface DecodedToken {
  sub: string
  role: string
  idUsuario: number
  nome?: string // Adicionado
  idAcademico?: number // Adicionado
  exp: number
}

export interface Usuario {
  idUsuario: number
  username: string
  nome: string
  foto?: string
  permissao: string
  idAcademico: number // Adicionado
}

export interface Comentario {
  idComentario: number
  descricao: string
  dataComentario: string
  idPublicacao: number
  Usuario: Usuario
  listaUsuarioCurtida: Usuario[]
  listaComentarios?: Comentario[] // Já adicionado para suportar respostas
}

export interface Post {
  idPublicacao: number
  titulo: string
  descricao: string
  dataPublicacao: string | null
  idCanal: number
  idModalidadeEsportiva: number | null
  Usuario: Usuario
  listaUsuarioCurtida: Usuario[]
  listaComentario: Comentario[]
}

export interface User {
  idUsuario: number
  username: string
  role: string
  permissao: string
  nome: string
  foto: string | null
}

// Tipagem para Modalidade Esportiva
export interface Modalidade {
  id: string
  name: string
  description: string
}

// Tipagem para Inscrição
export interface Inscricao {
  id: string
  userId: string
  modalidadeId: string
}

// Função para criar partida
export interface MatchData {
  nome: string
  descricao: string
  localizacao: string
  modalidade: string
  userId: string
  date: string
}

export interface Campeonato {
  idCampeonato: number
  titulo: string
  descricao: string
  aposta: string
  dataInicio: string
  dataFim: string
  ativo: boolean
  limiteTimes: number
  limiteParticipantes: number
  endereco: {
    rua: string
    numero: string
    cidade: string
    estado: string
    cep: string
  }
}

export interface ApoioSaude {
  idApoioSaude: number
  nome: string
  email: string
  telefone: string
  descricao: string
  dataPublicacao: string
  idAdministrador: number
}

export interface Modalidade {
  idModalidadeEsportiva: number
  nome: string
  descricao: string
  status: boolean
}

export interface UserData {
  idAcademico: number
  curso: string
  username: string
  email: string
  nome: string
}

export interface TokenPayload {
  sub: string
  roles: string
  idUsuario: number
  iss: string
  exp: number
}

export interface Endereco {
  cep: string
  uf: string
  cidade: string
  bairro: string
  rua: string
  numero: number
  complemento: string | null
}

export interface Tournament {
  idCampeonato: number
  codigo: string
  titulo: string
  descricao: string
  aposta: string | null
  dataCriacao: string
  dataInicio: string
  dataFim: string
  situacaoCampeonato: string
  usernameCriador: string
  endereco: Endereco
}

export interface PaginatedResponse {
  content: Tournament[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}