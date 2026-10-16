import type { ComponentPropsWithRef } from 'react'
import { cx } from './class'

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger'

export interface BadgeProps extends ComponentPropsWithRef<'span'> {
  /** The tint only; the badge's text carries the meaning. */
  tone?: BadgeTone
}

export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      {...props}
      className={cx('zl-badge', tone !== 'neutral' && `zl-badge--${tone}`, className)}
    />
  )
}
