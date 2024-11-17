'use client'

import { Edit, Trash2 } from 'lucide-react'
import { Toaster } from 'sonner'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import { Skeleton } from '@/components/ui/skeleton'
import { useApoioSaude } from '@/hooks/useApoioSaude'

export default function ApoioSaudeAdminPage() {
  const {
    currentApoio,
    setCurrentApoio,
    newApoio,
    setNewApoio,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    isLoading,
    filteredApoios,
    handleCreate,
    handleUpdate,
    handleInactivate,
  } = useApoioSaude()

  return (
    <>
      <Header />
      <Toaster richColors />
      <div className="flex h-screen">
        <Sidebar className="flex-none" />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-6">
            <div className="container mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  Gerenciar Apoio à Saúde
                </h1>
                <div className="flex space-x-4">
                  <Select onValueChange={setFilter} defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="ufpr">UFPR</SelectItem>
                      <SelectItem value="externo">Externo</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Buscar pelo nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button className="bg-green-500 hover:bg-green-600">
                        Adicionar Apoio
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Cadastrar Apoio à Saúde</SheetTitle>
                      </SheetHeader>
                      <form onSubmit={handleCreate} className="space-y-4 mt-4">
                        <div>
                          <label htmlFor="nome">Nome</label>
                          <Input
                            id="nome"
                            value={newApoio.nome}
                            onChange={(e) =>
                              setNewApoio({ ...newApoio, nome: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <label htmlFor="email">Email</label>
                          <Input
                            id="email"
                            value={newApoio.email}
                            onChange={(e) =>
                              setNewApoio({
                                ...newApoio,
                                email: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label htmlFor="telefone">Telefone</label>
                          <Input
                            id="telefone"
                            value={newApoio.telefone}
                            onChange={(e) =>
                              setNewApoio({
                                ...newApoio,
                                telefone: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label htmlFor="descricao">Descrição</label>
                          <Input
                            id="descricao"
                            value={newApoio.descricao}
                            onChange={(e) =>
                              setNewApoio({
                                ...newApoio,
                                descricao: e.target.value,
                              })
                            }
                          />
                        </div>
                        <Button type="submit" className="w-full">
                          Cadastrar
                        </Button>
                      </form>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
              <div className="space-y-4">
                {isLoading ? (
                  <Skeleton />
                ) : (
                  filteredApoios.map((apoio: any) => (
                    <Card key={apoio.idApoioSaude}>
                      <CardHeader>
                        <CardTitle>{apoio.nome}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{apoio.descricao}</p>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => {
                              setCurrentApoio(apoio)
                              setNewApoio({
                                nome: apoio.nome,
                                email: apoio.email,
                                telefone: apoio.telefone,
                                descricao: apoio.descricao,
                              })
                            }}
                          >
                            <Edit />
                          </Button>
                          <Button
                            onClick={() => handleInactivate(apoio.idApoioSaude)}
                            variant="destructive"
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
