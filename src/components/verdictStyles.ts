import type { Agreement, Verdict } from '../lib/scoring'

export const VERDICT_BADGE: Record<Verdict, string> = {
  ok: 'text-ok bg-ok-bg',
  warn: 'text-warn bg-warn-bg',
  bad: 'text-bad bg-bad-bg',
}

export const VERDICT_COLOR: Record<Verdict, string> = {
  ok: 'var(--color-ok)',
  warn: 'var(--color-warn)',
  bad: 'var(--color-bad)',
}

export const AGREEMENT_BADGE: Record<Agreement, string> = {
  high: VERDICT_BADGE.ok,
  mixed: VERDICT_BADGE.warn,
  split: VERDICT_BADGE.bad,
}

export const PERSON_COLORS = [
  '#E8533F',
  '#2D9D8F',
  '#F2A93B',
  '#4D5DBE',
  '#8E5BA6',
  '#3BA45C',
  '#D8607F',
  '#5AAFC9',
  '#B0884E',
  '#5E8B7E',
]

export const personColor = (i: number) => PERSON_COLORS[i % PERSON_COLORS.length]
