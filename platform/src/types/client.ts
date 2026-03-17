export interface Client {
  id: string
  slug: string
  status: 'active' | 'archived'
  created_at: string
  updated_at: string

  // Business Information
  company_name: string
  owner_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  time_zone: string | null
  website_url: string | null
  gbp_url: string | null
  ein: string | null
  company_type: string | null
  industry: string | null

  // Service Details
  primary_service: string | null
  services_list: string[] | null
  service_area: string | null
  financing_available: boolean | null
  financing_details: string | null
  average_job_value: number | null

  // Marketing Context
  starting_ad_spend: number | null
  biggest_marketing_challenge: string | null
  ideal_client_description: string | null
  main_goal: string | null

  // Partnership Context
  how_they_heard: string | null
  why_hired_rework: string | null
  values_in_partnership: string | null

  // Social Media
  facebook_url: string | null
  instagram_url: string | null
  youtube_url: string | null
  tiktok_url: string | null
  linkedin_url: string | null

  // Assets & Integrations
  logo_url: string | null
  brand_primary_color: string | null
  brand_secondary_color: string | null
  facebook_ad_account_id: string | null
  ghl_sub_account: string | null
  preferred_comms: string | null

  // Interview
  interview_transcript_available: boolean
  interview_transcript: string | null

  extras: Record<string, unknown>
}

export type ClientInsert = Omit<Client, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type ClientUpdate = Partial<Omit<Client, 'id' | 'slug' | 'created_at'>>

export interface Competitor {
  id: string
  client_id: string
  name: string
  gbp_url: string | null
  website_url: string | null
  notes: string | null
  created_at: string
}

export interface Review {
  id: string
  client_id: string
  source: 'client' | 'competitor'
  competitor_id: string | null
  reviewer_name: string | null
  star_rating: number | null
  review_text: string
  review_date: string | null
  platform: string | null
  scraped_at: string
  is_curated: boolean
}

export interface ICPDocument {
  id: string
  client_id: string
  version: number
  is_current: boolean
  created_at: string
  confidence_level: 'HIGH' | 'MEDIUM' | 'LOW' | null
  source_materials: string | null
  has_transcript: boolean
  icp_content: string
  profiles: Record<string, unknown> | null
}

export interface ReviewsSummary {
  total_client_reviews: number
  average_client_rating: number | null
  total_competitor_reviews: number
  curated_quotes: CuratedReview[]
}

export interface CuratedReview {
  id: string
  reviewer_name: string | null
  star_rating: number | null
  review_text: string
  platform: string | null
  source: 'client' | 'competitor'
  competitor_name?: string
}

export interface ICPExport {
  id: string
  client_id: string
  icp_document_id: string
  format: 'pdf' | 'docx'
  file_url: string
  storage_path: string
  created_at: string
}

// The assembled payload passed to every workflow execution
export interface ClientContext {
  client: Client
  competitors: Competitor[]
  reviews_summary: ReviewsSummary
  icp_document: ICPDocument | null
  context_markdown: string  // pre-rendered markdown block injected into system prompt
}
