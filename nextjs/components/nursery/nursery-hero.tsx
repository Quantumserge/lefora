import { useState } from 'react'

type Props = { plantCount: number; speciesCount: number; rodLength: number }

export function NurseryNav() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="nx-nav">
      <div className="nx-container nx-nav-inner">
        <a className="nx-brand" href="#top" aria-label="Leafora home">
          <span className="nx-brand-mark" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 4C11 4 5 7 5 13c0 3.3 2.3 5 5 5 6 0 9-6 10-14ZM4 21c2-6 6-9 12-12" /></svg>
          </span>
          LEAFORA
        </a>
        <button
          type="button"
          className="nx-menu-toggle"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="nursery-primary-nav"
          onClick={() => setMenuOpen(open => !open)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            {menuOpen ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
        <nav id="nursery-primary-nav" className={`nx-nav-links${menuOpen ? ' is-open' : ''}`} aria-label="Primary" onClick={() => setMenuOpen(false)}>
          <a href="/">Home</a>
          <a href="#inventory" aria-current="page">Nursery</a>
          <a href="#measure">Measure</a>
          <a href="#weather">Weather</a>
          <a href="#library">Library</a>
          <a href="#reference-data">Growth data</a>
          <a href="/feedback">Feedback</a>
        </nav>
        <a className="nx-pill" href="#add-plant"><PlusIcon /> Add plant</a>
      </div>
    </header>
  )
}

function PlusIcon() {
  return (
    <span className="nx-btn-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
    </span>
  )
}

export function NurseryHero({ plantCount, speciesCount, rodLength }: Props) {
  return (
    <section aria-labelledby="nursery-title">
      <div className="nx-hero">
        <div>
          <p className="nx-eyebrow">Bring nature home</p>
          <h1 id="nursery-title">Bring greenery<br /><em>to life.</em></h1>
          <p className="nx-hero-sub">Track measurements, check the forecast, and see where your plants need a closer look.</p>
          <div className="nx-hero-actions">
            <a className="nx-btn" href="#add-plant">Add a plant <PlusIcon /></a>
            <a className="nx-btn nx-ghost" href="#inventory">View collection</a>
          </div>
        </div>
        <div className="nx-hero-art">
          <img src="/nursery/hero-dome.png" alt="A potted plant under a glass dome on a green pedestal" />
        </div>
      </div>
      <dl className="nx-stats">
        <div className="nx-stat"><dt className="sr-only">Plants</dt><dd style={{ margin: 0 }}><strong>{plantCount}</strong><span>plant{plantCount === 1 ? '' : 's'} in nursery</span></dd></div>
        <div className="nx-stat"><dt className="sr-only">Species</dt><dd style={{ margin: 0 }}><strong>{speciesCount}</strong><span>species monitored</span></dd></div>
        <div className="nx-stat"><dt className="sr-only">Reference rod</dt><dd style={{ margin: 0 }}><strong>{rodLength}<small style={{ fontSize: '0.5em' }}> cm</small></strong><span>reference rod</span></dd></div>
      </dl>
    </section>
  )
}

const shortcuts = [
  { href: '#inventory', label: 'My plants', icon: <path d="M12 21c0-5.5 3.6-9.3 9-10.5C19.8 16.5 16.4 19.7 12 21Zm0 0C12 15.5 8.4 11.7 3 10.5 4.2 16.5 7.6 19.7 12 21Zm0 0v-5" /> },
  { href: '#add-plant', label: 'Add plant', icon: <path d="M12 5v14M5 12h14" /> },
  { href: '#measure', label: 'Measure', icon: <><path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-9Z" /><circle cx="12" cy="13.4" r="2.2" /></> },
  { href: '#weather', label: 'Weather', icon: <path d="M7.5 18.5h9a4 4 0 0 0 .4-8A5.5 5.5 0 0 0 6.2 9 4.8 4.8 0 0 0 7.5 18.5Z" /> },
]

export function NurseryShortcuts() {
  return (
    <nav className="nx-shortcuts" aria-label="Nursery shortcuts">
      {shortcuts.map(s => (
        <a key={s.href} className="nx-shortcut" href={s.href}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{s.icon}</svg>
          <span>{s.label}</span>
        </a>
      ))}
    </nav>
  )
}
