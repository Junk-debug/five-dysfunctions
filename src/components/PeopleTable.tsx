import { DYSFUNCTIONS, VERDICT_LABEL, mean, scoreVerdict, type TeamSummary } from '../lib/scoring'
import { VERDICT_BADGE } from './verdictStyles'

export function PeopleTable({ summary, people }: { summary: TeamSummary; people: string[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-muted text-xs font-semibold">
            <th className="bg-surface border-line sticky left-0 border-b px-3 py-2.5 text-left">Person</th>
            {DYSFUNCTIONS.map((d) => (
              <th key={d.n} className="border-line border-b px-3 py-2.5 align-bottom">
                {d.n}. {d.name}
              </th>
            ))}
            <th className="border-line border-b px-3 py-2.5 align-bottom">Average</th>
          </tr>
        </thead>
        <tbody>
          {people.map((person, pi) => {
            const scores = summary.dysfunctions.map((d) => d.scores[pi])
            return (
              <tr key={pi}>
                <td className="bg-surface border-line sticky left-0 border-b px-3 py-2.5 font-semibold whitespace-nowrap">{person}</td>
                {scores.map((score, di) => (
                  <ScoreCell key={di} score={score} title={`${DYSFUNCTIONS[di].name}: ${VERDICT_LABEL[scoreVerdict(score)]}`} />
                ))}
                <ScoreCell score={mean(scores)} digits={1} />
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function ScoreCell({ score, digits = 0, title }: { score: number; digits?: number; title?: string }) {
  return (
    <td title={title} className={`border-line font-display border-b px-3 py-2.5 text-center text-[15px] font-bold ${VERDICT_BADGE[scoreVerdict(score)]}`}>
      {score.toFixed(digits)}
    </td>
  )
}
