import type { ComponentPropsWithRef, ReactNode } from 'react'
import { cx } from './class'

export type NoticeTone = 'info' | 'danger'

export interface NoticeProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  /** `info` is a polite `status`, `danger` an `alert`. */
  tone?: NoticeTone
  title?: ReactNode
}

/**
 * A live region: it announces what is written into it, not reliably what it was mounted with.
 * To announce an outcome, keep the Notice mounted and change its title or children.
 */
export function Notice({ tone = 'info', title, children, className, ...props }: NoticeProps) {
  return (
    <div
      {...props}
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cx('zl-notice', tone === 'danger' && 'zl-notice--danger', className)}
    >
      {title ? <p className="zl-notice__title">{title}</p> : null}
      {children ? <div className="zl-notice__body">{children}</div> : null}
    </div>
  )
}
