
'use client'

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
				const url = `${process.env.NEXT_PUBLIC_API_URL || ''}/championships/${id}/times`
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

	return (
		<div className="p-4">
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
					{teams.map((t) => (
						<li key={t.id ?? t.nome ?? Math.random()} className="p-2 border rounded">
							<div className="font-medium">{t.nome ?? t.name ?? `Time ${t.id ?? ''}`}</div>
							<div className="text-sm text-slate-600">{t.sigla ?? t.abbr ?? ''}</div>
							<pre className="mt-2 text-xs bg-slate-50 p-2 rounded overflow-auto">{JSON.stringify(t, null, 2)}</pre>
						</li>
					))}
				</ul>
			)}

			<div className="mt-6 text-sm text-slate-500">
				<p>Endpoint consultado: <code>{`${process.env.NEXT_PUBLIC_API_URL || ''}/championships/${id}/times`}</code></p>
				<p>Coloque um token válido em <code>localStorage.token</code> se o endpoint exigir autenticação.</p>
			</div>
		</div>
	)
}
