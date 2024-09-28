'use client';

import { Plus } from 'lucide-react'
import { DialogTrigger } from '@radix-ui/react-dialog'


import { Button } from './ui/button'

export function EmptyGoals() {
  return (
    <main className="h-screen flex flex-col items-center justify-center gap-8">
      

      <p className="text-zinc-300 leading-relaxed max-w-80 text-center">
        Você ainda não cadastrou nenhuma meta, que tal cadastrar uma agora
        mesmo?
      </p>

      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Cadastrar meta
        </Button>
      </DialogTrigger>
    </main>
  )
}