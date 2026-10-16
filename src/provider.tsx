import { createContext, useContext, useMemo, type ReactNode } from 'react'

/** The kit's only own text. Everything else a component shows comes from its props. */
export interface UiStrings {
  close: string
  retry: string
  loading: string
}

const DEFAULTS: UiStrings = { close: 'Close', retry: 'Retry', loading: 'Loading…' }

const Strings = createContext<UiStrings>(DEFAULTS)

/** Sets the kit's strings for everything inside; a nested provider overrides only what it names. */
export function UiProvider({
  strings,
  children,
}: {
  strings: Partial<UiStrings>
  children: ReactNode
}) {
  const outer = useContext(Strings)
  const value = useMemo(() => ({ ...outer, ...strings }), [outer, strings])
  return <Strings value={value}>{children}</Strings>
}

/** One of the kit's strings: a component's own prop, else the nearest provider's, else the default. */
export function useString(name: keyof UiStrings, own: string | undefined): string {
  const strings = useContext(Strings)
  return own ?? strings[name]
}
