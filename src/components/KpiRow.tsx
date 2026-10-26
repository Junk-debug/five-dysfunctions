import type { ReactNode } from 'react'
import type { Response } from '../lib/parseResponses'
import { VERDICT_LABEL, scoreVerdict, type TeamSummary } from '../lib/scoring'
import { VERDICT_COLOR } from './verdictStyles'

function Kpi({ value, label, accent = 'var(--color-accent)' }: { value: ReactNode; label: string; accent?: string }) {
  return (
    <div className="bg-surface border-line shadow-card relative overflow-hidden rounded-2xl border px-[22px] py-5">
      <span className="absolute inset-y-0 left-0 w-1" style={{ background: accent }} />
      <div className="font-display text-[28px] leading-none font-bold tracking-tight">{value}</div>
      <div className="text-muted mt-2.5 text-[13px] font-medium">{label}</div>
    </div>
  )
}

export function KpiRow({ summary, responses }: { summary: TeamSummary; responses: Response[] }) {
  const healthVerdict = scoreVerdict(summary.health)
  const dates = responses.flatMap((r) => (r.submittedAt ? [r.submittedAt.getTime()] : []))
  const last = dates.length
    ? new Date(Math.max(...dates)).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'

  return (
    <div className="mb-[22px] grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-4">
      <Kpi value={responses.length} label="Responses" />
      <Kpi
        value={
          <>
            {summary.health.toFixed(1)} <small className="text-muted text-base">/ 9</small>
          </>
        }
        label={`Team health · ${VERDICT_LABEL[healthVerdict]}`}
        accent={VERDICT_COLOR[healthVerdict]}
      />
      <Kpi value={<span className="text-xl">{summary.weakest.name}</span>} label="Weakest area" accent="var(--color-bad)" />
      <Kpi value={<span className="text-xl">{last}</span>} label="Latest response" />
    </div>
  )
}
