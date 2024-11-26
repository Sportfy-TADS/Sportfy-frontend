'use client'

import { useState, useEffect } from 'react'

import { CheckedState } from '@radix-ui/react-checkbox'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { getUserData } from '@/utils/auth'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { ModeToggle } from '@/components/theme'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { fetchSettings, saveSettings, deleteSettings } from '@/http/settings'

export default function SettingsPage() {
  const { setTheme, theme } = useTheme()
  const [notifications, setNotifications] = useState(true)
  const [language, setLanguage] = useState('pt')
  const [notifyNewChampionships, setNotifyNewChampionships] = useState(true)
  const [notifyNewPosts, setNotifyNewPosts] = useState(true)
  const [notifyComments, setNotifyComments] = useState(true)
  const [notifyLikes, setNotifyLikes] = useState(true)
  const [privacyDetails, setPrivacyDetails] = useState(true)
  const [privacyHistory, setPrivacyHistory] = useState(true)
  const [privacyStats, setPrivacyStats] = useState(true)
  const [privacyAchievements, setPrivacyAchievements] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)

  useEffect(() => {
    const userData = getUserData()
    console.log('User Data:', userData)
    if (userData && userData.idAcademico) {
      setUserId(userData.idAcademico)
    } else {
      console.error('idAcademico not found in userData.')
      toast.error('Usuário não autenticado.')
    }
  }, [])

  useEffect(() => {
    if (!userId) {
      return
    }
    const loadSettings = async () => {
      try {
        console.log('Fetching settings for user ID:', userId)
        const data = await fetchSettings(userId)
        console.log('Fetched settings:', data) // Debugging line
        setNotifications(data.notifications)
        setLanguage(data.language)
        setNotifyNewChampionships(data.notifyNewChampionships)
        setNotifyNewPosts(data.notifyNewPosts)
        setNotifyComments(data.notifyComments)
        setNotifyLikes(data.notifyLikes)
        setPrivacyDetails(data.privacyDetails)
        setPrivacyHistory(data.privacyHistory)
        setPrivacyStats(data.privacyStats)
        setPrivacyAchievements(data.privacyAchievements)
      } catch (error) {
        console.error('Erro ao buscar configurações: ', error)
        toast.error('Erro ao carregar as configurações.')
      }
    }

    loadSettings()
  }, [userId])

  const handleSave = () => {
    setShowDialog(true)
  }

  const confirmSave = async () => {
    setShowDialog(false)
    if (!userId) {
      toast.error('Usuário não autenticado.')
      return
    }
    try {
      console.log('Saving settings for user ID:', userId) // Debugging line
      await saveSettings(userId, {
        notifications,
        language,
        notifyNewChampionships,
        notifyNewPosts,
        notifyComments,
        notifyLikes,
        privacyDetails,
        privacyHistory,
        privacyStats,
        privacyAchievements,
      })
      toast.success('Configurações salvas com sucesso!')
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error) // Debugging line
      toast.error(error.message)
    }
  }

  const handleDelete = async () => {
    if (!userId) {
      toast.error('Usuário não autenticado.')
      return
    }
    try {
      console.log('Deleting settings for user ID:', userId) // Debugging line
      await deleteSettings(userId)
      toast.success('Configurações deletadas com sucesso!')
    } catch (error: any) {
      console.error('Erro ao deletar configurações:', error) // Debugging line
      toast.error(error.message)
    }
  }

  const handleCheckedChange =
    (setState: (value: boolean) => void) => (checked: CheckedState) => {
      setState(checked === true)
    }

  return (
    <>
      <Header />
      <div className="flex min-h-screen bg-white dark:bg-gray-800 transition-colors">
        <Sidebar />
        <div className="flex flex-col items-center justify-center w-full p-4">
          <div className="w-full max-w-md bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md p-6 m-4 sm:w-4/5 md:w-3/4 lg:w-1/2 xl:w-1/3 transition-colors">
            <h1 className="text-2xl font-bold text-center text-emerald-600 dark:text-emerald-400 mb-6">
              Configurações do Sistema
            </h1>
            <div className="mb-4">
              <ModeToggle />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-semibold mb-2 dark:text-white">
                Idioma:
              </label>
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
                <Button className="w-full mb-4">
                  Configurações das Modalidades
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Modalidades</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <Checkbox
                    checked={notifyNewChampionships}
                    onCheckedChange={handleCheckedChange(
                      setNotifyNewChampionships,
                    )}
                    className="mr-2"
                  />
                  <span className="dark:text-white">
                    Notificar sobre novos campeonatos nas modalidades que estou
                    inscrito
                  </span>
                </div>
                <div className="mt-2">
                  <Checkbox
                    checked={notifyNewPosts}
                    onCheckedChange={handleCheckedChange(setNotifyNewPosts)}
                    className="mr-2"
                  />
                  <span className="dark:text-white">
                    Notificar sobre novos posts criados nas modalidades
                  </span>
                </div>
                <div className="mt-2">
                  <Checkbox
                    checked={notifyComments}
                    onCheckedChange={handleCheckedChange(setNotifyComments)}
                    className="mr-2"
                  />
                  <span className="dark:text-white">
                    Notificar sobre comentários feitos nos meus posts
                  </span>
                </div>
                <div className="mt-2">
                  <Checkbox
                    checked={notifyLikes}
                    onCheckedChange={handleCheckedChange(setNotifyLikes)}
                    className="mr-2"
                  />
                  <span className="dark:text-white">
                    Notificar sobre likes nos meus posts
                  </span>
                </div>
              </SheetContent>
            </Sheet>
            <Sheet>
              <SheetTrigger asChild>
                <Button className="w-full mb-4">
                  Configurações de Privacidade
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Privacidade</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <Checkbox
                    checked={privacyDetails}
                    onCheckedChange={handleCheckedChange(setPrivacyDetails)}
                    className="mr-2"
                  />
                  <span className="dark:text-white">
                    Permitir que outros usuários vejam detalhes das minhas
                    modalidades
                  </span>
                </div>
                <div className="mt-2">
                  <Checkbox
                    checked={privacyHistory}
                    onCheckedChange={handleCheckedChange(setPrivacyHistory)}
                    className="mr-2"
                  />
                  <span className="dark:text-white">
                    Permitir que outros usuários acessem meu histórico de
                    campeonatos
                  </span>
                </div>
                <div className="mt-2">
                  <Checkbox
                    checked={privacyStats}
                    onCheckedChange={handleCheckedChange(setPrivacyStats)}
                    className="mr-2"
                  />
                  <span className="dark:text-white">
                    Permitir que outros usuários vejam minhas estatísticas
                    esportivas
                  </span>
                </div>
                <div className="mt-2">
                  <Checkbox
                    checked={privacyAchievements}
                    onCheckedChange={handleCheckedChange(
                      setPrivacyAchievements,
                    )}
                    className="mr-2"
                  />
                  <span className="dark:text-white">
                    Permitir que outros usuários vejam minhas conquistas
                  </span>
                </div>
              </SheetContent>
            </Sheet>
            <Button
              onClick={handleSave}
              className="w-full bg-emerald-600 hover:bg-emerald-500"
            >
              Salvar Configurações
            </Button>
            <Button
              onClick={handleDelete}
              className="w-full bg-red-600 hover:bg-red-500 mt-4"
            >
              Deletar Configurações
            </Button>
            <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar Salvamento</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza de que deseja salvar as configurações?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setShowDialog(false)}>
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={confirmSave}>
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </>
  )
}