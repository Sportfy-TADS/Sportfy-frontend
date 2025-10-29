interface NewAdmin {
  username: string
  password: string
  nome: string
  telefone: string
  dataNascimento: string
}

export async function fetchAdmins() {
  const token = localStorage.getItem('token')
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/administrador/listar`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )
  if (!res.ok) throw new Error('Erro ao buscar administradores.')
  const data = await res.json()
  
  // Garantir que retorna sempre um array
  if (Array.isArray(data)) {
    return data
  } else if (data && Array.isArray(data.content)) {
    return data.content
  } else if (data && Array.isArray(data.data)) {
    return data.data
  } else {
    return []
  }
}

export async function createAdmin(newAdmin: NewAdmin) {
  const token = localStorage.getItem('token')
  console.log('Token para criar admin:', token)
  console.log('Dados para criar admin:', newAdmin)
  
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/administrador/cadastrar`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newAdmin),
    },
  )
  
  console.log('Status da resposta:', res.status)
  const responseText = await res.text()
  console.log('Resposta da API:', responseText)
  
  if (!res.ok) {
    throw new Error(`Erro ao cadastrar administrador: ${res.status} - ${responseText}`)
  }
  
  return JSON.parse(responseText)
}

export async function inactivateAdmin(id: number) {
  const token = localStorage.getItem('token')
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/administrador/inativar/${id}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )
  if (!res.ok) throw new Error('Erro ao inativar administrador.')
  return await res.json()
}
