# Five Dysfunctions of a Team

A free results dashboard for a 15-question team assessment based on the model from Patrick Lencioni's *The Five Dysfunctions of a Team*.

**Live:** https://junk-debug.github.io/five-dysfunctions/

Your team answers a Google Form. The dashboard reads the answers from your own published Google Sheet and shows:

- team health and the weakest area
- a radar of the five dysfunctions, with each person's line when answers are named
- where people agree and where opinions split
- answers to every question, per person

## How it works

There is no backend and no database. The site is static and runs entirely in the browser.

1. A facilitator creates the Google Form, links it to a sheet and publishes the responses tab as CSV.
2. The setup page turns that link into a dashboard link like `…/five-dysfunctions/#csv=<published-csv-url>&form=<survey-url>`.
3. Opening the dashboard fetches the CSV straight from Google.

The sheet link lives in the URL fragment (after `#`), which browsers never send to the server. GitHub Pages never sees which sheets are used.

## Named or anonymous

The form may have an optional short-answer question whose title contains "name" (for example *Your name*).

- **With names**, the dashboard shows each person's scores, so the team can talk through why people see things differently.
- **Without names**, everyone still gets a profile, labelled *Participant 1, 2, …* in a shuffled order (not the order people answered), and results appear only after at least 3 responses.

Columns with email addresses are always ignored. Still, keep *Collect email addresses* off: a published sheet is readable by anyone with its link.

## Form format

- First column: the Google Forms timestamp.
- 15 questions, each a linear scale from 1 to 3 (1 = rarely, 2 = sometimes, 3 = usually), in a fixed order (see the table below).
- Optional name column anywhere.

The dashboard reads question text from the sheet's header row and groups questions by number:

| Dysfunction | Questions |
| --- | --- |
| Absence of Trust | 4, 6, 12 |
| Fear of Conflict | 1, 7, 10 |
| Lack of Commitment | 3, 8, 13 |
| Avoidance of Accountability | 2, 11, 14 |
| Inattention to Results | 5, 9, 15 |

Each dysfunction scores 3–9: 8–9 healthy, 6–7 at risk, 3–5 needs attention.

## Development

```bash
pnpm install
pnpm dev
pnpm test
```

Pushing to `main` builds and deploys to GitHub Pages (`.github/workflows/deploy.yml`).

The template form is built by `template/create-form.gs` (run it once at script.google.com → `createForm`). Put the `…/copy` link it logs into `TEMPLATE_FORM_COPY_URL` in `src/config.ts`.

---

Based on the model from *The Five Dysfunctions of a Team* by Patrick Lencioni. Not affiliated with the author or The Table Group.
