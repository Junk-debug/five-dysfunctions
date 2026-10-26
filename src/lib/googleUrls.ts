export type UrlCheck = { ok: true; url: string } | { ok: false; message: string }

const EMPTY: UrlCheck = { ok: false, message: 'Paste a link.' }

function toUrl(input: string): URL | null {
  try {
    return new URL(input.trim())
  } catch {
    return null
  }
}

// Turns any "Publish to web" link into its CSV form; rejects links that only work for signed-in editors.
export function checkSheetUrl(input: string): UrlCheck {
  if (!input.trim()) return EMPTY
  const url = toUrl(input)
  if (!url || url.hostname !== 'docs.google.com' || !url.pathname.startsWith('/spreadsheets/')) {
    return { ok: false, message: 'This is not a Google Sheets link.' }
  }
  const published = /^\/spreadsheets\/d\/e\/[\w-]+\/pub(html)?$/.exec(url.pathname)
  if (!published) {
    return {
      ok: false,
      message:
        'This is the editor link. In the sheet, use File → Share → Publish to web, choose CSV, and paste the link it gives you.',
    }
  }
  url.pathname = url.pathname.replace(/pubhtml$/, 'pub')
  url.searchParams.set('output', 'csv')
  return { ok: true, url: url.toString() }
}

// The link respondents open. Optional on the dashboard, so an empty value is fine.
export function checkFormUrl(input: string): UrlCheck {
  if (!input.trim()) return EMPTY
  const url = toUrl(input)
  if (url?.hostname === 'forms.gle' && url.pathname.length > 1) return { ok: true, url: url.toString() }
  if (url?.hostname === 'docs.google.com' && /^\/forms\/d\/e\/[\w-]+\/viewform$/.test(url.pathname)) {
    return { ok: true, url: url.toString() }
  }
  if (url?.hostname === 'docs.google.com' && /^\/forms\/d\/[\w-]+\/edit$/.test(url.pathname)) {
    return {
      ok: false,
      message: 'This is the editor link. In the form, click Send → the link icon, and paste that link.',
    }
  }
  return { ok: false, message: 'This is not a Google Forms link.' }
}
