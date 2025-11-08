import { ApiError, handleApiError } from '@/lib/utils/api-error-handler'
import { ApoioSaude, CreateApoioSaudeDTO, UpdateApoioSaudeDTO } from '@/types/apoio-saude'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'

class ApoioSaudeAPI {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token')
    
    if (!token) {
      throw new ApiError('Token de autenticação não encontrado. Faça login novamente.', 401)
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      })

      if (!response.ok) {
        throw new ApiError(
          `Erro ${response.status}: ${response.statusText}`,
          response.status
        )
      }

      return await response.json()
    } catch (error) {
      throw handleApiError(error)
    }
  }

  async list(): Promise<ApoioSaude[]> {
    const data = await this.makeRequest<ApoioSaude[]>('/apoioSaude/listar')
    return Array.isArray(data) ? data : []
  }

  async create(data: CreateApoioSaudeDTO): Promise<ApoioSaude> {
    this.validateCreateData(data)
    return this.makeRequest<ApoioSaude>('/apoioSaude', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async update(id: number, data: UpdateApoioSaudeDTO): Promise<ApoioSaude> {
    this.validateUpdateData(data)
    return this.makeRequest<ApoioSaude>(`/apoioSaude/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete(id: number): Promise<{ success: boolean }> {
    return this.makeRequest<{ success: boolean }>(`/apoioSaude/${id}`, {
      method: 'DELETE',
    })
  }

  async deactivate(id: number): Promise<{ success: boolean }> {
    return this.makeRequest<{ success: boolean }>(`/apoioSaude/desativar/${id}`, {
      method: 'PUT',
    })
  }

  private validateCreateData(data: CreateApoioSaudeDTO): void {
    const requiredFields = ['nome', 'email', 'telefone', 'descricao']
    const missingFields = requiredFields.filter(field => !data[field as keyof CreateApoioSaudeDTO]?.toString().trim())
    
    if (missingFields.length > 0) {
      throw new ApiError(`Campos obrigatórios não preenchidos: ${missingFields.join(', ')}`)
    }

    if (!this.isValidEmail(data.email)) {
      throw new ApiError('Email inválido')
    }
  }

  private validateUpdateData(data: UpdateApoioSaudeDTO): void {
    const requiredFields = ['nome', 'email', 'telefone', 'descricao']
    const missingFields = requiredFields.filter(field => !data[field as keyof UpdateApoioSaudeDTO]?.toString().trim())
    
    if (missingFields.length > 0) {
      throw new ApiError(`Campos obrigatórios não preenchidos: ${missingFields.join(', ')}`)
    }

    if (!this.isValidEmail(data.email)) {
      throw new ApiError('Email inválido')
    }
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }
}

export const apoioSaudeAPI = new ApoioSaudeAPI()
