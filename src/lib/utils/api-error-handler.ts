import * as React from "react"

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
    return new ApiError(
      'Problema de conexão com o servidor. Verifique se o backend está rodando e configurado corretamente.',
      0,
      'CONNECTION_ERROR'
    )
  }

  if (error instanceof Error) {
    if (error.message.includes('401')) {
      localStorage.removeItem('token')
      return new ApiError('Sua sessão expirou. Redirecionando para login...', 401, 'UNAUTHORIZED')
    }
    
    if (error.message.includes('403')) {
      return new ApiError('Você não tem permissão para realizar esta ação.', 403, 'FORBIDDEN')
    }
    
    if (error.message.includes('404')) {
      return new ApiError('Serviço não encontrado. Verifique se o servidor está funcionando.', 404, 'NOT_FOUND')
    }
    
    if (error.message.includes('500')) {
      return new ApiError('Erro interno do servidor. Tente novamente em alguns minutos.', 500, 'INTERNAL_ERROR')
    }

    return new ApiError(error.message)
  }

  return new ApiError('Ocorreu um erro inesperado. Tente novamente.')
}
export function getErrorGuidance(error: ApiError): React.ReactNode | null {
  if (error.code === 'CONNECTION_ERROR') {
    return React.createElement(
      'div',
      { className: 'bg-yellow-50 border border-yellow-200 rounded-md p-4' },
      React.createElement('h4', { className: 'font-semibold text-yellow-800 mb-2' }, 'Como resolver:'),
      React.createElement(
        'ol',
        { className: 'list-decimal list-inside text-sm text-yellow-700 space-y-1' },
        React.createElement('li', null, 'Verifique se o servidor backend está rodando na porta 8081'),
        React.createElement('li', null, 'Certifique-se de que o CORS está configurado no backend'),
        React.createElement(
          'li',
          null,
          'Tente acessar diretamente: ',
          React.createElement(
            'a',
            { href: 'http://localhost:8081/apoioSaude/listar', target: '_blank', rel: 'noopener noreferrer', className: 'underline' },
            'http://localhost:8081/apoioSaude/listar'
          )
        )
      )
    )
  }
  
  return null
}
