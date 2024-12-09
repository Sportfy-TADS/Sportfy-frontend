interface MetaEsportiva {
  id: number
  nome: string
  descricao: string
  inscrito?: boolean
  // Adicione outras propriedades conforme necessário
}

export const getMetaEsportivas = async (
  idAcademico: number,
): Promise<MetaEsportiva[]> => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(
      `http://localhost:8081/modalidadeEsportiva/metaEsportiva/listar/${idAcademico}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    )

    if (response.ok) {
      const data: MetaEsportiva[] = await response.json()
      const metasWithInscrito = data.map((meta) => ({
        ...meta,
        inscrito: meta.inscrito ?? false,
      }))
      return metasWithInscrito
    } else {
      console.error('Erro ao buscar metas esportivas:', response.statusText)
      return []
    }
  } catch (error) {
    console.error('Erro ao buscar metas esportivas:', error)
    return []
  }
}
