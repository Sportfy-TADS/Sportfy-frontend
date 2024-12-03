import axios from 'axios';
import { DecodedToken } from '@/interface/types';
import { jwtDecode } from 'jwt-decode';

export const authenticateUser = async ({ 
  username, 
  password 
}: { 
  username: string, 
  password: string 
}) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/login/efetuarLogin`,
      { username, password },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const { token } = response.data;
    const decoded: DecodedToken = jwtDecode(token);

    console.log('Token recebido:', token);
    console.log('Dados decodificados:', decoded);

    localStorage.setItem('token', token);

    if (decoded.role === 'ADMINISTRADOR') {
      localStorage.setItem('adminId', decoded.idUsuario.toString());
    } else {
      localStorage.setItem('academicoId', decoded.idUsuario.toString());
    }

    return decoded;
  } catch (error: any) {
    console.error('Erro na autenticação:', error);
    throw new Error(
      error.response?.data?.message || 
      'Nome de usuário ou senha inválidos'
    );
  }
};