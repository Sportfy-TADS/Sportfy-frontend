'use client'

import { useState, useEffect } from 'react'
import { Star, Search } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

type Jogador = {
  id: number
  nome: string
  username: string
  avaliacao: number
}

type Endereco = {
  cep: string
  uf: string
  cidade: string
  bairro: string
  rua: string
  numero: number
  complemento: string | null
}

type Campeonato = {
  idCampeonato: number
  codigo: string
  titulo: string
  descricao: string
  aposta: string | null
  dataCriacao: string
  dataInicio: string
  dataFim: string
  limiteTimes: number
  limiteParticipantes: number
  ativo: boolean
  endereco: Endereco
  privacidadeCampeonato: string
  idAcademico: number
  usernameCriador: string
  idModalidadeEsportiva: number
  situacaoCampeonato: string
}

export default function Component() {
  const [busca, setBusca] = useState('')
  const [jogadores, setJogadores] = useState<Jogador[]>([])
  const [campeonatos, setCampeonatos] = useState<Campeonato[]>([])

  useEffect(() => {
    fetch('http://localhost:8081/academico/listar?page=0&size=10&sort=curso,desc')
      .then(response => response.json())
      .then(data => {
        const formattedData = data.content.map((item: any) => ({
          id: item.id,
          nome: item.nome,
          username: item.username,
          avaliacao: 0 // default rating
        }))
        setJogadores(formattedData)
      })
  }, [])

  useEffect(() => {
    fetch('http://localhost:8081/campeonatos/11/inscritos?page=0&size=10&sort=dataCriacao,desc')
      .then(response => response.json())
      .then(data => {
        setCampeonatos(data.content)
      })
  }, [])

  const jogadoresFiltrados = jogadores.filter(jogador =>
    jogador.nome.toLowerCase().includes(busca.toLowerCase())
  )

  const avaliarJogador = (id: number, novaAvaliacao: number) => {
    setJogadores(jogadores.map(jogador =>
      jogador.id === id ? { ...jogador, avaliacao: novaAvaliacao } : jogador
    ))
  }

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-4">Avaliação de Jogadores</h1>
            <div className="mb-4 relative">
              <Input
                type="text"
                placeholder="Buscar jogador..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <motion.ul 
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {jogadoresFiltrados.map(jogador => (
                <motion.li 
                  key={jogador.id} 
                  className="bg-white shadow rounded-lg p-4 flex justify-between items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div>
                    <h2 className="text-lg font-semibold dark:text-gray-500">{jogador.nome}</h2>
                    <p className="text-sm text-gray-500">{jogador.username}</p>
                  </div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((estrela) => (
                      <Button
                        key={estrela}
                        variant="ghost"
                        size="sm"
                        onClick={() => avaliarJogador(jogador.id, estrela)}
                      >
                        <Star
                          className={`${
                            estrela <= jogador.avaliacao ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      </Button>
                    ))}
                  </div>
                </motion.li>
              ))}
            </motion.ul>

            <h2 className="text-xl font-bold mt-8 mb-4">Histórico de Campeonatos</h2>
            <div className="space-y-4">
              {campeonatos.map((campeonato) => (
                <motion.div
                  key={campeonato.idCampeonato}
                  className="bg-white shadow rounded-lg p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{campeonato.titulo}</h3>
                      <p className="text-sm text-gray-500">{campeonato.descricao}</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm">Código: {campeonato.codigo}</p>
                        <p className="text-sm">Criador: {campeonato.usernameCriador}</p>
                        <p className="text-sm">Status: {campeonato.situacaoCampeonato}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                        {campeonato.aposta || 'Sem aposta'}
                      </span>
                      <p className="text-sm mt-2">
                        {new Date(campeonato.dataInicio).toLocaleDateString()} até{' '}
                        {new Date(campeonato.dataFim).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}