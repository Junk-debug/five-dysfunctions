import { useMemo, useState } from 'react'
import { DysfunctionList } from '../components/DysfunctionList'
import { KpiRow } from '../components/KpiRow'
import { LoadErrorCard } from '../components/LoadErrorCard'
import { PeopleTable } from '../components/PeopleTable'
import { QuestionTable } from '../components/QuestionTable'
import { StateCard } from '../components/StateCard'
import { TeamRadar } from '../components/TeamRadar'
import { useResponses, type Source } from '../hooks/useResponses'
import type { Response } from '../lib/parseResponses'
import { MIN_ANONYMOUS_RESPONSES, summarizeTeam } from '../lib/scoring'

// Names become chart keys, so two people called "Alex" need different labels.
function personLabels(responses: Response[]): string[] {
  const seen = new Map<string, number>()
  return responses.map((r, i) => {
    const base = r.name ?? `Participant ${i + 1}`
    const count = (seen.get(base) ?? 0) + 1
    seen.set(base, count)
    return count > 1 ? `${base} (${count})` : base
  })
}

export function Dashboard({ source, formUrl }: { source: Source; formUrl?: string }) {
  const { state, refreshing, refresh } = useResponses(source)
  const [copied, setCopied] = useState(false)

  const view = useMemo(() => {
    if (state.status !== 'ready') return null
    const { responses, hasNames } = state.data
    return {
      summary: summarizeTeam(responses.map((r) => r.answers)),
      people: hasNames ? personLabels(responses) : null,
    }
  }, [state])

  const copySurveyLink = async () => {
    if (!formUrl) return
    await navigator.clipboard.writeText(formUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <header className="mb-[26px] flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-[clamp(24px,3.6vw,38px)] leading-[1.05] font-extrabold tracking-tight">
            Five Dysfunctions of a Team
          </h1>
          <div className="text-muted mt-2 text-sm font-medium">
            {source.kind === 'file' ? `Results from ${source.name}` : 'Team assessment results'}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {state.status === 'ready' && (
            <div className="text-muted text-right text-[12.5px]">
              Updated <b className="text-ink font-semibold">{state.loadedAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</b>
            </div>
          )}
          {formUrl && (
            <button className="btn" onClick={copySurveyLink}>
              {copied ? 'Copied' : 'Copy survey link'}
            </button>
          )}
          {source.kind === 'sheet' && (
            <button className="btn btn-primary" onClick={refresh} disabled={refreshing}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className={refreshing ? 'animate-spin motion-reduce:animate-none' : ''}>
                <path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" />
              </svg>
              Refresh
            </button>
          )}
        </div>
      </header>

      {state.status === 'loading' && <p className="text-muted py-20 text-center">Loading responses…</p>}

      {state.status === 'error' && <LoadErrorCard error={state.error} onRetry={refresh} />}

      {state.status === 'ready' && view && !view.people && state.data.responses.length < MIN_ANONYMOUS_RESPONSES && (
        <StateCard title={`${state.data.responses.length} of ${MIN_ANONYMOUS_RESPONSES} responses so far`}>
          <p className="text-muted">
            Answers are anonymous, so results appear once at least {MIN_ANONYMOUS_RESPONSES} people have responded. Otherwise it would be easy to tell
            who answered what.
          </p>
        </StateCard>
      )}

      {state.status === 'ready' && view && (view.people || state.data.responses.length >= MIN_ANONYMOUS_RESPONSES) && (
        <>
          <KpiRow summary={view.summary} responses={state.data.responses} />

          <section className="card">
            <div className="grid items-start gap-[18px] min-[860px]:grid-cols-[1.05fr_.95fr]">
              <div>
                <h2 className="card-title">Team profile</h2>
                <p className="card-lead">
                  {view.people
                    ? 'Each thin line is one person, the bold one is the team average. The bigger the shape, the healthier the team. Where lines diverge, people see the team differently.'
                    : 'Team average for each dysfunction. The bigger the shape, the healthier the team.'}
                </p>
                <TeamRadar summary={view.summary} people={view.people} />
              </div>
              <div>
                <h2 className="card-title">The five dysfunctions</h2>
                <p className="card-lead">Team average, verdict and how much people agree. Problem areas first.</p>
                <DysfunctionList summary={view.summary} people={view.people} />
              </div>
            </div>
          </section>

          {view.people && (
            <section className="card">
              <h2 className="card-title">Scores by person</h2>
              <p className="card-lead">Score for each dysfunction (3–9). Hover a cell for the verdict.</p>
              <PeopleTable summary={view.summary} people={view.people} />
              <Legend />
            </section>
          )}

          <section className="card">
            <h2 className="card-title">Answers to each question</h2>
            <p className="card-lead">
              {view.people ? 'How each person answered' : 'How many people gave each answer'}, grouped by dysfunction. 1 — rarely · 2 — sometimes · 3 — usually
              (higher is healthier).
            </p>
            <QuestionTable questions={state.data.questions} responses={state.data.responses} people={view.people} />
          </section>

          <footer className="text-muted mt-10 text-center text-[12.5px] leading-relaxed">
            {state.data.skipped > 0 && (
              <>
                {state.data.skipped} incomplete {state.data.skipped === 1 ? 'response was' : 'responses were'} left out.
                <br />
              </>
            )}
            Scale: 8–9 healthy · 6–7 at risk · 3–5 needs attention.
            {source.kind === 'sheet' && (
              <>
                <br />
                Google can take up to 5 minutes to show new answers in a published sheet.
              </>
            )}
          </footer>
        </>
      )}
    </>
  )
}

function Legend() {
  const items = [
    ['bg-ok', '8–9', 'healthy'],
    ['bg-warn', '6–7', 'at risk'],
    ['bg-bad', '3–5', 'needs attention'],
  ]
  return (
    <div className="text-muted mt-1.5 flex flex-wrap gap-[22px] text-[13px]">
      {items.map(([color, range, label]) => (
        <span key={range}>
          <span className={`mr-1.5 inline-block size-[11px] rounded-[3px] align-[-1px] ${color}`} />
          <b className="text-ink">{range}</b> {label}
        </span>
      ))}
    </div>
  )
}
