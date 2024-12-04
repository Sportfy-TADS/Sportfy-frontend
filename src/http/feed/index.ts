import axios from 'axios'
// Corrigir importação de jwtDecode para importação padrão
import { jwtDecode } from 'jwt-decode'

export const fetchPosts = async (
  token: string,
  page: number = 0,
  size: number = 10,
) => {
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

export const likePost = async (
  userId: number,
  postId: number,
  token: string,
) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/publicacao/curtirPublicacao/${userId}/${postId}`
    console.log('Sending like request to URL:', url)
    const response = await axios.post(url, {
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

export const unlikePost = async (
  userId: number,
  postId: number,
  token: string,
) => {
  // Add token parameter
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/publicacao/removerCurtidaPublicacao/${userId}/${postId}`
    console.log('Sending unlike request to URL:', url)
    const response = await axios.delete(url, {
      headers: {
        // Include headers for authorization
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
  title: string;
  content: string;
  // Add other fields as necessary
}

export const createPost = async (newPost: Post, token: string) => {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/publicacao/cadastrarPublicacao`,
    newPost,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )
  return response.data
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

export const createComment = async (comment: any, token: string) => {
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
  updatedComment: any,
  token: string,
) => {
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
