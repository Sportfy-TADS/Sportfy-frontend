import { DecodedToken } from '@/interface/types';
import { jwtDecode } from 'jwt-decode';

export const authenticateUser = async ({ username, password }: { username: string, password: string }) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/login/efetuarLogin`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    },
  );

  if (!res.ok) {
    throw new Error('Nome de usuário ou senha inválidos');
  }

  const { token } = await res.json();
  const decoded: DecodedToken = jwtDecode(token);

  console.log('Token recebido:', token);
  console.log('Dados decodificados:', decoded);

  localStorage.setItem('token', token);

  // Salva o ID correto no localStorage, dependendo do papel
  if (decoded.role === 'ADMINISTRADOR') {
    localStorage.setItem('adminId', decoded.idUsuario.toString());
  } else {
    localStorage.setItem('academicoId', decoded.idUsuario.toString());
  }

  return decoded;
};
