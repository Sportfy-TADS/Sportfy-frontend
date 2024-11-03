export interface Achievement {
  id: number;
  userId: string | null;
  title: string;
  description: string;
  category: string;
}

export interface Sport {
  id: number;
  name: string;
  description: string;
  location: string;
  schedule: string;
}

export interface DecodedToken {
  sub: string;
  role: string;
  idUsuario: number;
  exp: number;
}

export interface Post {
  idPublicacao: number;
  titulo: string;
  descricao: string;
  Usuario: {
    idUsuario: number;
    username: string;
  };
  listaUsuarioCurtida: number[];
  listaComentario: Comment[];
}

export interface Comment {
  idComentario: number;
  descricao: string;
  Usuario: {
    idUsuario: number;
    username: string;
  };
  listaUsuarioCurtida: number[];
}

export interface User {
  idUsuario: number;
  username: string;
  role: string;
}