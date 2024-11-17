'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { toast } from 'sonner'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
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
import useAdminCrud from '@/hooks/useAdminCrud'
import useAdminStatus from '@/hooks/useAdminStatus'

export default function AdminCrudPage() {
  const currentAdmin = useAdminStatus()
  const {
    newAdmin,
    setNewAdmin,
    showAdminsOnly,
    setShowAdminsOnly,
    admins,
    isLoading,
    handleCreateAdmin,
    handleInactivateAdmin,
  } = useAdminCrud(currentAdmin)

  return (
    <>
      <Header />
      <div className="flex h-screen">
        <Sidebar className="flex-none" />
        <div className="container mx-auto p-4 flex-1 overflow-y-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Gerenciar Administradores
            </h1>
            <Select
              onValueChange={(value) => setShowAdminsOnly(value === 'admins')}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar usuários" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admins">Mostrar apenas Admins</SelectItem>
                <SelectItem value="all">Mostrar Todos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botão para abrir o Sheet do cadastro */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="primary">Cadastrar Novo Administrador</Button>
            </SheetTrigger>
            <SheetContent position="right" size="lg">
              <SheetHeader>
                <SheetTitle>Cadastrar Administrador</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-4 mt-6">
                <Input
                  placeholder="Nome"
                  value={newAdmin.name}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, name: e.target.value })
                  }
                />
                <Input
                  placeholder="Email"
                  value={newAdmin.email}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, email: e.target.value })
                  }
                />
                <Input
                  placeholder="Username"
                  value={newAdmin.username}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, username: e.target.value })
                  }
                />
                <Input
                  placeholder="Senha"
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, password: e.target.value })
                  }
                />
                <Button
                  onClick={handleCreateAdmin}
                  variant="primary"
                  className="mt-4"
                >
                  Salvar
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          {/* Listagem de administradores */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="w-full h-32 rounded-lg" />
                ))
              : admins.map((admin) => (
                  <Card
                    key={admin.id}
                    className="shadow-md bg-white dark:bg-gray-800"
                  >
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100">
                        {admin.name} ({admin.username})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col space-y-2">
                      <span className="text-gray-700 dark:text-gray-300">
                        Email: {admin.email}
                      </span>
                      <div className="flex items-center justify-between">
                        <Button
                          onClick={() => setCurrentAdmin(admin)}
                          variant="warning"
                        >
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleInactivateAdmin(admin.id)}
                        >
                          Inativar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </div>
      </div>
    </>
  )
}
