'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UploadCloud } from 'lucide-react';
import Header from '@/components/Header';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast"; // Certifique-se de que o caminho está correto

export default function EditProfilePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const router = useRouter();
  const { toast } = useToast(); // Hook do Toast

  useEffect(() => {
    const fetchUserData = async () => {
      const academicoId = localStorage.getItem('academicoId');
      if (!academicoId) {
        router.push('/auth');
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/academico/consultar/${academicoId}`);
        if (!res.ok) throw new Error('Erro ao buscar dados do usuário');
        
        const user = await res.json();
        setName(user.nome);
        setEmail(user.email);
        setPassword(user.password);
        setGender(user.genero);
        setPhone(user.telefone);
        setCourse(user.curso);
        setBirthDate(user.dataNascimento);
        setProfileImage(user.foto || ''); // Aqui a imagem deve ser retornada corretamente
      } catch (e) {
        toast({
          title: 'Erro',
          description: e.message || 'Erro ao carregar os dados do usuário',
          variant: 'destructive',
        });
      }
    };
    fetchUserData();
  }, [router, toast]);

  const handleUpdate = async () => {
    const academicoId = localStorage.getItem('academicoId');
    if (!academicoId) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive',
      });
      return;
    }

    const formattedBirthDate = birthDate ? `${birthDate}T00:00:00-03:00` : null;
    const validUsername = name.replace(/\s+/g, '_');

    const updatedUserData = {
      idAcademico: parseInt(academicoId, 10),
      curso: course || 'N/A',
      email: email,
      username: validUsername,
      password: password,
      nome: name,
      genero: gender || 'outros',
      telefone: phone || '',
      dataNascimento: formattedBirthDate,
      foto: profileImage || null,
      ativo: true,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/academico/atualizar/${academicoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUserData),
      });

      if (res.ok) {
        toast({
          title: 'Sucesso',
          description: 'Perfil atualizado com sucesso!',
          variant: 'default',
        });
        router.push('/profile');
      } else {
        const errorData = await res.text();
        toast({
          title: 'Erro',
          description: `Erro ${res.status}: ${errorData}`,
          variant: 'destructive',
        });
      }
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar o perfil',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-32 h-32 rounded-full">
                {profileImage ? (
                  <AvatarImage src={profileImage} alt="Profile Image" />
                ) : (
                  <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                )}
              </Avatar>
              <Button variant="ghost" size="icon" className="absolute bottom-0 right-0 bg-white shadow-md rounded-full">
                <UploadCloud className="h-5 w-5" />
              </Button>
            </div>
            <h2 className="text-lg font-semibold text-black dark:text-white">{name}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{email}</p>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-md shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">Editar Informações</h2>

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

              <Button onClick={handleUpdate} className="mt-4">Atualizar Perfil</Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
