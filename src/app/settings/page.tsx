// app/settings/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import Header from '@/components/Header';
import { ModeToggle } from '@/components/theme';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
  const { setTheme, theme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('pt');
  const [preferences, setPreferences] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  // Carregar dados do json-server
  useEffect(() => {
    // Função para buscar configurações do usuário
    const fetchSettings = async () => {
      const response = await fetch('http://localhost:3001/settings/1'); // ID 1 como exemplo
      const data = await response.json();
      setNotifications(data.notifications);
      setPreferences(data.preferences);
      setLanguage(data.language);
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setShowDialog(true); // Mostra o diálogo de confirmação ao clicar em salvar
  };

  const confirmSave = async () => {
    setShowDialog(false); // Fecha o diálogo
    alert('Configurações salvas com sucesso!');
    
    // Salvar configurações no json-server
    const response = await fetch('http://localhost:3001/settings/1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notifications,
        preferences,
        language,
      }),
    });

    if (!response.ok) {
      alert('Erro ao salvar configurações');
    }
  };

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-[#202024] transition-colors p-4">
        <div className="w-full max-w-md bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md p-6 m-4 sm:w-4/5 md:w-3/4 lg:w-1/2 xl:w-1/3 transition-colors">
          <h1 className="text-2xl font-bold text-center text-emerald-600 dark:text-emerald-400 mb-6">
            Configurações do Sistema
          </h1>

          <div className="mb-4">
            <ModeToggle />
          </div>

          <div className="mt-4">
                <label className="block text-sm font-semibold mb-2 dark:text-white">Idioma:</label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o Idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt">Português</SelectItem>
                    <SelectItem value="en">Inglês</SelectItem>
                  </SelectContent>
                </Select>
              </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button className="w-full mb-4">Configurações de Preferências</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Preferências</SheetTitle>
              </SheetHeader>
              
              <div className="mt-4">
                <label className="block text-sm font-semibold mb-2 dark:text-white">Preferência:</label>
                <input
                  type="checkbox"
                  checked={preferences}
                  onChange={(e) => setPreferences(e.target.checked)}
                  className="mr-2"
                />
                <span className="dark:text-white">Ativar Preferência</span>
              </div>
            </SheetContent>
          </Sheet>

          <Sheet>
            <SheetTrigger asChild>
              <Button className="w-full mb-4">Configurações de Notificações</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Notificações</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="mr-2"
                />
                <span className="dark:text-white">Ativar Notificações</span>
              </div>
            </SheetContent>
          </Sheet>

          <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
            <AlertDialogTrigger asChild>
              <Button
                onClick={handleSave}
                className="w-full p-2 font-semibold text-white bg-green-500 mt-4"
              >
                Salvar Configurações
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmação de Salvar</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja salvar essas configurações? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setShowDialog(false)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmSave}>Salvar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </>
  );
}
