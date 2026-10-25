'use client'

import { RefObject, useEffect } from 'react'

export const REVEAL_SELECTOR = [
  '.nx-stats',
  '.nx-shortcut',
  '.nx-section-head',
  '.nx-plant',
  '.nx-species',
  '.nx-card',
  '.nx-day',
  '.page-head',
  '.card',
  '.stat',
  '.table-wrap',
  '.tabs',
].join(',')

const STAGGER_MS = 70
const MAX_STAGGER_STEPS = 6
const REVEAL_DURATION_MS = 850

// State lives in data attributes (not className) so React re-renders never wipe it.
export function useScrollReveal(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return

    root.dataset.motion = 'on'

    const reveal = (el: HTMLElement) => {
      el.dataset.reveal = 'shown'
      observer.unobserve(el)
      const delay = parseFloat(el.style.getPropertyValue('--nx-delay')) || 0
      window.setTimeout(() => el.style.setProperty('--nx-delay', '0ms'), delay + REVEAL_DURATION_MS)
    }

    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement
        if (entry.isIntersecting || entry.boundingClientRect.bottom < 0) reveal(el)
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })

    const observed = new WeakSet<Element>()
    const register = () => {
      root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR).forEach(el => {
        if (observed.has(el) || el.dataset.reveal === 'shown') return
        observed.add(el)
        el.dataset.reveal = 'pending'
        const siblings = el.parentElement
          ? Array.from(el.parentElement.children).filter(child => child.matches(REVEAL_SELECTOR))
          : [el]
        const index = Math.min(Math.max(siblings.indexOf(el), 0), MAX_STAGGER_STEPS)
        el.style.setProperty('--nx-delay', `${index * STAGGER_MS}ms`)
        observer.observe(el)
      })
    }

    register()
    const mutations = new MutationObserver(register)
    mutations.observe(root, { childList: true, subtree: true })

    return () => {
      mutations.disconnect()
      observer.disconnect()
      delete root.dataset.motion
    }
  }, [rootRef])
}
