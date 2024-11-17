import { format } from 'date-fns'

import { SignUpSchema } from '@/schemas'

export const registerAcademico = async ({
  curso,
  username,
  email,
  nome,
  telefone,
  dataNascimento,
}: SignUpSchema) => {
  const payload = {
    curso,
    nome,
    username,
    telefone,
    dataNascimento: format(
      new Date(dataNascimento),
      "yyyy-MM-dd'T'HH:mm:ss'Z'",
    ),
    email,
    foto: null,
  }

  console.log('Enviando dados ao backend:', payload)

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/academico/cadastrar`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  )

  if (!res.ok) {
    const error = await res.json()
    console.error('Erro ao registrar:', error)
    throw new Error('Erro no registro')
  }

  console.log('Registro realizado com sucesso.')
}
