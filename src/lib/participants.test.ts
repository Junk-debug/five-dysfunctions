import { describe, expect, it } from 'vitest'
import type { Response } from './parseResponses'
import { toParticipants } from './participants'

const response = (minute: number, name?: string): Response => ({
  name,
  submittedAt: new Date(2026, 9, 26, 10, minute),
  answers: Array(15).fill((minute % 3) + 1),
})

describe('toParticipants', () => {
  it('keeps names and submission order for named surveys', () => {
    const result = toParticipants([response(1, 'Ann'), response(2), response(3, 'Ann')], true)
    expect(result.map((p) => p.label)).toEqual(['Ann', 'Participant 2', 'Ann (2)'])
  })

  it('hides names and numbers anonymous participants in a stable, non-chronological order', () => {
    const responses = Array.from({ length: 8 }, (_, i) => response(i, `Person ${i}`))
    const first = toParticipants(responses, false)
    expect(first.map((p) => p.label)).toEqual(Array.from({ length: 8 }, (_, i) => `Participant ${i + 1}`))
    expect(first.map((p) => p.response)).not.toEqual(responses)
    expect(toParticipants([...responses].reverse(), false).map((p) => p.response)).toEqual(first.map((p) => p.response))
  })
})
