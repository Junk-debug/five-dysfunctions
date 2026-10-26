// Links live in the URL fragment: browsers never send it to the server, so the host never sees a team's sheet.
export interface DashboardParams {
  csv: string
  form?: string
}

export function readHash(hash: string): DashboardParams | null {
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  const csv = params.get('csv')
  if (!csv) return null
  return { csv, form: params.get('form') ?? undefined }
}

export function toHash({ csv, form }: DashboardParams): string {
  const params = new URLSearchParams({ csv })
  if (form) params.set('form', form)
  return '#' + params.toString()
}

export function dashboardLink(base: string, params: DashboardParams): string {
  return base.replace(/#.*$/, '') + toHash(params)
}
