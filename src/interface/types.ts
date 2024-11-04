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

export interface Post {
  idPublicacao: number
  titulo: string
  descricao: string
  Usuario: {
    idUsuario: number
    username: string
  }
  listaUsuarioCurtida: number[]
  listaComentario: Comment[]
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
