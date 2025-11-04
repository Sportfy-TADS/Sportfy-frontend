
'use client'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { useEffect, useState } from 'react'

type Team = {
	id?: number
	nome?: string
	[key: string]: any
}

export default function Page({ params }: { params: { idCampeonato: string } }) {
	const id = params.idCampeonato
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
					setError(`${res.status} ${res.statusText}${text ? ' - ' + text : ''}`)
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
						<div className="text-red-600 mb-4">
							<strong>Erro ao buscar times:</strong> {error}
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
