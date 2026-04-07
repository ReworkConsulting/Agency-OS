'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'

/**
 * Wraps page content with a smooth fade+slide transition on route change.
 * Must be a 'use client' component so it can use usePathname — layout.tsx
 * stays a Server Component and passes children through this boundary.
 *
 * Animation spec (from design-system/agencyos/MASTER.md):
 * - Duration: 0.18s (within the 150–200ms flat design standard)
 * - Easing: easeOut for enter, instant exit prep
 * - Y offset: 6px enter (content arrives from below), -4px exit (departs upward)
 * - mode="wait": exit completes before enter starts — no DOM overlap
 */
export function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
