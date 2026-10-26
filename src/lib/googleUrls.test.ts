import { describe, expect, it } from 'vitest'
import { checkFormUrl, checkSheetUrl } from './googleUrls'
import { dashboardLink, readHash, toHash } from './hashParams'

const PUB = 'https://docs.google.com/spreadsheets/d/e/2PACX-abc_123/pub'

describe('checkSheetUrl', () => {
  it('keeps a CSV link', () => {
    expect(checkSheetUrl(`${PUB}?gid=7&single=true&output=csv`)).toEqual({
      ok: true,
      url: `${PUB}?gid=7&single=true&output=csv`,
    })
  })

  it('converts a web page link to CSV', () => {
    const result = checkSheetUrl('https://docs.google.com/spreadsheets/d/e/2PACX-abc_123/pubhtml?gid=7')
    expect(result).toEqual({ ok: true, url: `${PUB}?gid=7&output=csv` })
  })

  it('rejects the editor link with a hint to publish', () => {
    const result = checkSheetUrl('https://docs.google.com/spreadsheets/d/1abc/edit#gid=0')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.message).toMatch(/Publish to web/)
  })

  it('rejects other sites', () => {
    expect(checkSheetUrl('https://example.com/data.csv').ok).toBe(false)
    expect(checkSheetUrl('not a url').ok).toBe(false)
  })
})

describe('checkFormUrl', () => {
  it('accepts respondent links', () => {
    expect(checkFormUrl('https://forms.gle/AbC123').ok).toBe(true)
    expect(checkFormUrl('https://docs.google.com/forms/d/e/1FAIpQL-x/viewform?usp=sf_link').ok).toBe(true)
  })

  it('rejects the editor link', () => {
    expect(checkFormUrl('https://docs.google.com/forms/d/1abc/edit').ok).toBe(false)
  })
})

describe('hash params', () => {
  it('round-trips through the URL fragment', () => {
    const params = { csv: `${PUB}?gid=7&output=csv`, form: 'https://forms.gle/AbC123' }
    expect(readHash(toHash(params))).toEqual(params)
  })

  it('returns null without a sheet', () => {
    expect(readHash('')).toBeNull()
    expect(readHash('#form=x')).toBeNull()
  })

  it('replaces any existing fragment', () => {
    expect(dashboardLink('https://x.dev/app/#old', { csv: 'c' })).toBe('https://x.dev/app/#csv=c')
  })
})
