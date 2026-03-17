import type { ToolDefinition } from '@/types/tool'

export const buildIcpTool: ToolDefinition = {
  id: 'build_icp',
  label: 'Build ICP Research Document',
  description:
    'Scrapes website, Google reviews, competitor reviews, Reddit, and social data. Synthesizes a complete six-profile ICP document: Brand Voice, Ideal Customer Profile, Offer Extraction, Messaging & Positioning, Marketing Channels, and Customer Acquisition.',
  workflow_file: 'workflows/build_icp_platform.md',
  output_type: 'icp',
  status: 'active',
  context_needs: ['overview', 'services', 'competitors', 'reviews', 'transcript'],
  saves_to: 'icp_documents',
  // ICP generation is the most complex workflow — needs full token budget and best model.
  model: 'claude-sonnet-4-6',
  max_tokens: 16000,
  required_inputs: [
    {
      key: 'website_url',
      label: 'Client Website URL',
      type: 'url',
      required: true,
      placeholder: 'https://example.com',
      helper_text: 'Used for offer extraction (Profile 3). Pre-filled from client record.',
      prefill_from: 'website_url',
    },
    {
      key: 'gbp_url',
      label: 'Google Business Profile URL',
      type: 'url',
      required: true,
      placeholder: 'https://g.co/kgs/...',
      helper_text: 'Used for review scraping (Profile 2).',
      prefill_from: 'gbp_url',
    },
  ],
  optional_inputs: [
    {
      key: 'transcript_url',
      label: 'Grill Them Interview Transcript URL',
      type: 'url',
      required: false,
      placeholder: 'https://app.grillthem.com/...',
      helper_text: 'Paste the Grill Them session URL — the workflow will scrape and include the founder interview in Brand Voice and ICP profiles.',
    },
    {
      key: 'overwrite_existing',
      label: 'Overwrite existing ICP if one exists?',
      type: 'boolean',
      required: false,
      default_value: false,
    },
  ],
}
