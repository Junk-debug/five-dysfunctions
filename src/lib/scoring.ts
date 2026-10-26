export const QUESTION_COUNT = 15

// Below this many answers an anonymous survey stays hidden, so nobody can work out who answered what.
export const MIN_ANONYMOUS_RESPONSES = 3

export type Verdict = 'ok' | 'warn' | 'bad'

export interface Dysfunction {
  n: number
  name: string
  description: string
  // 1-based question numbers, in the order of the form's columns
  questions: [number, number, number]
}

// Each dysfunction is the sum of 3 answers on a 1–3 scale, so 3..9. Higher is healthier.
export const DYSFUNCTIONS: Dysfunction[] = [
  { n: 1, name: 'Absence of Trust', description: 'invulnerability, hiding weaknesses', questions: [4, 6, 12] },
  { n: 2, name: 'Fear of Conflict', description: 'artificial harmony', questions: [1, 7, 10] },
  { n: 3, name: 'Lack of Commitment', description: 'ambiguity, no buy-in', questions: [3, 8, 13] },
  { n: 4, name: 'Avoidance of Accountability', description: 'low standards', questions: [2, 11, 14] },
  { n: 5, name: 'Inattention to Results', description: 'status and ego over team goals', questions: [5, 9, 15] },
]

export const SCORE_MIN = 3
export const SCORE_MAX = 9

export const VERDICT_LABEL: Record<Verdict, string> = {
  ok: 'healthy',
  warn: 'at risk',
  bad: 'needs attention',
}

export const ANSWER_LABEL: Record<number, string> = { 1: 'Rarely', 2: 'Sometimes', 3: 'Usually' }

// 8–9 healthy · 6–7 at risk · 3–5 needs attention
export function scoreVerdict(score: number): Verdict {
  const rounded = Math.round(score)
  if (rounded >= 8) return 'ok'
  if (rounded >= 6) return 'warn'
  return 'bad'
}

export function answerVerdict(answer: number): Verdict {
  if (answer >= 2.5) return 'ok'
  if (answer >= 1.5) return 'warn'
  return 'bad'
}

export function dysfunctionScores(answers: number[]): number[] {
  return DYSFUNCTIONS.map((d) => d.questions.reduce((sum, q) => sum + answers[q - 1], 0))
}

export function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length
}

export type Agreement = 'high' | 'mixed' | 'split'

export const AGREEMENT_LABEL: Record<Agreement, string> = {
  high: 'strong agreement',
  mixed: 'some disagreement',
  split: 'opinions split',
}

export function agreement(min: number, max: number): Agreement {
  const range = max - min
  if (range <= 1) return 'high'
  if (range <= 2) return 'mixed'
  return 'split'
}

export interface DysfunctionSummary {
  dysfunction: Dysfunction
  scores: number[]
  average: number
  min: number
  max: number
  agreement: Agreement
}

export interface TeamSummary {
  dysfunctions: DysfunctionSummary[]
  // mean of the five dysfunction averages, 3..9
  health: number
  weakest: Dysfunction
}

export function summarizeTeam(answerSets: number[][]): TeamSummary {
  const perPerson = answerSets.map(dysfunctionScores)
  const dysfunctions = DYSFUNCTIONS.map((dysfunction, i) => {
    const scores = perPerson.map((s) => s[i])
    const min = Math.min(...scores)
    const max = Math.max(...scores)
    return { dysfunction, scores, average: mean(scores), min, max, agreement: agreement(min, max) }
  })
  const weakest = dysfunctions.reduce((a, b) => (b.average < a.average ? b : a)).dysfunction
  return { dysfunctions, health: mean(dysfunctions.map((d) => d.average)), weakest }
}
