import type { ReactNode } from 'react'

export function StateCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-surface border-line shadow-card mx-auto my-10 max-w-[760px] rounded-2xl border p-6 sm:p-9">
      <h2 className="font-display mb-2 text-[22px] font-bold">{title}</h2>
      {children}
    </div>
  )
}
