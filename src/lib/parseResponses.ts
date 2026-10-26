import Papa from 'papaparse'
import { QUESTION_COUNT } from './scoring'

export interface Response {
  // undefined when the survey has no name field or this person left it blank
  name?: string
  submittedAt?: Date
  answers: number[]
}

export interface ParsedResponses {
  questions: string[]
  responses: Response[]
  // true when the form has a name field and at least one person filled it in
  hasNames: boolean
  // rows dropped because an answer was missing or not 1–3
  skipped: number
}

export type ParseError =
  | { kind: 'empty' }
  | { kind: 'not-csv' }
  | { kind: 'wrong-columns'; found: number }

export type ParseResult = { ok: true; data: ParsedResponses } | { ok: false; error: ParseError }

const TIMESTAMP_HEADER = /timestamp|time|date|отметка времени|время/i
// Short headers only, so a question that mentions a name or an email is never mistaken for one.
const NAME_HEADER = /^.{0,30}(\bname\b|имя).{0,10}$/i
// Never shown and never treated as an answer, even if the form collects it.
const PRIVATE_HEADER = /^.{0,30}(e-?mail|username|почт).{0,10}$/i

// Accepts "3", "3 - Usually", "3.0"; anything else is not an answer.
export function parseAnswer(raw: string | undefined): number | null {
  const match = /^\s*([123])(?:[.,]0)?(?:\s|$|\s*[-–—:])/.exec(raw ?? '')
  return match ? Number(match[1]) : null
}

function parseDate(raw: string | undefined): Date | undefined {
  if (!raw) return undefined
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? undefined : date
}

export function parseResponses(csv: string): ParseResult {
  if (/^\s*</.test(csv)) return { ok: false, error: { kind: 'not-csv' } }

  const rows = Papa.parse<string[]>(csv.trim(), { skipEmptyLines: 'greedy' }).data
  if (rows.length === 0) return { ok: false, error: { kind: 'empty' } }

  const [header, ...body] = rows
  let timestampCol: number | null = null
  let nameCol: number | null = null
  const answerCols: number[] = []

  for (const [col, title] of header.entries()) {
    const values = body.map((r) => r[col]).filter((v) => v != null && v.trim() !== '')
    if (col === 0 && TIMESTAMP_HEADER.test(title)) {
      timestampCol = col
    } else if (PRIVATE_HEADER.test(title)) {
      continue
    } else if (nameCol === null && NAME_HEADER.test(title)) {
      nameCol = col
    } else if (values.length > 0 && values.every((v) => parseAnswer(v) !== null)) {
      answerCols.push(col)
    }
  }

  // With no responses yet every column is empty, so only the header can be checked.
  if (body.length === 0) return { ok: false, error: { kind: 'empty' } }
  if (answerCols.length < QUESTION_COUNT) {
    return { ok: false, error: { kind: 'wrong-columns', found: answerCols.length } }
  }

  const questionCols = answerCols.slice(0, QUESTION_COUNT)
  const responses: Response[] = []
  let skipped = 0

  for (const row of body) {
    const answers = questionCols.map((col) => parseAnswer(row[col]))
    if (answers.some((a) => a === null)) {
      skipped++
      continue
    }
    const name = nameCol !== null ? row[nameCol]?.trim() || undefined : undefined
    const submittedAt = timestampCol !== null ? parseDate(row[timestampCol]) : undefined
    responses.push({ name, submittedAt, answers: answers as number[] })
  }

  if (responses.length === 0) return { ok: false, error: { kind: 'empty' } }

  return {
    ok: true,
    data: {
      questions: questionCols.map((col) => header[col].trim()),
      responses,
      hasNames: responses.some((r) => r.name),
      skipped,
    },
  }
}
