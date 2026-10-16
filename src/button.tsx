import type { ComponentPropsWithRef, MouseEvent } from 'react'
import { buttonClass, type ButtonVariant } from './class'

export interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variant?: ButtonVariant
  /** Work is under way: `aria-busy`, still focusable, and a click does nothing. */
  busy?: boolean
}

export function Button({
  variant,
  busy = false,
  type = 'button',
  className,
  onClick,
  ...props
}: ButtonProps) {
  // A busy submit button must not submit again, so the click's default goes too.
  const click = (event: MouseEvent<HTMLButtonElement>) => {
    if (busy) event.preventDefault()
    else onClick?.(event)
  }
  return (
    <button
      {...props}
      type={type}
      className={buttonClass(variant, className)}
      aria-busy={busy || undefined}
      onClick={click}
    />
  )
}
