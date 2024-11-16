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
  exp: number
}

export interface Comment {
  idComentario: number
  descricao: string
  Usuario: {
    idUsuario: number
    username: string
  }
  listaUsuarioCurtida: number[]
}

export interface Comentario {
  idComentario: number
  descricao: string
  idPublicacao: number
  Usuario: {
    idUsuario: number
    username: string
    nome: string
    foto?: string | null
    permissao: string
  }
}

export interface Post {
  idPublicacao: number
  titulo: string
  descricao: string
  dataPublicacao?: string | null
  idCanal: number
  Usuario: {
    idUsuario: number
    username: string
    nome: string
    foto?: string | null
    permissao: string
  }
  listaUsuarioCurtida: number[]
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
