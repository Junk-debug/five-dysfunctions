import { AGREEMENT_LABEL, SCORE_MAX, SCORE_MIN, VERDICT_LABEL, scoreVerdict, type TeamSummary } from '../lib/scoring'
import { AGREEMENT_BADGE, VERDICT_BADGE, personColor } from './verdictStyles'

const position = (score: number) => `${((score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)) * 100}%`

// Worst first, each with the team average and where every individual score sits on the 3–9 scale.
export function DysfunctionList({ summary, people }: { summary: TeamSummary; people: string[] | null }) {
  const items = [...summary.dysfunctions].sort((a, b) => a.average - b.average)

  return (
    <div>
      {items.map((item) => {
        const verdict = scoreVerdict(item.average)
        return (
          <div key={item.dysfunction.n} className="border-line grid grid-cols-[1fr_auto] items-center gap-x-[18px] gap-y-1.5 border-t py-4 first:border-t-0">
            <div>
              <div className="text-[15.5px] font-bold">
                {item.dysfunction.n}. {item.dysfunction.name}
              </div>
              <div className="text-muted text-[12.5px] font-medium">{item.dysfunction.description}</div>
            </div>
            <div className="text-right">
              <div className="font-display text-2xl leading-none font-bold">
                {item.average.toFixed(1)}
                <small className="text-muted font-sans text-xs font-semibold"> /9</small>
              </div>
              <span className={`mt-1.5 inline-block rounded-full px-2.5 py-1 text-[11.5px] font-bold ${VERDICT_BADGE[verdict]}`}>
                {VERDICT_LABEL[verdict]}
              </span>
            </div>
            <div className="col-span-2 mt-2.5">
              <div className="relative h-[34px]">
                <div className="from-bad-bg via-warn-bg to-ok-bg absolute inset-x-0 top-3.5 h-1.5 rounded-sm bg-linear-to-r" />
                <div
                  className="bg-ink absolute top-0.5 h-[30px] w-[3px] -translate-x-1/2 rounded-sm"
                  style={{ left: position(item.average) }}
                  title={`average ${item.average.toFixed(1)}`}
                />
                {item.scores.map((score, i) => (
                  <div
                    key={i}
                    className="border-surface absolute top-[7px] size-5 -translate-x-1/2 rounded-full border-[2.5px] shadow"
                    style={{ left: position(score), background: people ? personColor(i) : 'var(--color-muted)', opacity: people ? 1 : 0.55 }}
                    title={people ? `${people[i]}: ${score}` : String(score)}
                  />
                ))}
                <div className="text-muted absolute inset-x-0 top-6 flex justify-between text-[10px]">
                  <span>3</span>
                  <span>6</span>
                  <span>9</span>
                </div>
              </div>
              <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${AGREEMENT_BADGE[item.agreement]}`}>
                {AGREEMENT_LABEL[item.agreement]} · range {item.min}–{item.max}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
