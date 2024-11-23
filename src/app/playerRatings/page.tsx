'use client'

import { useState } from 'react'
import { Star, Search } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion } from 'framer-motion'

type Jogador = {
  id: number
  nome: string
  posicao: string
  avaliacao: number
}

export default function Component() {
  const [busca, setBusca] = useState('')
  const [jogadores, setJogadores] = useState<Jogador[]>([
    { id: 1, nome: "Neymar Jr.", posicao: "Atacante", avaliacao: 4 },
    { id: 2, nome: "Cristiano Ronaldo", posicao: "Atacante", avaliacao: 5 },
    { id: 3, nome: "Lionel Messi", posicao: "Atacante", avaliacao: 5 },
    { id: 4, nome: "Kylian Mbappé", posicao: "Atacante", avaliacao: 4 },
    { id: 5, nome: "Kevin De Bruyne", posicao: "Meio-campo", avaliacao: 4 },
  ])

  const jogadoresFiltrados = jogadores.filter(jogador =>
    jogador.nome.toLowerCase().includes(busca.toLowerCase())
  )

  const avaliarJogador = (id: number, novaAvaliacao: number) => {
    setJogadores(jogadores.map(jogador =>
      jogador.id === id ? { ...jogador, avaliacao: novaAvaliacao } : jogador
    ))
  }

  return (
    <div className="container mx-auto p-4">
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
              <h2 className="text-lg font-semibold">{jogador.nome}</h2>
              <p className="text-sm text-gray-500">{jogador.posicao}</p>
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
    </div>
  )
}