export type ButtonVariant = 'neutral' | 'primary' | 'quiet' | 'danger'

/** Joins class names, leaving out the empty and the switched-off ones. */
export function cx(...parts: readonly (string | false | null | undefined)[]): string {
  return parts
    .map((part) => (part ? part.trim() : ''))
    .filter(Boolean)
    .join(' ')
}

/** Core's button classes, for an element that is not a `<button>`: a link styled as one. */
export function buttonClass(variant: ButtonVariant = 'neutral', extra?: string): string {
  return cx('zl-button', variant !== 'neutral' && `zl-button--${variant}`, extra)
}
