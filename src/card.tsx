import type { ComponentPropsWithRef } from 'react'
import { cx } from './class'

/** A `div`. A card on another element, an `article` or a link, takes the class `zl-card`. */
export function Card({ className, ...props }: ComponentPropsWithRef<'div'>) {
  return <div {...props} className={cx('zl-card', className)} />
}
