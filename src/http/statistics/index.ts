// Função para buscar informações de uso do acadêmico
export async function fetchUsoAcademico(idAcademico: number) {
  console.log('Chamando fetchUsoAcademico com idAcademico:', idAcademico)
  const response = await fetch(
    `http://localhost:8081/academico/uso/${idAcademico}`,
  )
  if (!response.ok) {
    throw new Error('Erro ao buscar informações de uso do acadêmico')
  }
  const data = await response.json()
  console.log('Dados de uso do acadêmico:', data)
  return data
}

// Função para buscar dados do usuário
export async function fetchUserData(idUsuario: number) {
  console.log('Chamando fetchUserData com idUsuario:', idUsuario)
  const response = await fetch(
    `http://localhost:8081/academico/consultar/${idUsuario}`,
  )
  if (!response.ok) {
    throw new Error('Erro ao buscar dados do usuário')
  }
  const data = await response.json()
  console.log('Dados do usuário:', data)
  return data
}
