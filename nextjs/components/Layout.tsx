import Link from 'next/link'
import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import PwaInstallButton from './PwaInstallButton'
import { useScrollReveal } from './nursery/use-scroll-reveal'

type NavKey = 'dashboard' | 'nursery' | 'feedback'

export default function Layout({
  active,
  children,
}: {
  active: NavKey
  children: ReactNode
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  useScrollReveal(rootRef)

  return (
    <div className="nx nx-application" id="top" ref={rootRef}>
      <div className="nx-foliage" aria-hidden="true" />
      <header className="nx-nav">
        <div className="nx-container nx-nav-inner">
          <Link href="/" className="nx-brand" aria-label="Leafora home">
            <span className="nx-brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 4C11 4 5 7 5 13c0 3.3 2.3 5 5 5 6 0 9-6 10-14ZM4 21c2-6 6-9 12-12" />
              </svg>
            </span>
            LEAFORA
          </Link>

          <button
            type="button"
            className="nx-menu-toggle"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="app-primary-nav"
            onClick={() => setMenuOpen(open => !open)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              {menuOpen ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>

          <nav
            id="app-primary-nav"
            className={`nx-nav-links${menuOpen ? ' is-open' : ''}`}
            aria-label="Primary"
            onClick={() => setMenuOpen(false)}
          >
            <Link href="/" aria-current={active === 'dashboard' ? 'page' : undefined}>Home</Link>
            <Link href="/nursery" aria-current={active === 'nursery' ? 'page' : undefined}>Nursery</Link>
            <Link href="/feedback" aria-current={active === 'feedback' ? 'page' : undefined}>Feedback</Link>
            <PwaInstallButton />
          </nav>

          <Link className="nx-pill nx-app-add" href="/nursery#add-plant">
            <span className="nx-btn-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg></span>
            Add plant
          </Link>
        </div>
      </header>

      <main className="nx-container nx-legacy-main">
        <div className="container nx-legacy-content">{children}</div>
      </main>

      <footer className="nx-footer">Leafora · Nursery care and plant readiness</footer>
    </div>
  )
}
