import axios from 'axios';
// Import default
import { jwtDecode } from 'jwt-decode'; // Changed from named to default import

import { Post } from '@/interface/types';

// Configure axios defaults for better performance
axios.defaults.timeout = 10000; // 10 seconds default timeout
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Optional axios logging for debugging. Enable by setting DEBUG_AXIOS=true in dev env.
if (process.env.NODE_ENV === 'development' && process.env.DEBUG_AXIOS === 'true') {
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
}

const getToken = (): string | null => localStorage.getItem('token')

export interface PaginatedResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  last: boolean
  first: boolean
  number: number // page number (0-based)
  size: number
  numberOfElements: number
  empty: boolean
}

/**
 * Busca posts paginados. Retorna a resposta paginada completa (Spring Page)
 * para ser compatível com useInfiniteQuery do TanStack Query.
 */
export const fetchPostsPaginated = async (
  page: number = 0,
  size: number = 10,
): Promise<PaginatedResponse<Post>> => {
  const token = getToken()
  const url = `${process.env.NEXT_PUBLIC_API_URL}/publicacao/1/publicacoes?page=${page}&size=${size}&sort=dataPublicacao,desc`

  const response = await axios.get(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  const data = response.data

  // Normalizar posts para garantir arrays
  const content = (data.content || []).map((post: Post) => ({
    ...post,
    listaComentario: post.listaComentario || [],
    listaUsuarioCurtida: post.listaUsuarioCurtida || [],
  }))

  return {
    content,
    totalPages: data.totalPages ?? 0,
    totalElements: data.totalElements ?? 0,
    last: data.last ?? true,
    first: data.first ?? true,
    number: data.number ?? page,
    size: data.size ?? size,
    numberOfElements: data.numberOfElements ?? content.length,
    empty: data.empty ?? content.length === 0,
  }
}

/**
 * @deprecated Use fetchPostsPaginated para integração com TanStack Query.
 * Mantido para compatibilidade com useFeed legado.
 */
export const fetchPosts = async (page: number = 0, size: number = 10) => {
  const response = await fetchPostsPaginated(page, size)
  return response.content
}

export const fetchLoggedUser = () => {
  const token = getToken()
  return token ? jwtDecode(token) : null
}

export const likePost = async (userId: number, postId: number) => {
  const token = getToken()
  if (!token) {
    throw new Error('Token não encontrado')
  }

  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/publicacao/curtirPublicacao/${userId}/${postId}`
    console.log('🔄 Enviando requisição de curtida:', { userId, postId, url })
    
    const response = await axios.post(url, null, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      timeout: 8000, // Aumentado para 8 segundos
    })
    
    console.log('✅ Resposta da curtida:', {
      status: response.status,
      data: response.data,
      userId,
      postId
    })
    
    // Verificar se a operação foi bem-sucedida
    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data }
    } else {
      throw new Error(`Status inesperado: ${response.status}`)
    }
  } catch (error) {
    console.error('❌ Erro ao curtir post:', {
      userId,
      postId,
      error: error instanceof Error ? error.message : String(error)
    })
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Timeout: Operação demorou muito para responder')
      }
      if (error.response?.status === 409) {
        // Conflito - usuário já curtiu
        console.warn('⚠️ Post já foi curtido pelo usuário')
        return { success: true, data: null }
      }
      if (error.response?.status === 401) {
        throw new Error('Token inválido ou expirado')
      }
      if (error.response?.status === 404) {
        throw new Error('Post não encontrado')
      }
      // Log detalhado do erro
      console.error('❌ Detalhes do erro da API:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      })
    }
    throw error
  }
}

export const unlikePost = async (userId: number, postId: number) => {
  const token = getToken()
  if (!token) {
    throw new Error('Token não encontrado')
  }

  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/publicacao/removerCurtidaPublicacao/${userId}/${postId}`
    console.log('🔄 Enviando requisição de descurtida:', { userId, postId, url })
    
    const response = await axios.delete(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      timeout: 8000, // Aumentado para 8 segundos
    })
    
    console.log('✅ Resposta da descurtida:', {
      status: response.status,
      data: response.data,
      userId,
      postId
    })
    
    // Verificar se a operação foi bem-sucedida
    if (response.status === 200 || response.status === 204) {
      return { success: true, data: response.data }
    } else {
      throw new Error(`Status inesperado: ${response.status}`)
    }
  } catch (error) {
    console.error('❌ Erro ao descurtir post:', {
      userId,
      postId,
      error: error instanceof Error ? error.message : String(error)
    })
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Timeout: Operação demorou muito para responder')
      }
      if (error.response?.status === 404) {
        // Not Found - curtida não existe
        console.warn('⚠️ Curtida não encontrada para remoção')
        return { success: true, data: null }
      }
      if (error.response?.status === 401) {
        throw new Error('Token inválido ou expirado')
      }
      // Log detalhado do erro
      console.error('❌ Detalhes do erro da API:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      })
    }
    throw error
  }
}

