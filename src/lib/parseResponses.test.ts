import { describe, expect, it } from 'vitest'
import { parseAnswer, parseResponses } from './parseResponses'

const questions = Array.from({ length: 15 }, (_, i) => `Q${i + 1}`)
const row = (answers: (number | string)[]) => answers.join(',')
const all = (v: number) => Array(15).fill(v)

describe('parseAnswer', () => {
  it.each([
    ['3', 3],
    [' 2 ', 2],
    ['1 - Rarely', 1],
    ['3.0', 3],
    ['', null],
    ['4', null],
    ['30', null],
    ['Usually', null],
  ])('%j → %j', (raw, expected) => {
    expect(parseAnswer(raw)).toBe(expected)
  })
})

describe('parseResponses', () => {
  it('reads anonymous responses by column position', () => {
    const csv = [
      ['Timestamp', ...questions].join(','),
      row(['6/28/2026 12:54:52', ...all(3)]),
      row(['6/29/2026 09:00:00', ...all(1)]),
    ].join('\n')
    const result = parseResponses(csv)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.hasNames).toBe(false)
    expect(result.data.questions).toEqual(questions)
    expect(result.data.responses).toHaveLength(2)
    expect(result.data.responses[0].answers).toEqual(all(3))
    expect(result.data.responses[0].submittedAt?.getFullYear()).toBe(2026)
  })

  it('keeps an optional name column and drops email', () => {
    const csv = [
      ['Timestamp', 'Email Address', 'Your name', ...questions].join(','),
      row(['6/28/2026', 'a@b.com', 'Ann', ...all(2)]),
      row(['6/28/2026', 'c@d.com', '', ...all(3)]),
    ].join('\n')
    const result = parseResponses(csv)
    if (!result.ok) throw new Error('expected ok')
    expect(result.data.hasNames).toBe(true)
    expect(result.data.responses.map((r) => r.name)).toEqual(['Ann', undefined])
    expect(JSON.stringify(result.data)).not.toContain('@')
  })

  it('does not treat a long question that mentions a name as the name column', () => {
    const long = ['Members call out each other by name when they fall short', ...questions.slice(1)]
    const csv = [['Timestamp', ...long].join(','), row(['x', ...all(2)])].join('\n')
    const result = parseResponses(csv)
    if (!result.ok) throw new Error('expected ok')
    expect(result.data.questions[0]).toBe(long[0])
  })

  it('skips rows with a missing answer', () => {
    const partial = [...all(2)]
    partial[4] = ''
    const csv = [['Timestamp', ...questions].join(','), row(['x', ...all(2)]), row(['y', ...partial])].join('\n')
    const result = parseResponses(csv)
    if (!result.ok) throw new Error('expected ok')
    expect(result.data.responses).toHaveLength(1)
    expect(result.data.skipped).toBe(1)
  })

  it('reports a form with the wrong number of questions', () => {
    const csv = [['Timestamp', ...questions.slice(0, 12)].join(','), row(['x', ...all(2).slice(0, 12)])].join('\n')
    expect(parseResponses(csv)).toEqual({ ok: false, error: { kind: 'wrong-columns', found: 12 } })
  })

  it('reports a sheet with no responses', () => {
    expect(parseResponses(['Timestamp', ...questions].join(','))).toEqual({ ok: false, error: { kind: 'empty' } })
    expect(parseResponses('')).toEqual({ ok: false, error: { kind: 'empty' } })
  })

  it('reports an HTML page instead of CSV', () => {
    expect(parseResponses('<!DOCTYPE html><html>')).toEqual({ ok: false, error: { kind: 'not-csv' } })
  })
})
