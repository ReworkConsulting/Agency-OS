'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const body: Record<string, unknown> = {}
    formData.forEach((value, key) => { if (value !== '') body[key] = value })
    body.financing_available = formData.get('financing_available') === 'on'
    body.interview_transcript_available = formData.get('interview_transcript_available') === 'on'
    if (body.average_job_value) body.average_job_value = Number(body.average_job_value)
    if (body.starting_ad_spend) body.starting_ad_spend = Number(body.starting_ad_spend)

    try {
      const res = await fetch('/api/clients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to create client'); return }
      router.push(`/clients/${data.client.slug}`)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-1)' }}>New Client</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>Fill in the intake details to create the client workspace.</p>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', color: '#dc2626' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <Section title="Business Information">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Company Name" name="company_name" required />
            <Field label="Owner Name" name="owner_name" />
            <Field label="Email" name="email" type="email" />
            <Field label="Phone" name="phone" type="tel" />
            <Field label="Address" name="address" className="col-span-2" />
            <Field label="Website URL" name="website_url" type="url" />
            <Field label="Google Business Profile URL" name="gbp_url" type="url" />
            <Field label="Industry" name="industry" />
            <Field label="Company Type" name="company_type" placeholder="LLC, S-Corp..." />
          </div>
        </Section>

        <Section title="Service Details">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Primary Service" name="primary_service" />
            <Field label="Service Area" name="service_area" />
            <Field label="Average Job Value ($)" name="average_job_value" type="number" />
            <div className="flex items-center gap-2.5 pt-6">
              <input type="checkbox" id="financing_available" name="financing_available"
                className="w-4 h-4 rounded" style={{ accentColor: 'var(--text-1)' }} />
              <label htmlFor="financing_available" className="text-sm" style={{ color: 'var(--text-1)' }}>Financing available</label>
            </div>
          </div>
        </Section>

        <Section title="Marketing Context">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Starting Ad Spend ($/mo)" name="starting_ad_spend" type="number" />
            <Field label="6–12 Month Goal" name="main_goal" />
            <Field label="Biggest Marketing Challenge" name="biggest_marketing_challenge" textarea className="col-span-2" />
            <Field label="Ideal Client Description" name="ideal_client_description" textarea className="col-span-2" />
          </div>
        </Section>

        <Section title="Social Media">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Facebook URL" name="facebook_url" type="url" />
            <Field label="Instagram URL" name="instagram_url" type="url" />
            <Field label="YouTube URL" name="youtube_url" type="url" />
            <Field label="TikTok URL" name="tiktok_url" type="url" />
          </div>
        </Section>

        <Section title="Assets & Integrations">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Facebook Ad Account ID" name="facebook_ad_account_id" />
            <Field label="GHL Sub-Account" name="ghl_sub_account" />
            <Field label="Logo URL" name="logo_url" type="url" />
            <div className="flex items-center gap-2.5">
              <input type="checkbox" id="interview_transcript_available" name="interview_transcript_available"
                className="w-4 h-4 rounded" style={{ accentColor: 'var(--text-1)' }} />
              <label htmlFor="interview_transcript_available" className="text-sm" style={{ color: 'var(--text-1)' }}>Interview transcript available</label>
            </div>
          </div>
        </Section>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
          >
            {loading ? 'Creating...' : 'Create Client'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/clients')}
            className="px-6 py-2.5 text-sm rounded-lg transition-colors"
            style={{ border: '1px solid var(--border)', color: 'var(--text-2)', background: 'transparent' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[10px] font-bold tracking-widest uppercase mb-4" style={{ color: 'var(--text-3)' }}>{title}</h2>
      {children}
    </section>
  )
}

function Field({ label, name, type = 'text', required = false, placeholder, textarea = false, className = '' }: {
  label: string; name: string; type?: string; required?: boolean; placeholder?: string; textarea?: boolean; className?: string
}) {
  const baseStyle = {
    background: 'var(--bg-subtle)',
    border: '1px solid var(--border)',
    color: 'var(--text-1)',
  }
  const cls = "mt-1.5 w-full px-3 py-2 rounded-lg text-sm transition-colors focus:outline-none"

  return (
    <div className={className}>
      <label className="block text-xs font-medium" style={{ color: 'var(--text-2)' }}>
        {label}{required && <span className="ml-0.5" style={{ color: 'var(--text-3)' }}>*</span>}
      </label>
      {textarea ? (
        <textarea name={name} required={required} placeholder={placeholder} rows={3} className={`${cls} resize-none`} style={baseStyle} />
      ) : (
        <input type={type} name={name} required={required} placeholder={placeholder} className={cls} style={baseStyle} />
      )}
    </div>
  )
}
