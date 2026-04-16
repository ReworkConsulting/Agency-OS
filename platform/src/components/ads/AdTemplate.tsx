'use client'

import React from 'react'

export type VisualStyle = 'dark' | 'light' | 'gradient' | 'brand'

export interface AdTemplateProps {
  headline: string
  hook: string
  cta: string
  clientName?: string
  visualStyle?: VisualStyle
  brandColor?: string
  /** AI-generated background photo URL — when set, photo is background with overlay */
  backgroundImageUrl?: string
  /** Pass a ref to this element for html-to-image capture */
  innerRef?: React.RefObject<HTMLDivElement | null>
}

// Text-only styles (no background image)
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
    bg: '#1a1a2e',
    headline: '#ffffff',
    hook: 'rgba(255,255,255,0.75)',
    ctaBg: '#ffffff',
    ctaText: '#1a1a2e',
    client: 'rgba(255,255,255,0.45)',
    divider: 'rgba(255,255,255,0.12)',
    accentLine: '#ffffff',
  },
  gradient: {
    bg: '#0f0f0f',
    headline: '#ffffff',
    hook: '#b0b0b0',
    ctaBg: '#ffffff',
    ctaText: '#0f0f0f',
    client: '#555555',
    divider: '#2a2a2a',
    accentLine: '#ffffff',
  },
}

// When a background photo is present, always use these overlay colors
const PHOTO_COLORS = {
  headline: '#ffffff',
  hook: 'rgba(255,255,255,0.90)',
  ctaBg: '#ffffff',
  ctaText: '#0c0c0c',
  client: 'rgba(255,255,255,0.60)',
  divider: 'rgba(255,255,255,0.20)',
  accentLine: '#ffffff',
}

export function AdTemplate({
  headline,
  hook,
  cta,
  clientName,
  visualStyle = 'dark',
  brandColor,
  backgroundImageUrl,
  innerRef,
}: AdTemplateProps) {
  const hasPhoto = !!backgroundImageUrl
  const style = STYLES[visualStyle]

  const colors = hasPhoto ? PHOTO_COLORS : style
  const ctaTextColor = !hasPhoto && visualStyle === 'brand' && brandColor ? brandColor : colors.ctaText
  const bg = !hasPhoto
    ? (visualStyle === 'brand' && brandColor ? brandColor : style.bg)
    : 'transparent'

  const BASE = 1080

  return (
    <div
      ref={innerRef}
      style={{
        width: `${BASE}px`,
        height: `${BASE}px`,
        background: bg,
        backgroundImage: visualStyle === 'gradient' && !hasPhoto
          ? 'linear-gradient(135deg, #0f0f0f 0%, #1c1c1c 60%, #111111 100%)'
          : undefined,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        boxSizing: 'border-box',
      }}
    >
      {/* Background photo */}
      {hasPhoto && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={backgroundImageUrl}
          alt=""
          crossOrigin="anonymous"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
      )}

      {/* Gradient overlay — bottom-heavy for text readability */}
      {hasPhoto && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.12) 100%)',
          }}
        />
      )}

      {/* Subtle radial highlight for text-only dark/gradient styles */}
      {!hasPhoto && (visualStyle === 'dark' || visualStyle === 'gradient') && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(ellipse at 20% 20%, rgba(255,255,255,0.025) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Content — sits above photo/overlay */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '88px',
          boxSizing: 'border-box',
        }}
      >
        {/* Accent line — top left */}
        <div style={{
          width: '48px',
          height: '4px',
          borderRadius: '2px',
          background: colors.accentLine,
          opacity: 0.6,
          marginBottom: '0px',
          flexShrink: 0,
        }} />

        {/* Main copy — vertically centered in remaining space */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '32px',
          paddingTop: '16px',
        }}>
          {/* Headline */}
          <p style={{
            margin: 0,
            fontSize: '96px',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            color: colors.headline,
            wordBreak: 'break-word',
          }}>
            {headline}
          </p>

          {/* Hook */}
          <p style={{
            margin: 0,
            fontSize: '34px',
            fontWeight: 400,
            lineHeight: 1.5,
            color: colors.hook,
            maxWidth: '90%',
            wordBreak: 'break-word',
          }}>
            {hook}
          </p>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: `1px solid ${colors.divider}`,
          paddingTop: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexShrink: 0,
        }}>
          <div style={{
            background: colors.ctaBg,
            color: ctaTextColor,
            fontSize: '26px',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            padding: '20px 40px',
            borderRadius: '12px',
            whiteSpace: 'nowrap',
            lineHeight: 1,
          }}>
            {cta} →
          </div>

          {clientName && (
            <p style={{
              margin: 0,
              fontSize: '22px',
              fontWeight: 500,
              color: colors.client,
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
    </div>
  )
}
