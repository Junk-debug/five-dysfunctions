import type { LoadError } from '../hooks/useResponses'
import { QUESTION_COUNT } from '../lib/scoring'
import { StateCard } from './StateCard'

function explain(error: LoadError): { title: string; body: string } {
  switch (error.kind) {
    case 'empty':
      return {
        title: 'No responses yet',
        body: 'The sheet is reachable but has no complete answers. Share the survey with your team and refresh in a few minutes: Google can take up to 5 minutes to update a published sheet.',
      }
    case 'not-csv':
      return {
        title: 'The sheet is not published as CSV',
        body: 'Google returned a web page instead of data. In the sheet, open File → Share → Publish to web, pick the responses tab and CSV, click Publish, and set up the dashboard again with the new link.',
      }
    case 'wrong-columns':
      return {
        title: `Expected ${QUESTION_COUNT} questions, found ${error.found}`,
        body: `The dashboard reads the first ${QUESTION_COUNT} columns with 1–3 answers, in order. Check that the form has all ${QUESTION_COUNT} questions on a 1–3 scale and that the published tab is the one with form responses.`,
      }
    case 'http':
      return {
        title: `Google answered with error ${error.status}`,
        body: 'The sheet may have been unpublished or deleted. Publish it again (File → Share → Publish to web) and set up the dashboard with the new link.',
      }
    case 'network':
      return {
        title: 'Could not reach Google Sheets',
        body: 'Check your connection. If it works, the sheet may have been unpublished: publish it again and set up the dashboard with the new link.',
      }
  }
}

export function LoadErrorCard({ error, onRetry }: { error: LoadError; onRetry: () => void }) {
  const { title, body } = explain(error)
  return (
    <StateCard title={title}>
      <p className="text-muted mb-5">{body}</p>
      <div className="flex flex-wrap gap-3">
        <button className="btn btn-primary" onClick={onRetry}>
          Try again
        </button>
        <a className="btn" href="#">
          Set up again
        </a>
      </div>
    </StateCard>
  )
}
