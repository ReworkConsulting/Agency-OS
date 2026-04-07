import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { ClientNav } from '@/components/layout/ClientNav'
import { BrandEditor } from './BrandEditor'

export default async function BrandPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = createServerClient()

  const { data: client } = await supabase
    .from('clients')
    .select('id, company_name, logo_url, brand_primary_color, brand_secondary_color')
    .eq('slug', slug)
    .single()

  if (!client) notFound()

  return (
    <div className="">
      <div className="px-8 pt-10 pb-0">
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-3)' }}>Brand</p>
          <h1 className="text-base font-semibold" style={{ color: 'var(--text-1)' }}>{client.company_name}</h1>
        </div>
        <ClientNav slug={slug} />
      </div>

      <div className="p-8 max-w-2xl">
        <BrandEditor
          clientSlug={slug}
          initialLogoUrl={client.logo_url}
          initialPrimaryColor={client.brand_primary_color}
          initialSecondaryColor={client.brand_secondary_color}
        />
      </div>
    </div>
  )
}
