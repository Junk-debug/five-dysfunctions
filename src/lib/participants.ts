import type { Response } from './parseResponses'

export interface Participant {
  label: string
  response: Response
}

// FNV-1a: a cheap, stable hash so the same response always lands in the same place.
function hash(text: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

const responseKey = (r: Response) => `${r.submittedAt?.getTime() ?? ''}|${r.answers.join('')}`

/**
 * Named surveys keep submission order and people's names.
 * Anonymous ones are reordered by a hash, so "Participant 1" is not simply whoever answered first,
 * and labelled Participant 1, 2, …
 */
export function toParticipants(responses: Response[], named: boolean): Participant[] {
  const ordered = named ? responses : [...responses].sort((a, b) => hash(responseKey(a)) - hash(responseKey(b)))
  // Names become chart keys, so two people called "Alex" need different labels.
  const seen = new Map<string, number>()
  return ordered.map((response, i) => {
    const base = (named && response.name) || `Participant ${i + 1}`
    const count = (seen.get(base) ?? 0) + 1
    seen.set(base, count)
    return { label: count > 1 ? `${base} (${count})` : base, response }
  })
}
