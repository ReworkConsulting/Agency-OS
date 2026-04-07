import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('client_id')
    const months = parseInt(searchParams.get('months') ?? '6')

    const since = new Date()
    since.setMonth(since.getMonth() - months)
    const sinceStr = since.toISOString().split('T')[0]

    let query = supabase
      .from('kpi_snapshots')
      .select('*')
      .gte('period', sinceStr)
      .order('period', { ascending: true })

    if (clientId) query = query.eq('client_id', clientId)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json(data ?? [])
  } catch (err) {
    console.error('[GET /api/kpis]', err)
    return NextResponse.json({ error: 'Failed to fetch KPIs' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await req.json()

    // body: { client_id, period, metrics: { ad_spend, leads, cpl, appointments, show_rate, revenue_generated } }
    const { client_id, period, metrics } = body

    if (!client_id || !period || !metrics) {
      return NextResponse.json({ error: 'client_id, period, and metrics are required' }, { status: 400 })
    }

    // Upsert all metrics for this client+period
    const rows = Object.entries(metrics)
      .filter(([, v]) => v !== '' && v !== null && v !== undefined)
      .map(([metric_name, value]) => ({
        client_id,
        period,
        metric_name,
        value: Number(value),
      }))

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No metric values provided' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('kpi_snapshots')
      .upsert(rows, { onConflict: 'client_id,period,metric_name' })
      .select()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('[POST /api/kpis]', err)
    return NextResponse.json({ error: 'Failed to save KPIs' }, { status: 500 })
  }
}
