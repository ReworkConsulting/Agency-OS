/**
 * ICP PDF template — renders a branded ICP document as a PDF using @react-pdf/renderer.
 * Runs server-side only (Node.js). Never import this in a Client Component.
 */
import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from '@react-pdf/renderer'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '')
  if (clean.length !== 6) return null
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  }
}

/** Converts a hex color to a slightly transparent rgba string for background fills. */
function withAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`
}

/** Parses ICP markdown into sections so we can render them as styled blocks. */
function parseMarkdownSections(
  content: string
): Array<{ type: 'h1' | 'h2' | 'h3' | 'p' | 'li' | 'hr' | 'bold'; text: string }> {
  const lines = content.split('\n')
  const nodes: Array<{ type: 'h1' | 'h2' | 'h3' | 'p' | 'li' | 'hr' | 'bold'; text: string }> = []

  for (const raw of lines) {
    const line = raw.trimEnd()
    if (line.startsWith('### ')) {
      nodes.push({ type: 'h3', text: line.slice(4) })
    } else if (line.startsWith('## ')) {
      nodes.push({ type: 'h2', text: line.slice(3) })
    } else if (line.startsWith('# ')) {
      nodes.push({ type: 'h1', text: line.slice(2) })
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      nodes.push({ type: 'li', text: line.slice(2) })
    } else if (line.match(/^[-*]{3,}$/) || line.match(/^_{3,}$/)) {
      nodes.push({ type: 'hr', text: '' })
    } else if (line.trim() === '') {
      // skip blank lines
    } else {
      nodes.push({ type: 'p', text: line })
    }
  }

  return nodes
}

/** Strips basic markdown bold/italic markers for plain text rendering. */
function stripMarkdown(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1').replace(/`(.+?)`/g, '$1')
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ICPPdfProps {
  clientName: string
  logoUrl?: string | null
  brandPrimaryColor?: string | null
  brandSecondaryColor?: string | null
  icpContent: string
  version: number
  confidenceLevel?: string | null
  createdAt: string
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

function buildStyles(primary: string, secondary: string) {
  return StyleSheet.create({
    page: {
      fontFamily: 'Helvetica',
      fontSize: 9,
      color: '#1a1a1a',
      backgroundColor: '#ffffff',
      paddingHorizontal: 48,
      paddingVertical: 48,
    },

    // Accent bar at very top
    accentBar: {
      height: 4,
      backgroundColor: primary,
      marginBottom: 20,
      marginHorizontal: -48,
    },

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    logoContainer: {
      width: 36,
      height: 36,
      borderRadius: 6,
      backgroundColor: secondary,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    logoImage: {
      width: 30,
      height: 30,
      objectFit: 'contain',
    },
    logoInitial: {
      fontSize: 14,
      fontFamily: 'Helvetica-Bold',
      color: primary,
    },
    clientName: {
      fontSize: 14,
      fontFamily: 'Helvetica-Bold',
      color: '#111827',
    },
    docLabel: {
      fontSize: 8,
      color: '#9ca3af',
      marginTop: 2,
    },
    headerRight: {
      alignItems: 'flex-end',
    },
    versionBadge: {
      fontSize: 8,
      color: primary,
      backgroundColor: withAlpha(primary, 0.08),
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 10,
      marginBottom: 3,
    },
    dateMeta: {
      fontSize: 7.5,
      color: '#9ca3af',
    },

    // Confidence badge
    confidenceBadge: {
      fontSize: 7.5,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 10,
      marginTop: 3,
    },

    // Section divider
    sectionDivider: {
      height: 1,
      backgroundColor: '#f3f4f6',
      marginVertical: 10,
    },

    // Headings
    h1: {
      fontSize: 13,
      fontFamily: 'Helvetica-Bold',
      color: '#111827',
      marginTop: 16,
      marginBottom: 6,
    },
    h2: {
      fontSize: 11,
      fontFamily: 'Helvetica-Bold',
      color: primary,
      marginTop: 14,
      marginBottom: 4,
      paddingBottom: 3,
      borderBottomWidth: 1,
      borderBottomColor: withAlpha(primary, 0.15),
    },
    h3: {
      fontSize: 9.5,
      fontFamily: 'Helvetica-Bold',
      color: '#374151',
      marginTop: 10,
      marginBottom: 3,
    },

    // Body
    paragraph: {
      fontSize: 8.5,
      color: '#374151',
      lineHeight: 1.5,
      marginBottom: 4,
    },
    listItem: {
      fontSize: 8.5,
      color: '#374151',
      lineHeight: 1.5,
      marginBottom: 2,
      flexDirection: 'row',
    },
    bullet: {
      width: 10,
      color: primary,
      fontFamily: 'Helvetica-Bold',
    },
    listText: {
      flex: 1,
    },

    // Footer
    footer: {
      position: 'absolute',
      bottom: 28,
      left: 48,
      right: 48,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: '#e5e7eb',
      paddingTop: 6,
    },
    footerText: {
      fontSize: 7,
      color: '#d1d5db',
    },
    footerAccent: {
      color: primary,
    },
  })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function IcpPDF({
  clientName,
  logoUrl,
  brandPrimaryColor,
  brandSecondaryColor,
  icpContent,
  version,
  confidenceLevel,
  createdAt,
}: ICPPdfProps) {
  const primary = brandPrimaryColor ?? '#2563eb'
  const secondary = brandSecondaryColor ?? '#eff6ff'
  const styles = buildStyles(primary, secondary)

  const nodes = parseMarkdownSections(icpContent)

  const confidenceStyle = {
    HIGH: { bg: 'rgba(34,197,94,0.08)', color: '#15803d' },
    MEDIUM: { bg: 'rgba(234,179,8,0.08)', color: '#a16207' },
    LOW: { bg: 'rgba(239,68,68,0.08)', color: '#b91c1c' },
  }
  const confStyle = confidenceLevel && confidenceStyle[confidenceLevel as keyof typeof confidenceStyle]
    ? confidenceStyle[confidenceLevel as keyof typeof confidenceStyle]
    : { bg: '#f3f4f6', color: '#6b7280' }

  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Document
      title={`${clientName} — ICP Research Document v${version}`}
      author="Rework Consulting"
      subject="Ideal Customer Profile"
    >
      <Page size="A4" style={styles.page}>
        {/* Accent bar */}
        <View style={styles.accentBar} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              {logoUrl ? (
                <Image src={logoUrl} style={styles.logoImage} />
              ) : (
                <Text style={styles.logoInitial}>{clientName.charAt(0).toUpperCase()}</Text>
              )}
            </View>
            <View>
              <Text style={styles.clientName}>{clientName}</Text>
              <Text style={styles.docLabel}>ICP Research Document</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.versionBadge}>Version {version}</Text>
            <Text style={styles.dateMeta}>{formattedDate}</Text>
            {confidenceLevel && (
              <Text
                style={[
                  styles.confidenceBadge,
                  { backgroundColor: confStyle.bg, color: confStyle.color },
                ]}
              >
                {confidenceLevel.charAt(0) + confidenceLevel.slice(1).toLowerCase()} Confidence
              </Text>
            )}
          </View>
        </View>

        {/* Content */}
        {nodes.map((node, i) => {
          if (node.type === 'h1') {
            return <Text key={i} style={styles.h1}>{stripMarkdown(node.text)}</Text>
          }
          if (node.type === 'h2') {
            return <Text key={i} style={styles.h2}>{stripMarkdown(node.text)}</Text>
          }
          if (node.type === 'h3') {
            return <Text key={i} style={styles.h3}>{stripMarkdown(node.text)}</Text>
          }
          if (node.type === 'li') {
            return (
              <View key={i} style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>{stripMarkdown(node.text)}</Text>
              </View>
            )
          }
          if (node.type === 'hr') {
            return <View key={i} style={styles.sectionDivider} />
          }
          return <Text key={i} style={styles.paragraph}>{stripMarkdown(node.text)}</Text>
        })}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            <Text style={styles.footerAccent}>Rework Consulting</Text> — Confidential
          </Text>
          <Text style={styles.footerText}>
            {clientName} · ICP v{version}
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  )
}
