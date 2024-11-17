export async function fetchAdmins() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/administrador/listar`,
  )
  if (!res.ok) throw new Error('Erro ao buscar administradores.')
  return await res.json()
}

export async function createAdmin(newAdmin) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/administrador/cadastrar`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newAdmin),
    },
  )
  if (!res.ok) throw new Error('Erro ao cadastrar administrador.')
  return await res.json()
}

export async function inactivateAdmin(id) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/administrador/inativar/${id}`,
    {
      method: 'PATCH',
    },
  )
  if (!res.ok) throw new Error('Erro ao inativar administrador.')
  return await res.json()
}
