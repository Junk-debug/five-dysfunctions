import { Fragment } from 'react'
import type { Response } from '../lib/parseResponses'
import { DYSFUNCTIONS, answerVerdict, mean } from '../lib/scoring'
import { VERDICT_BADGE } from './verdictStyles'

interface Props {
  questions: string[]
  // same order as people
  responses: Response[]
  people: string[]
}

const th = 'border-line border-b px-3 py-2.5 align-bottom'
const td = 'border-line border-b px-3 py-2.5 text-center font-display font-bold'

export function QuestionTable({ questions, responses, people }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-muted text-xs font-semibold">
            <th className={`${th} bg-surface sticky left-0 text-left`}>Question</th>
            {people.map((p, i) => (
              <th key={i} className={th}>
                {p}
              </th>
            ))}
            <th className={th}>Avg</th>
          </tr>
        </thead>
        <tbody>
          {DYSFUNCTIONS.map((d) => (
            <Fragment key={d.n}>
              <tr>
                <td colSpan={people.length + 2} className="bg-bg px-3 py-2.5 text-[12.5px] font-bold">
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
                    {values.map((v, i) => (
                      <td key={i} className={`${td} ${VERDICT_BADGE[answerVerdict(v)]}`}>
                        {v}
                      </td>
                    ))}
                    <td className={`${td} ${VERDICT_BADGE[answerVerdict(avg)]}`}>{avg.toFixed(2)}</td>
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
