import { useRef, type ComponentPropsWithRef, type Key, type ReactNode } from 'react'
import { useTab, useTabList, useTabPanel } from 'react-aria'
import { Item, useTabListState, type Node, type TabListState } from 'react-stately'
import { cx } from './class'

export interface TabItem {
  id: string
  label: ReactNode
  panel: ReactNode
}

export interface TabsProps extends Omit<ComponentPropsWithRef<'div'>, 'onChange' | 'children'> {
  /** The tab list's name. */
  label: string
  items: readonly TabItem[]
  /** The selected tab's `id`. Given, the Tabs is controlled. */
  value?: string | undefined
  /** The tab selected at first when there is no `value`; else the first item. */
  defaultValue?: string | undefined
  onChange?: ((id: string) => void) | undefined
}

// Behaviour is React Aria's: the keyboard model, roving tabindex and ARIA wiring come from its
// hooks, spread onto core's markup. This file only maps the props.
export function Tabs({
  label,
  items,
  value,
  defaultValue,
  onChange,
  className,
  ...props
}: TabsProps) {
  const first = defaultValue ?? items[0]?.id
  const aria = {
    'aria-label': label,
    items,
    children: (item: TabItem) => (
      <Item key={item.id} textValue={typeof item.label === 'string' ? item.label : item.id}>
        {item.label}
      </Item>
    ),
    ...(value === undefined ? {} : { selectedKey: value }),
    ...(first === undefined ? {} : { defaultSelectedKey: first }),
    onSelectionChange: (key: Key | null) => {
      if (key !== null) onChange?.(String(key))
    },
  }
  const state = useTabListState<TabItem>(aria)
  const list = useRef<HTMLDivElement>(null)
  const { tabListProps } = useTabList(aria, state, list)

  return (
    <div {...props} className={cx('zl-tabs', className)}>
      <div {...tabListProps} ref={list} className="zl-tabs__list">
        {Array.from(state.collection, (item) => (
          <Tab key={item.key} item={item} state={state} />
        ))}
      </div>
      {/* Keyed by the tab, so a newly selected panel is a new element with its own focusability. */}
      <TabPanel
        key={state.selectedKey}
        state={state}
        panel={items.find((item) => item.id === state.selectedKey)?.panel}
      />
    </div>
  )
}

function Tab({ item, state }: { item: Node<TabItem>; state: TabListState<TabItem> }) {
  const ref = useRef<HTMLButtonElement>(null)
  const { tabProps } = useTab({ key: item.key }, state, ref)
  return (
    <button type="button" {...tabProps} ref={ref} className="zl-tabs__tab">
      {item.rendered}
    </button>
  )
}

function TabPanel({ state, panel }: { state: TabListState<TabItem>; panel: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const { tabPanelProps } = useTabPanel({}, state, ref)
  return (
    <div {...tabPanelProps} ref={ref} className="zl-tabs__panel">
      {panel}
    </div>
  )
}
