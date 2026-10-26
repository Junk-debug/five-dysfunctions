import { useRef, useState, type ReactNode } from 'react'
import { REPO_URL, TEMPLATE_FORM_COPY_URL } from '../config'
import { checkFormUrl, checkSheetUrl } from '../lib/googleUrls'
import { dashboardLink, toHash } from '../lib/hashParams'
import { DYSFUNCTIONS, MIN_ANONYMOUS_RESPONSES, QUESTION_COUNT } from '../lib/scoring'

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <li className="border-line grid grid-cols-[36px_1fr] gap-4 border-t py-6 first:border-t-0">
      <span className="bg-ink font-display flex size-9 items-center justify-center rounded-full text-sm font-bold text-white">{n}</span>
      <div>
        <h3 className="mb-2 text-base font-bold">{title}</h3>
        <div className="text-muted space-y-2 text-[14px] [&_b]:text-ink">{children}</div>
      </div>
    </li>
  )
}

function Field({ label, hint, value, onChange, error }: { label: string; hint: string; value: string; onChange: (v: string) => void; error?: string }) {
  return (
    <label className="block">
      <span className="text-ink mb-1 block text-sm font-semibold">{label}</span>
      <input className="input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={hint} spellCheck={false} />
      {error && <span className="text-bad mt-1 block text-[13px] font-medium">{error}</span>}
    </label>
  )
}

export function Setup({ onFile }: { onFile: (name: string, text: string) => void }) {
  const [sheet, setSheet] = useState('')
  const [form, setForm] = useState('')
  const [copied, setCopied] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const sheetCheck = checkSheetUrl(sheet)
  const formCheck = checkFormUrl(form)
  const params = sheetCheck.ok ? { csv: sheetCheck.url, form: formCheck.ok ? formCheck.url : undefined } : null
  const link = params ? dashboardLink(window.location.href, params) : ''

  const copyLink = async () => {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto max-w-[820px]">
      <header className="mb-8">
        <h1 className="font-display text-[clamp(26px,4.4vw,44px)] leading-[1.05] font-extrabold tracking-tight">Five Dysfunctions of a Team</h1>
        <p className="text-muted mt-4 max-w-[640px] text-[16px]">
          A free results dashboard for a {QUESTION_COUNT}-question team assessment based on Patrick Lencioni's model. Your team answers a Google Form, the dashboard turns the
          answers into a picture you can discuss together. No sign-up, no server: answers stay in your own Google Sheet.
        </p>
      </header>

      <section className="card">
        <ol>
          <Step n={1} title="Create the survey">
            {TEMPLATE_FORM_COPY_URL ? (
              <>
                <p>Make your own copy of the template form. It opens in your Google account; nobody else sees your copy.</p>
                <a className="btn btn-primary mt-1" href={TEMPLATE_FORM_COPY_URL} target="_blank" rel="noreferrer">
                  Copy the template form
                </a>
              </>
            ) : (
              <>
                <p>
                  Create a Google Form with {QUESTION_COUNT} statements, each a <b>Linear scale from 1 to 3</b> (1 = rarely, 2 = sometimes, 3 = usually).
                  The dashboard groups them by position:
                </p>
                <ul className="list-disc pl-5">
                  {DYSFUNCTIONS.map((d) => (
                    <li key={d.n}>
                      {d.name}: questions {d.questions.join(', ')}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <p>
              <b>Decide how open the results are.</b> Keep an optional <b>“Your name”</b> short-answer question if your team wants to discuss who answered
              what. Delete it for an anonymous survey: the dashboard then shows only totals, and only after {MIN_ANONYMOUS_RESPONSES} people have answered.
            </p>
            <p>
              In the form's <b>Settings → Responses</b>, keep <b>Collect email addresses</b> off. The dashboard ignores emails anyway, but a published sheet
              would show them.
            </p>
          </Step>

          <Step n={2} title="Connect a spreadsheet">
            <p>
              In the form, open the <b>Responses</b> tab and click <b>Link to Sheets</b> → create a new spreadsheet.
            </p>
          </Step>

          <Step n={3} title="Publish the responses as CSV">
            <p>
              In that spreadsheet: <b>File → Share → Publish to web</b>. Choose the <b>Form responses 1</b> tab instead of “Entire document”, and{' '}
              <b>Comma-separated values (.csv)</b> instead of “Web page”. Click <b>Publish</b> and copy the link.
            </p>
            <p className="bg-warn-bg text-ink rounded-xl px-3.5 py-2.5">
              Anyone with this link can read the answers. Share the dashboard only inside your team. To stop sharing, use the same dialog → Stop publishing.
            </p>
          </Step>

          <Step n={4} title="Get your dashboard">
            <div className="space-y-4 pt-1">
              <Field
                label="Published CSV link"
                hint="https://docs.google.com/spreadsheets/d/e/…/pub?output=csv"
                value={sheet}
                onChange={setSheet}
                error={sheet && !sheetCheck.ok ? sheetCheck.message : undefined}
              />
              <Field
                label="Survey link for your team (optional)"
                hint="https://forms.gle/…"
                value={form}
                onChange={setForm}
                error={form && !formCheck.ok ? formCheck.message : undefined}
              />
              {params && (
                <div className="bg-ok-bg rounded-xl p-4">
                  <p className="text-ink mb-3 text-sm font-semibold">Your dashboard link. Bookmark it: it's the only place it's stored.</p>
                  <input className="input mb-3 font-mono text-xs" value={link} readOnly onFocus={(e) => e.currentTarget.select()} />
                  <div className="flex flex-wrap gap-3">
                    <a className="btn btn-primary" href={toHash(params)}>
                      Open dashboard
                    </a>
                    <button className="btn" onClick={copyLink}>
                      {copied ? 'Copied' : 'Copy link'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Step>
        </ol>
      </section>

      <section className="card">
        <h2 className="card-title">Already have a CSV file?</h2>
        <p className="card-lead">Download the responses (File → Download → CSV) and open them here. The file never leaves your browser.</p>
        <input
          ref={fileInput}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (file) onFile(file.name, await file.text())
            e.target.value = ''
          }}
        />
        <button className="btn" onClick={() => fileInput.current?.click()}>
          Choose CSV file
        </button>
      </section>

      <footer className="text-muted mt-10 text-center text-[12.5px] leading-relaxed">
        Based on the model from <i>The Five Dysfunctions of a Team</i> by Patrick Lencioni. Not affiliated with the author or The Table Group.
        <br />
        <a className="underline" href={REPO_URL} target="_blank" rel="noreferrer">
          Source on GitHub
        </a>
      </footer>
    </div>
  )
}
