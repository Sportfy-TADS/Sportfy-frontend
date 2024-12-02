'use client'

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
import { Skeleton } from '@/components/ui/skeleton'
import { useApoioSaude } from '@/hooks/useApoioSaude'
import {
  AtSign,
  Phone,
  Stethoscope,
  User,
} from 'lucide-react';
export default function ApoioSaudePage() {
  const {
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    displayedApoios,
    isLoading,
  } = useApoioSaude()

  function formatPhoneNumber(phoneNumber: string) {
    const cleaned = phoneNumber.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phoneNumber;
  }

  return (
    <>
      <Header />
      <div className="flex min-h-screen">
        <Sidebar className="flex-none" />
        <div className="container mx-auto p-4 flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Canal Saúde</h1>
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
                placeholder="Buscar apoio à saúde..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
              <Button onClick={() => setSearchTerm(searchTerm)}>Buscar</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index}>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/2 mb-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-3/4 mb-1" />
                    <Skeleton className="h-4 w-1/2 mb-3" />
                    <Skeleton className="h-8 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : displayedApoios.length ? (
              displayedApoios.map((apoio) => (
                <Card key={apoio.idApoioSaude} className="border border-emerald-500">
                  <CardHeader>
                    <CardTitle className='text-emerald-500'>{apoio.nome}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm flex items-center"><Stethoscope className="mr-2 text-emerald-500"/> Descrição: {apoio.descricao}</p>
                    <p className="text-sm flex items-center"><AtSign size={16} className="mr-2 text-emerald-500" /> Email: {apoio.email}</p>
                    <p className="text-sm flex items-center"><Phone size={16} className="mr-2 text-emerald-500" /> Telefone: {formatPhoneNumber(apoio.telefone)}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center col-span-full">
                Nenhum apoio à saúde disponível.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
