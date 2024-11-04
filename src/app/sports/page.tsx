'use client'

import { useState, useEffect } from 'react'

import Header from '@/components/Header'
import { Sport } from '@/interface/types'

export default function SportsPage() {
  const [sports, setSports] = useState<Sport[]>([])

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await fetch('http://localhost:3001/sports')
        const data = await response.json()
        setSports(data)
      } catch (error) {
        console.error('Erro ao carregar as modalidades:', error)
      }
    }

    fetchSports()
  }, [])

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-[#202024] transition-colors p-4">
        <div className="w-full max-w-4xl bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md p-6 m-4">
          <h1 className="text-2xl font-bold text-center text-emerald-600 dark:text-emerald-400 mb-6">
            Modalidades Esportivas
          </h1>

          {sports.length > 0 ? (
            sports.map((sport) => (
              <div key={sport.id} className="mb-6">
                <h2 className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
                  {sport.name}
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  {sport.description}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Local: {sport.location}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Horário: {sport.schedule}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-700 dark:text-gray-300 text-center">
              Nenhuma modalidade disponível no momento.
            </p>
          )}
        </div>
      </div>
    </>
  )
}
