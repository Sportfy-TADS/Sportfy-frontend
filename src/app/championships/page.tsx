'use client'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useCampeonatos } from '@/hooks/useCampeonatos'

export default function CampeonatoPage() {
  const {
    campeonatos,
    isLoading,
    selectedCampeonato,
    setSelectedCampeonato,
    register,
    handleSubmit,
    reset,
    handleCreateCampeonato,
    handleUpdateCampeonato,
    handleDeleteCampeonato,
  } = useCampeonatos()

  return (
    <>
      <Header />
      <div className="flex h-screen">
        <Sidebar className="h-full" />
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Campeonatos</h1>
            <Sheet>
              <SheetTrigger asChild>
                <Button className="bg-blue-500 hover:bg-blue-600">
                  Cadastrar Campeonato
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Cadastrar Novo Campeonato</SheetTitle>
                </SheetHeader>
                <form
                  onSubmit={handleSubmit(handleCreateCampeonato)}
                  className="space-y-4 mt-4"
                >
                  {/* Campos do formulário */}
                </form>
              </SheetContent>
            </Sheet>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-10 w-full bg-gray-300" />
                  </Card>
                ))
              : campeonatos.map((campeonato) => (
                  <Card key={campeonato.idCampeonato}>
                    <CardHeader>
                      <CardTitle>{campeonato.titulo}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Descrição: {campeonato.descricao}
                      </p>
                      <p className="text-sm">Aposta: {campeonato.aposta}</p>
                      <p className="text-sm">
                        Início:{' '}
                        {new Date(campeonato.dataInicio).toLocaleDateString()}
                      </p>
                      <p className="text-sm">
                        Fim: {new Date(campeonato.dataFim).toLocaleDateString()}
                      </p>

                      <Button
                        onClick={() => setSelectedCampeonato(campeonato)}
                        className="mt-4 w-full bg-yellow-500 hover:bg-yellow-600"
                      >
                        Atualizar
                      </Button>

                      <Button
                        onClick={() =>
                          handleDeleteCampeonato(campeonato.idCampeonato)
                        }
                        className="mt-2 w-full bg-red-500 hover:bg-red-600"
                      >
                        Excluir
                      </Button>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </div>
      </div>
    </>
  )
}
