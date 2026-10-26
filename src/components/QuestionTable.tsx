import { Fragment } from 'react'
import type { Response } from '../lib/parseResponses'
import { ANSWER_LABEL, DYSFUNCTIONS, answerVerdict, mean } from '../lib/scoring'
import { VERDICT_BADGE } from './verdictStyles'

interface Props {
  questions: string[]
  responses: Response[]
  // with names: one column per person; without: how many people gave each answer
  people: string[] | null
}

const ANSWERS = [1, 2, 3]
const th = 'border-line border-b px-3 py-2.5 align-bottom'
const td = 'border-line border-b px-3 py-2.5 text-center'

export function QuestionTable({ questions, responses, people }: Props) {
  const columns = people ?? ANSWERS.map((a) => `${a} · ${ANSWER_LABEL[a]}`)

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-muted text-xs font-semibold">
            <th className={`${th} bg-surface sticky left-0 text-left`}>Question</th>
            {columns.map((c, i) => (
              <th key={i} className={th}>
                {c}
              </th>
            ))}
            <th className={th}>Avg</th>
          </tr>
        </thead>
        <tbody>
          {DYSFUNCTIONS.map((d) => (
            <Fragment key={d.n}>
              <tr>
                <td colSpan={columns.length + 2} className="bg-bg px-3 py-2.5 text-[12.5px] font-bold">
                  {d.n}. {d.name}
                </td>
              </tr>
              {d.questions.map((q) => {
                const values = responses.map((r) => r.answers[q - 1])
                const avg = mean(values)
                return (
                  <tr key={q}>
                    <td className="bg-surface border-line sticky left-0 max-w-[420px] min-w-[240px] border-b px-3 py-2.5 text-[13px] leading-snug font-medium">
                      <b className="font-display text-muted mr-1.5">{q}.</b>
                      {questions[q - 1]}
                    </td>
                    {people
                      ? values.map((v, i) => (
                          <td key={i} className={`${td} font-display font-bold ${VERDICT_BADGE[answerVerdict(v)]}`}>
                            {v}
                          </td>
                        ))
                      : ANSWERS.map((a) => {
                          const count = values.filter((v) => v === a).length
                          return (
                            <td key={a} className={`${td} font-display font-bold ${count ? VERDICT_BADGE[answerVerdict(a)] : 'text-muted'}`}>
                              {count || '·'}
                            </td>
                          )
                        })}
                    <td className={`${td} font-display font-bold ${VERDICT_BADGE[answerVerdict(avg)]}`}>{avg.toFixed(2)}</td>
                  </tr>
                )
              })}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
