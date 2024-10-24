'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UploadCloud } from 'lucide-react'; // Importando ícones
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
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const academicoId = localStorage.getItem('academicoId');
      if (!academicoId) {
        router.push('/auth');
        return;
      }
      
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/academico/consultar/${academicoId}`);
        const user = await res.json();
        setName(user.nome);
        setEmail(user.email);
        setPassword(user.password);
        setGender(user.genero);
        setPhone(user.telefone);
        setCourse(user.curso);
        setBirthDate(user.dataNascimento);
        setProfileImage(user.foto || '');
      } catch (e) {
        setError('Erro ao carregar os dados do usuário');
      }
    };
    fetchUserData();
  }, [router]);

  const handleUpdate = async () => {
    const academicoId = localStorage.getItem('academicoId');
    if (!academicoId) {
      setError('Usuário não autenticado');
      return;
    }

    const updatedUserData = {
      idAcademico: parseInt(academicoId, 10),
      curso: course || 'N/A',  // Certificando-se de que o curso não está vazio
      email: email,
      username: name, // Certifique-se de que o username está correto
      password: password,
      nome: name,
      genero: gender || 'outros',  // Definindo um valor padrão
      telefone: phone || '',  // Definindo telefone como vazio se não preenchido
      dataNascimento: birthDate || null,  // Permitir nulo para data de nascimento
      foto: profileImage || null,  // Enviando `null` se não houver imagem
      ativo: true,  // Definindo como ativo
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/academico/atualizar/${academicoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUserData),
      });

      if (res.ok) {
        alert('Perfil atualizado com sucesso!');
        router.push('/profile');
      } else {
        const errorData = await res.json();
        console.error('Erro ao atualizar o perfil:', errorData);
        setError('Erro ao atualizar o perfil');
      }
    } catch (e) {
      setError('Erro ao atualizar o perfil');
    }
  };

  return (
    <>
      <Header />

      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna da Imagem de Perfil */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-32 h-32 rounded-full">
                {profileImage ? (
                  <AvatarImage src={profileImage} alt="Profile Image" />
                ) : (
                  <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                )}
              </Avatar>
              {/* Ícone para upload da imagem */}
              <Button variant="ghost" size="icon" className="absolute bottom-0 right-0 bg-white shadow-md rounded-full">
                <UploadCloud className="h-5 w-5" />
              </Button>
            </div>
            <h2 className="text-lg font-semibold text-black dark:text-white">{name}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{email}</p>
          </div>

          {/* Coluna de Edição */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-md shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">Editar Informações</h2>
              {error && <div className="mb-4 text-red-500">{error}</div>}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-black dark:text-white">Nome</label>
                  <Input
                    type="text"
                    className="w-full p-2 text-black dark:text-white"
                    placeholder="Nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2 text-black dark:text-white">Email</label>
                  <Input
                    type="email"
                    className="w-full p-2 text-black dark:text-white"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-black dark:text-white">Senha</label>
                  <Input
                    type="password"
                    className="w-full p-2 text-black dark:text-white"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2 text-black dark:text-white">Gênero</label>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-black dark:text-white">Telefone</label>
                  <Input
                    type="text"
                    className="w-full p-2 text-black dark:text-white"
                    placeholder="Telefone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-black dark:text-white">Curso</label>
                  <Input
                    type="text"
                    className="w-full p-2 text-black dark:text-white"
                    placeholder="Curso"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-semibold mb-2 text-black dark:text-white">Data de Nascimento</label>
                <Input
                  type="date"
                  className="w-full p-2 text-black dark:text-white"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-semibold mb-2 text-black dark:text-white">URL da Imagem de Perfil</label>
                <Input
                  type="text"
                  className="w-full p-2 text-black dark:text-white"
                  placeholder="URL da Imagem"
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                />
              </div>

              <Button
                onClick={handleUpdate}
                className="w-full p-2 mt-4 font-semibold text-white bg-blue-500 hover:bg-blue-600"
              >
                Atualizar Perfil
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
