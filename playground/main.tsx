/// <reference types="vite/client" />
import '@zellige/core/tokens.css'
import '@zellige/core/zl.css'
import './playground.css'
import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { SCHEMES, schemeFrom, type Scheme } from './schemes'
import { Buttons } from './sections/buttons'

function Playground() {
  const [scheme, setScheme] = useState<Scheme>(() => schemeFrom(location.search))

  useEffect(() => {
    document.documentElement.style.colorScheme = scheme
    const url = new URL(location.href)
    url.searchParams.set('scheme', scheme)
    history.replaceState(null, '', url)
  }, [scheme])

  return (
    <>
      <header className="playground__head">
        <h1 className="playground__title">zellige react</h1>
        <label className="playground__scheme" htmlFor="scheme">
          Scheme
        </label>
        <select
          id="scheme"
          value={scheme}
          onChange={(event) => setScheme(schemeFrom(`?scheme=${event.target.value}`))}
        >
          {SCHEMES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </header>
      <main className="playground__main">
        <Buttons />
      </main>
    </>
  )
}

const root = document.getElementById('root')
if (!root) throw new Error('The playground page has no #root')
createRoot(root).render(
  <StrictMode>
    <Playground />
  </StrictMode>,
)
