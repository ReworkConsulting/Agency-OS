'use client'

import React from 'react'

export type VisualStyle = 'dark' | 'light' | 'brand' | 'gradient'

export interface AdTemplateProps {
  headline: string
  hook: string
  cta: string
  clientName?: string
  visualStyle?: VisualStyle
  brandColor?: string
  /** Pass a ref to this element for html-to-image capture */
  innerRef?: React.RefObject<HTMLDivElement | null>
  /** Scale factor for display (1 = full 1080px, 0.3 = 324px display) */
  scale?: number
}

const STYLES: Record<VisualStyle, {
  bg: string
  headline: string
  hook: string
  ctaBg: string
  ctaText: string
  client: string
  divider: string
  accentLine: string
}> = {
  dark: {
    bg: '#0c0c0c',
    headline: '#ffffff',
    hook: '#a3a3a3',
    ctaBg: '#ffffff',
    ctaText: '#0c0c0c',
    client: '#555555',
    divider: '#222222',
    accentLine: '#ffffff',
  },
  light: {
    bg: '#f5f5f3',
    headline: '#0c0c0c',
    hook: '#555555',
    ctaBg: '#0c0c0c',
    ctaText: '#f5f5f3',
    client: '#999999',
    divider: '#e0e0de',
    accentLine: '#0c0c0c',
  },
  brand: {
    bg: '#1a1a2e',           // overridden by brandColor prop
    headline: '#ffffff',
    hook: 'rgba(255,255,255,0.75)',
    ctaBg: '#ffffff',
    ctaText: '#1a1a2e',     // overridden by brandColor prop
    client: 'rgba(255,255,255,0.45)',
    divider: 'rgba(255,255,255,0.12)',
    accentLine: '#ffffff',
  },
  gradient: {
    bg: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)',
    headline: '#ffffff',
    hook: '#b0b0b0',
    ctaBg: '#ffffff',
    ctaText: '#0f0f0f',
    client: '#555555',
    divider: '#2a2a2a',
    accentLine: '#ffffff',
  },
}

export function AdTemplate({
  headline,
  hook,
  cta,
  clientName,
  visualStyle = 'dark',
  brandColor,
  innerRef,
  scale = 1,
}: AdTemplateProps) {
  const style = STYLES[visualStyle]

  // Override brand colors when visual_style === 'brand' and brandColor provided
  const bg = visualStyle === 'brand' && brandColor
    ? brandColor
    : visualStyle === 'gradient'
    ? undefined // applied via backgroundImage
    : style.bg

  const ctaTextColor = visualStyle === 'brand' && brandColor ? brandColor : style.ctaText

  // Base size — the template is designed at 1080px, scale down for display
  const BASE = 1080
  const SIZE = BASE * scale

  // All sizes are relative to BASE so they scale correctly
  const px = (n: number) => `${n * scale}px`

  return (
    <div
      ref={innerRef}
      style={{
        width: `${SIZE}px`,
        height: `${SIZE}px`,
        background: visualStyle === 'gradient' ? undefined : bg,
        backgroundImage: visualStyle === 'gradient' ? 'linear-gradient(135deg, #0f0f0f 0%, #1c1c1c 60%, #111111 100%)' : undefined,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        boxSizing: 'border-box',
        padding: px(88),
      }}
    >
      {/* Subtle texture overlay for dark/gradient */}
      {(visualStyle === 'dark' || visualStyle === 'gradient') && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(ellipse at 20% 20%, rgba(255,255,255,0.025) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Accent line — top left */}
      <div style={{
        position: 'absolute',
        top: px(88),
        left: px(88),
        width: px(48),
        height: px(4),
        borderRadius: px(2),
        background: style.accentLine,
        opacity: 0.6,
      }} />

      {/* Main content — vertically centered */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: px(32),
        marginTop: px(16),
      }}>
        {/* Headline — the hero */}
        <div>
          <p style={{
            margin: 0,
            fontSize: px(96),
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            color: style.headline,
            wordBreak: 'break-word',
            maxWidth: '100%',
          }}>
            {headline}
          </p>
        </div>

        {/* Hook — secondary */}
        <p style={{
          margin: 0,
          fontSize: px(34),
          fontWeight: 400,
          lineHeight: 1.5,
          color: style.hook,
          maxWidth: '90%',
          wordBreak: 'break-word',
        }}>
          {hook}
        </p>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: `${px(1)} solid ${style.divider}`,
        paddingTop: px(40),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: px(16),
      }}>
        {/* CTA Button */}
        <div style={{
          background: style.ctaBg,
          color: ctaTextColor,
          fontSize: px(26),
          fontWeight: 700,
          letterSpacing: '-0.01em',
          padding: `${px(20)} ${px(40)}`,
          borderRadius: px(12),
          whiteSpace: 'nowrap',
          lineHeight: 1,
        }}>
          {cta} →
        </div>

        {/* Client name */}
        {clientName && (
          <p style={{
            margin: 0,
            fontSize: px(22),
            fontWeight: 500,
            color: style.client,
            textAlign: 'right',
            letterSpacing: '0.02em',
            maxWidth: '40%',
            wordBreak: 'break-word',
          }}>
            {clientName}
          </p>
        )}
      </div>
    </div>
  )
}
