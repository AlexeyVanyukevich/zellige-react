import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  type ComponentPropsWithRef,
  type ReactNode,
  type Ref,
} from 'react'
import { cx } from './class'
import { useString } from './provider'

export type DialogPlacement = 'center' | 'side'

export interface DialogProps extends Omit<
  ComponentPropsWithRef<'dialog'>,
  'open' | 'onClose' | 'title' | 'children'
> {
  /** The application's state, and the only thing that opens or closes the dialog. */
  open: boolean
  /** Asked for by Escape, a backdrop press, Close, or a close the browser made on its own. */
  onClose: () => void
  title: ReactNode
  placement?: DialogPlacement
  /** The body. */
  children: ReactNode
  /** The foot, rendered only when given. A submit button here names its form with `form`. */
  footer?: ReactNode
  /** Defaults to the provider's `close`. */
  closeLabel?: string | undefined
}

function assign<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value)
  else if (ref) ref.current = value
}

export function Dialog({
  open,
  onClose,
  title,
  placement = 'center',
  children,
  footer,
  closeLabel,
  className,
  ref,
  ...props
}: DialogProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const close = useString('close', closeLabel)

  // The listeners are added once, so they read the latest props through this.
  const latest = useRef({ open, onClose })
  useLayoutEffect(() => {
    latest.current = { open, onClose }
  })
  // Set while the binding itself calls `close()`, so its own `close` event is not taken for
  // the browser's.
  const closing = useRef(false)

  useEffect(() => {
    const element = dialog.current
    if (!element) return undefined

    // Only a press that began on the backdrop closes it: the tap that opened the dialog, which
    // the browser aims after the dialog appears, did not begin there.
    let pressedBackdrop = false
    const pointerdown = (event: PointerEvent) => {
      pressedBackdrop = event.target === element
    }
    const click = (event: MouseEvent) => {
      if (pressedBackdrop && event.target === element) latest.current.onClose()
      pressedBackdrop = false
    }
    // Escape asks; the application's state answers.
    const cancel = (event: Event) => {
      event.preventDefault()
      latest.current.onClose()
    }
    // A browser may close the dialog with no cancelable `cancel`, as Chrome does after repeated
    // Escape presses. The state must not go on saying open.
    const closed = () => {
      if (closing.current) closing.current = false
      else if (latest.current.open) latest.current.onClose()
    }

    element.addEventListener('pointerdown', pointerdown)
    element.addEventListener('click', click)
    element.addEventListener('cancel', cancel)
    element.addEventListener('close', closed)
    return () => {
      element.removeEventListener('pointerdown', pointerdown)
      element.removeEventListener('click', click)
      element.removeEventListener('cancel', cancel)
      element.removeEventListener('close', closed)
    }
  }, [])

  useEffect(() => {
    const element = dialog.current
    if (!element || !open) return undefined

    if (!element.open) element.showModal()
    // The keyboard starts where the eye is, on the frame, not on Close.
    frame.current?.focus()
    return () => {
      if (!element.open) return
      closing.current = true
      element.close()
    }
  }, [open])

  return (
    <dialog
      {...props}
      ref={(node) => {
        dialog.current = node
        assign(ref, node)
      }}
      className={cx('zl-dialog', placement === 'side' && 'zl-dialog--side', className)}
      aria-labelledby={titleId}
    >
      <div className="zl-dialog__frame" tabIndex={-1} ref={frame}>
        <div className="zl-dialog__head">
          <h2 className="zl-dialog__title" id={titleId}>
            {title}
          </h2>
          <button type="button" className="zl-dialog__close" aria-label={close} onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="zl-dialog__body">{children}</div>
        {footer ? <div className="zl-dialog__foot">{footer}</div> : null}
      </div>
    </dialog>
  )
}
