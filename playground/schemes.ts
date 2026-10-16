export type Scheme = 'light' | 'dark'

// The playground's switcher and every scan read this list. Themes are core's to test: the
// binding's markup is core's, and a theme changes only CSS.
export const SCHEMES: readonly Scheme[] = ['light', 'dark']

export function schemeFrom(search: string): Scheme {
  const asked = new URLSearchParams(search).get('scheme')
  return SCHEMES.find((scheme) => scheme === asked) ?? 'light'
}
