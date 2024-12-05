'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

export default function SettingsPage() {
  const [historyAccess, setHistoryAccess] = useState(false)
  const [performanceStats, setPerformanceStats] = useState(false)
  const [achievements, setAchievements] = useState(false)

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
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
