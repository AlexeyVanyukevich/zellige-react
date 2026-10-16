import type { ReactElement } from 'react'
import { Badge } from '../../../src'

export const ROWS: Record<string, ReactElement> = {
  neutral: <Badge>Draft</Badge>,
  accent: <Badge tone="accent">New</Badge>,
  success: <Badge tone="success">Resolved</Badge>,
  warning: <Badge tone="warning">Pending</Badge>,
  danger: <Badge tone="danger">Overdue</Badge>,
}
