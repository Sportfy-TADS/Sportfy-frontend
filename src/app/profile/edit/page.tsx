'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from '@/components/Header';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EditProfilePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        router.push('/auth'); // Redireciona para login se não houver ID do usuário
        return;
      }
      
      try {
        const res = await fetch(`http://localhost:3001/users/${userId}`);
        const user = await res.json();
        setName(user.name);
        setEmail(user.email);
        setPassword(user.password);
        setGender(user.gender);
        setProfileImage(user.profileImage || ''); // Caso não tenha imagem, seta uma string vazia
      } catch (e) {
        setError('Erro ao carregar os dados do usuário');
      }
    };
    fetchUserData();
  }, [router]);

  const handleUpdate = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('Usuário não autenticado');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, gender, profileImage }),
      });
      if (res.ok) {
        alert('Perfil atualizado com sucesso!');
        router.push('/profile');
      } else {
        setError('Erro ao atualizar o perfil');
      }
    } catch (e) {
      setError('Erro ao atualizar o perfil');
    }
  };

  return (
    <>
      <Header />

      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-full max-w-md bg-white p-8 rounded-md shadow-md dark:bg-gray-800">
          <h2 className="mb-4 text-2xl font-semibold text-center text-black dark:text-white">Editar Perfil</h2>
          {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
          
          <Input
            type="text"
            className="w-full p-2 mb-4 text-black dark:text-white"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          
          <Input
            type="email"
            className="w-full p-2 mb-4 text-black dark:text-white"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <Input
            type="password"
            className="w-full p-2 mb-4 text-black dark:text-white"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2 text-black dark:text-white">Gênero:</label>
            <Select onValueChange={setGender} value={gender}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Escolha um gênero" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="feminino">Feminino</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Input
            type="text"
            className="w-full p-2 mb-4 text-black dark:text-white"
            placeholder="URL da Imagem de Perfil"
            value={profileImage}
            onChange={(e) => setProfileImage(e.target.value)}
          />

          <Button
            onClick={handleUpdate}
            className="w-full p-2 font-semibold text-white bg-blue-500 hover:bg-blue-600"
          >
            Atualizar
          </Button>
        </div>
      </div>
    </>
  );
}
