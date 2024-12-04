import axios from 'axios'
// Import default
import { jwtDecode } from 'jwt-decode' // Changed from named to default import

// Add axios interceptor for debugging
axios.interceptors.request.use((request) => {
  console.log('Request:', {
    url: request.url,
    method: request.method,
    headers: request.headers,
    data: request.data,
  })
  return request
})

axios.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers,
    })
    return response
  },
  (error) => {
    console.log('Error Response:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    return Promise.reject(error)
  },
)

export const fetchPosts = async (page: number = 0, size: number = 10) => {
  const token = localStorage.getItem('token')
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/publicacao/1/publicacoes?page=${page}&size=${size}&sort=dataPublicacao,desc`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    )
    return response.data.content || []
  } catch (error) {
    console.error('Error fetching posts:', error)
    throw error
  }
}

export const fetchLoggedUser = () => {
  const token = localStorage.getItem('token')
  if (token) {
    return jwtDecode(token)
  }
  return null
}

export const likePost = async (userId: number, postId: number) => {
  const token = localStorage.getItem('token')
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/publicacao/curtirPublicacao/${userId}/${postId}`
    console.log('Sending like request to URL:', url)
    const response = await axios.post(url, null, {
      // Alterado para incluir headers como terceiro parâmetro
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    console.log('Like response:', response)
    return response.data
  } catch (error) {
    console.error('Error liking post:', error)
    throw error
  }
}

export const unlikePost = async (userId: number, postId: number) => {
  const token = localStorage.getItem('token')
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/publicacao/removerCurtidaPublicacao/${userId}/${postId}`
    console.log('Sending unlike request to URL:', url)
    const response = await axios.delete(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    console.log('Unlike response:', response)
    return response.data
  } catch (error) {
    console.error('Error unliking post:', error)
    throw error
  }
}

interface Post {
  titulo: string
  descricao: string
  idCanal: number
  idModalidadeEsportiva: number | null
  idUsuario: number
}

export const createPost = async (newPost: Post) => {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('Token não encontrado')
  }

  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/publicacao/cadastrarPublicacao`
    console.log('Creating post:', {
      url,
      payload: newPost,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    const response = await axios.post(
      url,
      {
        ...newPost,
        dataPublicacao: new Date().toISOString(),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    )

    if (!response.data) {
      throw new Error('Resposta vazia do servidor')
    }

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error Details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: JSON.parse(error.config?.data || '{}'),
          headers: error.config?.headers,
        },
      })
      throw new Error(
        `Erro ao criar publicação: ${error.response?.data?.message || error.message}`,
      )
    }
    console.error('Unknown error:', error)
    throw new Error('Erro desconhecido ao criar publicação')
  }
}

export const fetchComments = async (postId: number) => {
  try {
    const response = await axios.get(
      `http://localhost:8081/comentario/${postId}/comentarios?page=0&size=10&sort=dataComentario,desc`,
    )
    return response.data.content || []
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      // Retornar lista vazia se não houver comentários
      return []
    }
    console.error('Erro ao buscar comentários:', error)
    throw error
  }
}

export const createComment = async (comment: any) => {
  const token = localStorage.getItem('token')
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/comentario/cadastrarComentario`
    const response = await axios.post(url, comment, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    console.error('Error creating comment:', error)
    throw error
  }
}

export const updateComment = async (commentId: number, updatedComment) => {
  const token = localStorage.getItem('token')
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/comentario/atualizarComentario/${commentId}`
    const response = await axios.put(url, updatedComment, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    console.error('Error updating comment:', error)
    throw error
  }
}
