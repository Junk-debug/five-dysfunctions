import { Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts'
import { DYSFUNCTIONS, SCORE_MAX, SCORE_MIN, VERDICT_LABEL, scoreVerdict, type TeamSummary } from '../lib/scoring'
import { personColor } from './verdictStyles'

interface Props {
  summary: TeamSummary
  // per-person lines are drawn only when people answered under their names
  people: string[] | null
}

const AVERAGE_KEY = 'Team average'

// Long names like "Avoidance of Accountability" get clipped on narrow screens, so break them in two.
function AxisLabel({ x, y, textAnchor, payload }: { x?: number; y?: number; textAnchor?: 'start' | 'middle' | 'end'; payload?: { value: string } }) {
  const words = (payload?.value ?? '').split(' ')
  const lines = words.length > 2 ? [words.slice(0, -1).join(' '), words.at(-1)] : [words.join(' ')]
  return (
    <text x={x} y={y} textAnchor={textAnchor} fontSize={12} fontWeight={600} fill="var(--color-ink)">
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? (lines.length > 1 ? -4 : 4) : 14}>
          {line}
        </tspan>
      ))}
    </text>
  )
}

export function TeamRadar({ summary, people }: Props) {
  const data = DYSFUNCTIONS.map((d, i) => {
    const point: Record<string, string | number> = {
      name: d.name,
      [AVERAGE_KEY]: +summary.dysfunctions[i].average.toFixed(2),
    }
    people?.forEach((p, pi) => (point[p] = summary.dysfunctions[i].scores[pi]))
    return point
  })

  return (
    <div className="h-[420px]">
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="62%">
          <PolarGrid stroke="var(--color-line)" />
          <PolarAngleAxis dataKey="name" tick={<AxisLabel />} />
          <PolarRadiusAxis domain={[SCORE_MIN, SCORE_MAX]} tickCount={7} tick={{ fontSize: 10 }} axisLine={false} angle={90} />
          {people?.map((p, i) => (
            <Radar key={p} dataKey={p} stroke={personColor(i)} strokeWidth={1.5} fill="none" dot={{ r: 2.5, fill: personColor(i) }} isAnimationActive={false} />
          ))}
          <Radar
            dataKey={AVERAGE_KEY}
            stroke="var(--color-ink)"
            strokeWidth={3}
            fill="var(--color-ink)"
            fillOpacity={0.07}
            dot={{ r: 4, fill: 'var(--color-ink)' }}
            isAnimationActive={false}
          />
          <Tooltip formatter={(value) => `${value} (${VERDICT_LABEL[scoreVerdict(Number(value))]})`} />
          <Legend iconSize={12} wrapperStyle={{ fontSize: 12 }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
