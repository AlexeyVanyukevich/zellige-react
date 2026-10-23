import {
  createContext,
  useContext,
  type ComponentPropsWithRef,
  type ReactNode,
  type Ref,
} from 'react'
import { mergeProps, useObjectRef, useRadio, useRadioGroup } from 'react-aria'
import { useRadioGroupState, type RadioGroupState } from 'react-stately'
import { cx } from './class'

const RadioGroupContext = createContext<RadioGroupState | null>(null)

export interface RadioGroupProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'onChange' | 'defaultValue' | 'children'
> {
  label: ReactNode
  description?: ReactNode
  /** Makes the group invalid and describes every radio with this text. */
  error?: ReactNode
  /** The checked radio's value; null checks none. Given, the group is controlled. */
  value?: string | null | undefined
  defaultValue?: string | undefined
  onChange?: ((value: string) => void) | undefined
  /** Generated when absent. */
  name?: string | undefined
  disabled?: boolean | undefined
  /** `Radio`s. */
  children: ReactNode
}

// Behaviour is React Aria's: the single tab stop, the arrow keys and the ARIA wiring come from
// its hooks, spread onto core's markup. This file maps the props and places the parts.
export function RadioGroup({
  label,
  description,
  error,
  value,
  defaultValue,
  onChange,
  name,
  disabled,
  className,
  children,
  ...props
}: RadioGroupProps) {
  const aria = {
    label,
    description,
    errorMessage: error,
    isInvalid: Boolean(error),
    // The browser's own validation never runs; the application decides what is an error.
    validationBehavior: 'aria' as const,
    isDisabled: disabled === true,
    ...(props.id === undefined ? {} : { id: props.id }),
    ...(value === undefined ? {} : { value }),
    ...(defaultValue === undefined ? {} : { defaultValue }),
    ...(name === undefined ? {} : { name }),
    ...(onChange === undefined ? {} : { onChange }),
  }
  const state = useRadioGroupState(aria)
  const { radioGroupProps, labelProps, descriptionProps, errorMessageProps } = useRadioGroup(
    aria,
    state,
  )

  return (
    <div {...mergeProps(props, radioGroupProps)} className={cx('zl-radio-group', className)}>
      <span {...labelProps} className="zl-radio-group__label">
        {label}
      </span>
      <RadioGroupContext value={state}>{children}</RadioGroupContext>
      {description ? (
        <p {...descriptionProps} className="zl-radio-group__description">
          {description}
        </p>
      ) : null}
      {error ? (
        <p {...errorMessageProps} className="zl-radio-group__error">
          {error}
        </p>
      ) : null}
    </div>
  )
}

/** The group a radio reads its state from; a radio without one has nothing to check. */
function useGroupState(): RadioGroupState {
  const state = useContext(RadioGroupContext)
  if (state === null) throw new Error('Radio must be inside a RadioGroup')
  return state
}

/**
 * The input's props, not the root's: the input is what an application holds — to focus it after
 * a failed submit — as Field's controls are. The group owns the rest of a radio's state.
 */
export interface RadioProps extends Omit<
  ComponentPropsWithRef<'input'>,
  'type' | 'name' | 'value' | 'checked' | 'defaultChecked' | 'onChange' | 'children'
> {
  value: string
  description?: ReactNode
  /** The label: the radio's whole accessible name. */
  children: ReactNode
}

export function Radio({ value, description, children, className, ref, ...props }: RadioProps) {
  const state = useGroupState()
  const input = useObjectRef(ref)
  const { inputProps, labelProps, descriptionProps } = useRadio(
    { value, children, ...(props.disabled === undefined ? {} : { isDisabled: props.disabled }) },
    state,
    input,
  )
  // React Aria names the description in the input's `aria-describedby` only once this ref has
  // seen it rendered. The ref is typed for any element, and a `p` is one.
  const { ref: descriptionRef, ...describe } = descriptionProps
  const describeRef = descriptionRef as Ref<HTMLParagraphElement>

  // The description sits beside the label, not inside it, so the name is the label alone.
  return (
    <div className="zl-radio">
      <label {...labelProps} className="zl-radio__label">
        <input
          {...mergeProps(inputProps, props)}
          ref={input}
          className={cx('zl-radio__input', className)}
        />
        {children}
      </label>
      {description ? (
        <p {...describe} ref={describeRef} className="zl-radio__description">
          {description}
        </p>
      ) : null}
    </div>
  )
}
