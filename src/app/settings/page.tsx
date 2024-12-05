'use client'

import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { ModeToggle } from '@/components/theme'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [historyAccess, setHistoryAccess] = useState(false)
  const [performanceStats, setPerformanceStats] = useState(false)
  const [achievements, setAchievements] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Ensure the initial state matches the server-rendered HTML
    setHistoryAccess(false)
    setPerformanceStats(false)
    setAchievements(false)
  }, [])

  const handleResetPassword = () => {
    // Logic to reset password
    console.log('Reset password clicked')
  }

  const handleLogout = () => {
    // Logic to log out
    console.log('Logout clicked')
    router.push('/auth/logout')
  }

  return (
    <>
      <Header />
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Configurações de Preferências
            </h1>
            <div className="mb-4">
              <ModeToggle />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="historyAccess" className="text-lg">
                  Permitir que outros usuários acessem o meu histórico de
                  campeonatos
                </Label>
                <Switch
                  id="historyAccess"
                  checked={historyAccess}
                  onCheckedChange={setHistoryAccess}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="performanceStats" className="text-lg">
                  Permitir que outros usuários vejam as minhas estatísticas de
                  desempenho esportivas
                </Label>
                <Switch
                  id="performanceStats"
                  checked={performanceStats}
                  onCheckedChange={setPerformanceStats}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="achievements" className="text-lg">
                  Permitir que outros usuários vejam as minhas conquistas
                </Label>
                <Switch
                  id="achievements"
                  checked={achievements}
                  onCheckedChange={setAchievements}
                />
              </div>
              <div className="mt-6 space-y-4">
                <Button
                  onClick={handleResetPassword}
                  className="w-full bg-yellow-500 hover:bg-yellow-400"
                >
                  Resetar Senha
                </Button>
                <Button
                  onClick={handleLogout}
                  className="w-full bg-red-600 hover:bg-red-500"
                >
                  Sair do Sistema
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
