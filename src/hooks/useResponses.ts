import { useCallback, useEffect, useState } from 'react'
import { parseResponses, type ParseError, type ParsedResponses } from '../lib/parseResponses'

export type Source = { kind: 'sheet'; url: string } | { kind: 'file'; name: string; text: string }

export type LoadError = ParseError | { kind: 'network' } | { kind: 'http'; status: number }

export type ResponsesState =
  | { status: 'loading' }
  | { status: 'error'; error: LoadError }
  | { status: 'ready'; data: ParsedResponses; loadedAt: Date }

async function readSource(source: Source): Promise<ResponsesState> {
  let text = source.kind === 'file' ? source.text : ''
  if (source.kind === 'sheet') {
    try {
      const res = await fetch(source.url, { cache: 'no-store', referrerPolicy: 'no-referrer' })
      if (!res.ok) return { status: 'error', error: { kind: 'http', status: res.status } }
      text = await res.text()
    } catch {
      return { status: 'error', error: { kind: 'network' } }
    }
  }
  const parsed = parseResponses(text)
  return parsed.ok ? { status: 'ready', data: parsed.data, loadedAt: new Date() } : { status: 'error', error: parsed.error }
}

// The dashboard is keyed by source, so a new source always starts from 'loading'.
export function useResponses(source: Source) {
  const [state, setState] = useState<ResponsesState>({ status: 'loading' })
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    let cancelled = false
    readSource(source).then((next) => !cancelled && setState(next))
    return () => {
      cancelled = true
    }
  }, [source])

  const refresh = useCallback(async () => {
    setRefreshing(true)
    setState(await readSource(source))
    setRefreshing(false)
  }, [source])

  return { state, refreshing, refresh }
}
