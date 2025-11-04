
'use client'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { use, useEffect, useState } from 'react'

type Team = {
	id?: number
	nome?: string
	[key: string]: any
}

export default function Page({ params }: { params: Promise<{ idCampeonato: string }> }) {
	const resolvedParams = use(params)
	const id = resolvedParams.idCampeonato
	const [teams, setTeams] = useState<Team[] | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		let mounted = true

		async function load() {
			setLoading(true)
			setError(null)
			try {
				const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('jwt') : null
				const url = `${process.env.NEXT_PUBLIC_API_URL || ''}/campeonatos/${id}/times`
				const res = await fetch(url, {
					headers: {
						'Content-Type': 'application/json',
						...(token ? { Authorization: `Bearer ${token}` } : {}),
					},
				})

				if (!mounted) return

				if (!res.ok) {
					const text = await res.text().catch(() => '')
					
					// Mensagens específicas para diferentes códigos de erro
					let errorMessage = ''
					switch (res.status) {
						case 404:
							errorMessage = 'Campeonato não encontrado ou não possui times cadastrados'
							break
						case 401:
							errorMessage = 'Acesso não autorizado. Faça login para visualizar os times'
							break
						case 403:
							errorMessage = 'Você não tem permissão para visualizar os times deste campeonato'
							break
						case 500:
							errorMessage = 'Erro interno do servidor. Tente novamente em alguns instantes'
							break
						default:
							errorMessage = `Erro ${res.status}: ${res.statusText}${text ? ' - ' + text : ''}`
					}
					
					setError(errorMessage)
					setTeams([])
					return
				}

				const data = await res.json().catch(() => null)

				// Tenta extrair arrays comuns: content ou times ou a própria resposta
				const list: Team[] = (data && (data.content || data.times || data)) || []
				setTeams(Array.isArray(list) ? list : [])
			} catch (err: any) {
				setError(err?.message || String(err))
				setTeams([])
			} finally {
				if (mounted) setLoading(false)
			}
		}

		load()
		return () => {
			mounted = false
		}
	}, [id])

	// Heurística para descobrir se o time é público (não exige senha)
	function isPublicTeam(t: Team) {
		// explicit public flags
		if (t.publico === true || t.is_public === true) return true

		// explicit private flags => not public
		const privateFlags = ['privado', 'isPrivate', 'private', 'is_private']
		if (privateFlags.some((k) => t[k] === true || String(t[k]).toLowerCase() === 'true')) return false

		// password-like fields: if present and non-empty/true => not public
		const pw = t.senha ?? t.password ?? t.hasPassword ?? t.requiresPassword ?? t.needsPassword
		if (pw !== undefined && pw !== null) {
			if (typeof pw === 'boolean') return pw === false
			if (typeof pw === 'string') return pw.trim().length === 0
			// numbers or other truthy values -> consider as protected
			return false
		}

		// default: consider public
		return true
	}

	function joinTeam(t: Team) {
		// navega para uma rota de join simples. Ajuste conforme sua API/rotas.
		const teamIdOrName = t.id ?? encodeURIComponent(t.nome ?? '')
		const target = `/campeonatos/${id}/times/${teamIdOrName}/entrar`
		if (typeof window !== 'undefined') window.location.href = target
	}

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<Header />
			<div className="flex">
				<Sidebar />
				<main className="flex-1 p-4">
					<h1 className="text-2xl font-semibold mb-4">Times do campeonato {id}</h1>

					{loading && <p>Carregando times...</p>}

					{error && (
						<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
							<div className="flex items-center mb-2">
								<svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
								</svg>
								<h3 className="text-sm font-medium text-red-800 dark:text-red-200">
									Não foi possível carregar os times
								</h3>
							</div>
							<p className="text-sm text-red-700 dark:text-red-300 mb-3">{error}</p>
							
							{error.includes('404') || error.includes('não encontrado') ? (
								<div className="text-sm text-red-600 dark:text-red-400">
									<p className="mb-2">Possíveis soluções:</p>
									<ul className="list-disc list-inside space-y-1 text-xs">
										<li>Verifique se o ID do campeonato está correto</li>
										<li>O campeonato pode ainda não ter times cadastrados</li>
										<li>Volte à lista de campeonatos e tente novamente</li>
									</ul>
								</div>
							) : error.includes('não autorizado') || error.includes('permissão') ? (
								<div className="text-sm text-red-600 dark:text-red-400">
									<p>Tente fazer login ou verificar suas permissões de acesso.</p>
								</div>
							) : (
								<div className="text-sm text-red-600 dark:text-red-400">
									<p>Tente recarregar a página ou entre em contato com o suporte se o problema persistir.</p>
								</div>
							)}
						</div>
					)}

					{!loading && !error && teams && teams.length === 0 && <p>Nenhum time encontrado.</p>}

					{!loading && teams && teams.length > 0 && (
						<ul className="space-y-2">
							{teams.map((t) => {
								const name = t.nome ?? t.name ?? `Time ${t.id ?? ''}`
								const isPublic = isPublicTeam(t)
								return (
									<li key={t.id ?? name} className="p-2 border rounded flex items-center justify-between">
										<div className="font-medium">{name}</div>
										{isPublic ? (
											<button onClick={() => joinTeam(t)} className="ml-4 px-3 py-1 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-700">
												Entrar
											</button>
										) : (
											<div className="text-sm text-slate-500">Privado</div>
										)}
									</li>
								)
							})}
						</ul>
					)}

					{!localStorage.getItem('token') && !localStorage.getItem('jwt') && (
						<div className="mt-6 text-sm text-slate-500">
							<p>Endpoint consultado: <code>{`${process.env.NEXT_PUBLIC_API_URL || ''}/campeonatos/${id}/times`}</code></p>
							<p>Coloque um token válido em <code>localStorage.token</code> se o endpoint exigir autenticação.</p>
						</div>
					)}
				</main>
			</div>
		</div>
	)
}
