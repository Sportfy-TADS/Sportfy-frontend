import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

export const fetchPosts = async () => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/publicacao/1/publicacoes?page=0&size=10&sort=dataPublicacao,desc`,
  )
  return response.data.content || []
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
  await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/publicacao/curtirPublicacao/${userId}/${postId}`,
    null,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )
}

export const unlikePost = async (
  userId: number,
  postId: number,
  token: string,
) => {
  await axios.delete(
    `${process.env.NEXT_PUBLIC_API_URL}/publicacao/removerCurtidaPublicacao/${userId}/${postId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )
}

export const createPost = async (newPost: any, token: string) => {
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