interface PostCreate {
  titulo: string
  descricao: string
  idCanal: number
  idModalidadeEsportiva: number | null
  Usuario: {
    idUsuario: number
    username: string
    nome: string
    foto?: string | null
    permissao: string
    idAcademico: number
  }
}

export const createPost = async (newPost: PostCreate) => {
  const token = getToken()
  if (!token) {
    throw new Error('Token não encontrado')
  }

  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/publicacao/cadastrarPublicacao`
    
    const postData = {
      titulo: newPost.titulo.trim(),
      descricao: newPost.descricao.trim(),
      idCanal: Number(newPost.idCanal),
      idModalidadeEsportiva: newPost.idModalidadeEsportiva,
      dataPublicacao: new Date().toISOString(),
      Usuario: {
        idUsuario: Number(newPost.Usuario.idUsuario),
      },
    }

    console.log('🔄 Criando post:', {
      url,
      payload: postData,
      token: token ? 'presente' : 'ausente',
    })

    const response = await axios.post(url, postData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      timeout: 10000, // 10 segundos
    })

    console.log('✅ Resposta da criação de post:', {
      status: response.status,
      data: response.data,
    })

    if (!response.data) {
      throw new Error('Resposta vazia do servidor')
    }

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Erro da API:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        requestData: error.config?.data,
      })
      
      // Tratar erros específicos
      if (error.response?.status === 401) {
        throw new Error('Token de autenticação inválido ou expirado')
      }
      if (error.response?.status === 403) {
        throw new Error('Não autorizado a criar publicações')
      }
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            'Dados inválidos'
        throw new Error(`Erro de validação: ${errorMessage}`)
      }
      if (error.response?.status === 500) {
        throw new Error('Erro interno do servidor')
      }
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Erro desconhecido'
      
      throw new Error(`Erro ao criar publicação: ${errorMessage}`)
    }
    
    console.error('❌ Erro desconhecido:', error)
    throw new Error('Erro de conexão ao criar publicação')
  }
}

export const fetchComments = async (postId: number) => {
  const token = getToken()
  try {
    const url = `http://localhost:8081/comentario/${postId}/comentarios?page=0&size=10&sort=dataComentario,desc`
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
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

export const fetchCommentsCount = async (postId: number): Promise<number> => {
  const token = getToken()
  try {
    const url = `http://localhost:8081/comentario/${postId}/comentarios?page=0&size=1`
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data.totalElements || 0
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return 0
    }
    console.error('Erro ao buscar contagem de comentários:', error)
    return 0
  }
}

interface Comment {
  descricao: string
  idPublicacao: number
  Usuario: {
    idUsuario: number
    username: string
    nome: string
    foto?: string | null
    permissao: string
  }
}

export const createComment = async (comment: Comment) => {
  const token = getToken()
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

export const updateComment = async (
  commentId: number,
  updatedComment: Comment,
) => {
  const token = getToken()
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
