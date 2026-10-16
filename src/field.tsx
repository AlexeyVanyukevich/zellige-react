import {
  createContext,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useState,
  type AriaAttributes,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react'
import { cx } from './class'

interface FieldWiring {
  id: string
  describedBy: string | undefined
  invalid: boolean
  /** A control with an `id` of its own reports it, so the label still points at the control. */
  claim: (id: string | undefined) => void
}

const FieldContext = createContext<FieldWiring | null>(null)

export interface FieldProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  label: ReactNode
  hint?: ReactNode
  /** Makes the control invalid and describes it with this text. */
  error?: ReactNode
  /** One control: `Input`, `Select` or `Textarea`. */
  children: ReactNode
}

export function Field({ label, hint, error, className, children, ...props }: FieldProps) {
  const generated = useId()
  const [claimed, claim] = useState<string>()
  const id = claimed ?? generated
  const hintId = hint ? `${generated}-hint` : undefined
  const errorId = error ? `${generated}-error` : undefined
  const describedBy = cx(hintId, errorId) || undefined
  const invalid = Boolean(error)
  const wiring = useMemo(() => ({ id, describedBy, invalid, claim }), [id, describedBy, invalid])

  return (
    <div {...props} className={cx('zl-field', className)}>
      <label className="zl-field__label" htmlFor={id}>
        {label}
      </label>
      <FieldContext value={wiring}>{children}</FieldContext>
      {hint ? (
        <p className="zl-field__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="zl-field__error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  )
}

interface ControlAttributes {
  id?: string | undefined
  'aria-describedby'?: string | undefined
  'aria-invalid'?: AriaAttributes['aria-invalid']
}

/** The field's id, description and validity for its control; any the control sets wins. */
function useFieldControl(own: ControlAttributes): ControlAttributes {
  const field = useContext(FieldContext)
  const claim = field?.claim
  useLayoutEffect(() => {
    if (!claim || own.id === undefined) return undefined
    claim(own.id)
    return () => claim(undefined)
  }, [claim, own.id])

  return {
    id: own.id ?? field?.id,
    'aria-describedby': own['aria-describedby'] ?? field?.describedBy,
    'aria-invalid': own['aria-invalid'] ?? (field?.invalid ? true : undefined),
  }
}

export function Input({ className, ...props }: ComponentPropsWithRef<'input'>) {
  return <input {...props} {...useFieldControl(props)} className={cx('zl-input', className)} />
}

export function Select({ className, ...props }: ComponentPropsWithRef<'select'>) {
  return <select {...props} {...useFieldControl(props)} className={cx('zl-select', className)} />
}

export function Textarea({ className, ...props }: ComponentPropsWithRef<'textarea'>) {
  return (
    <textarea {...props} {...useFieldControl(props)} className={cx('zl-textarea', className)} />
  )
}
