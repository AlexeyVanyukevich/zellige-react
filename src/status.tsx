import type { ComponentPropsWithRef, ReactNode } from 'react'
import { Button } from './button'
import { cx } from './class'
import { useString } from './provider'

type DivProps = Omit<ComponentPropsWithRef<'div'>, 'title'>

export interface EmptyProps extends DivProps {
  title: ReactNode
}

/** Nothing to show yet. Read where it stands; it announces nothing. */
export function Empty({ title, children, className, ...props }: EmptyProps) {
  return (
    <div {...props} className={cx('zl-empty', className)}>
      <p className="zl-empty__title">{title}</p>
      {children ? <div className="zl-empty__body">{children}</div> : null}
    </div>
  )
}

export interface LoadingProps extends Omit<DivProps, 'children'> {
  /** Defaults to the provider's `loading`. */
  label?: string | undefined
}

export function Loading({ label, className, ...props }: LoadingProps) {
  const text = useString('loading', label)
  return (
    // Core's contract fixes a `div` with `role="status"`; a change of element starts in core
    // (docs/backlog.md).
    // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- the markup is core's
    <div {...props} role="status" className={cx('zl-loading', className)}>
      <span className="zl-loading__spinner" aria-hidden="true" />
      <span className="zl-loading__text">{text}</span>
    </div>
  )
}

export interface TroubleProps extends Omit<DivProps, 'children'> {
  title: ReactNode
  detail?: ReactNode
  /** Renders the retry button. The application moves focus when its retry removes the button. */
  onRetry?: (() => void) | undefined
  /** Defaults to the provider's `retry`. */
  retryLabel?: string | undefined
}

export function Trouble({ title, detail, onRetry, retryLabel, className, ...props }: TroubleProps) {
  const retry = useString('retry', retryLabel)
  return (
    <div {...props} role="alert" className={cx('zl-trouble', className)}>
      <p className="zl-trouble__title">{title}</p>
      {detail ? <p className="zl-trouble__detail">{detail}</p> : null}
      {onRetry ? <Button onClick={onRetry}>{retry}</Button> : null}
    </div>
  )
}
