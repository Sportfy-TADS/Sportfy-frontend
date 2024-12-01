export const getMetaEsportivas = async (idAcademico: number): Promise<any[]> => {
  try {
    const response = await fetch(`http://localhost:8081/modalidadeEsportiva/metaEsportiva/listar/${idAcademico}`)
    if (response.ok) {
      const data = await response.json()
      // Assuming meta esportivas also have an 'inscrito' property. If not, ensure consistency.
      // If needed, map data to include 'inscrito': false as default
      const metasWithInscrito = data.map((meta: any) => ({
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