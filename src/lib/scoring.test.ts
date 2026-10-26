import { describe, expect, it } from 'vitest'
import { DYSFUNCTIONS, QUESTION_COUNT, agreement, dysfunctionScores, scoreVerdict, summarizeTeam } from './scoring'

describe('DYSFUNCTIONS', () => {
  it('uses every question exactly once', () => {
    const used = DYSFUNCTIONS.flatMap((d) => d.questions).sort((a, b) => a - b)
    expect(used).toEqual(Array.from({ length: QUESTION_COUNT }, (_, i) => i + 1))
  })
})

describe('scoreVerdict', () => {
  it.each([
    [9, 'ok'],
    [8, 'ok'],
    [7.6, 'ok'],
    [7, 'warn'],
    [6, 'warn'],
    [5.4, 'bad'],
    [3, 'bad'],
  ])('%d → %s', (score, verdict) => {
    expect(scoreVerdict(score)).toBe(verdict)
  })
})

describe('dysfunctionScores', () => {
  it('sums the three questions of each dysfunction', () => {
    const answers = Array(15).fill(1)
    answers[3] = 3 // Q4 → Absence of Trust
    expect(dysfunctionScores(answers)).toEqual([5, 3, 3, 3, 3])
  })
})

describe('agreement', () => {
  it('grades the spread between the lowest and highest score', () => {
    expect(agreement(6, 7)).toBe('high')
    expect(agreement(6, 8)).toBe('mixed')
    expect(agreement(3, 9)).toBe('split')
  })
})

describe('summarizeTeam', () => {
  it('finds the weakest dysfunction and overall health', () => {
    const good = Array(15).fill(3)
    const weakTrust = [...good]
    for (const q of DYSFUNCTIONS[0].questions) weakTrust[q - 1] = 1
    const summary = summarizeTeam([good, weakTrust])
    expect(summary.weakest.name).toBe('Absence of Trust')
    expect(summary.dysfunctions[0]).toMatchObject({ average: 6, min: 3, max: 9, agreement: 'split' })
    expect(summary.health).toBeCloseTo((6 + 9 * 4) / 5)
  })
})
