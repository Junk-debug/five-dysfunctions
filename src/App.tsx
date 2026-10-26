import { useEffect, useMemo, useState } from 'react'
import type { Source } from './hooks/useResponses'
import { checkFormUrl, checkSheetUrl } from './lib/googleUrls'
import { readHash } from './lib/hashParams'
import { Dashboard } from './pages/Dashboard'
import { Setup } from './pages/Setup'

// No router: a #csv=… fragment means dashboard, anything else means setup.
export default function App() {
  const [hash, setHash] = useState(window.location.hash)
  const [file, setFile] = useState<{ name: string; text: string } | null>(null)

  useEffect(() => {
    const onChange = () => {
      setHash(window.location.hash)
      setFile(null)
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const params = useMemo(() => readHash(hash), [hash])
  const source = useMemo<Source | null>(() => {
    if (file) return { kind: 'file', ...file }
    // Only published Google Sheets: a crafted link must not make this page show someone else's content.
    const sheet = params && checkSheetUrl(params.csv)
    if (sheet?.ok) return { kind: 'sheet', url: sheet.url }
    return null
  }, [file, params])

  const form = params?.form ? checkFormUrl(params.form) : null

  return (
    <main className="mx-auto max-w-[1180px] px-4 pt-8 pb-20 sm:px-6">
      {source ? <Dashboard key={source.kind === 'sheet' ? source.url : source.name} source={source} formUrl={form?.ok ? form.url : undefined} /> : <Setup onFile={(name, text) => setFile({ name, text })} />}
    </main>
  )
}
