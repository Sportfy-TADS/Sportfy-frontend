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