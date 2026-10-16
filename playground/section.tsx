import type { ReactNode } from 'react'

/** One component's part of the page: a section named by its `h2`. */
export function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: ReactNode
}) {
  return (
    <section aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`}>{title}</h2>
      {children}
    </section>
  )
}
