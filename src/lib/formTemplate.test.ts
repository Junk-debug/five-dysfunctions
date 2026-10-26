import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parseResponses } from './parseResponses'
import { QUESTION_COUNT } from './scoring'

// Guards the contract between template/create-form.gs and the parser: column titles must be read back correctly.
const script = readFileSync(new URL('../../template/create-form.gs', import.meta.url), 'utf8')
const block = /var QUESTIONS = \[([\s\S]*?)\];/.exec(script)?.[1] ?? ''
const questions = [...block.matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((m) => m[1].replace(/\\'/g, "'"))
const nameTitle = /setTitle\('([^']+)'\)/.exec(script)?.[1] ?? ''

const csvCell = (s: string) => `"${s.replace(/"/g, '""')}"`

describe('template form', () => {
  it(`has ${QUESTION_COUNT} questions`, () => {
    expect(questions).toHaveLength(QUESTION_COUNT)
  })

  it('produces a sheet the dashboard reads with names', () => {
    const header = ['Timestamp', nameTitle, ...questions].map(csvCell).join(',')
    const row = ['10/26/2026 10:00:00', 'Ann', ...Array(QUESTION_COUNT).fill('2')].map(csvCell).join(',')
    const result = parseResponses(`${header}\n${row}`)
    if (!result.ok) throw new Error(JSON.stringify(result.error))
    expect(result.data.hasNames).toBe(true)
    expect(result.data.questions).toEqual(questions)
  })
})
