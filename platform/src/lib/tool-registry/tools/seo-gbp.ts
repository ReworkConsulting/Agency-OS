import type { ToolDefinition } from '@/types/tool'

export const seoGbpTool: ToolDefinition = {
  id: 'seo_gbp',
  label: 'GBP Optimization',
  description:
    'Audits the Google Business Profile against Local Pack competitors. Produces an optimized GBP description, category recommendations, 4 weeks of post copy, review request templates, and Q&A seeding scripts.',
  workflow_file: 'workflows/seo_gbp.md',
  output_type: 'seo_gbp',
  status: 'coming_soon',
  context_needs: ['overview', 'services', 'icp'],
  saves_to: 'workflow_outputs',
  prerequisites: ['build_icp', 'seo_audit'],
  model: 'claude-sonnet-4-6',
  max_tokens: 16000,
  required_inputs: [
    {
      key: 'target_service',
      label: 'Primary Service',
      type: 'text',
      required: true,
      placeholder: 'e.g. Roof Replacement',
    },
    {
      key: 'target_location',
      label: 'Target Location',
      type: 'text',
      required: true,
      placeholder: 'e.g. Denver, CO',
    },
    {
      key: 'gbp_url',
      label: 'Google Business Profile URL',
      type: 'url',
      required: true,
      placeholder: 'https://g.co/kgs/...',
      prefill_from: 'gbp_url',
    },
  ],
  optional_inputs: [
    {
      key: 'include_post_scripts',
      label: 'Generate Post Scripts (4 weeks)',
      type: 'select',
      required: false,
      options: ['true', 'false'],
      default_value: 'true',
    },
    {
      key: 'include_review_templates',
      label: 'Generate Review Request Templates',
      type: 'select',
      required: false,
      options: ['true', 'false'],
      default_value: 'true',
    },
    {
      key: 'competitor_gbp_urls',
      label: 'Competitor GBP URLs (one per line)',
      type: 'textarea',
      required: false,
      placeholder: 'https://g.co/kgs/...\nhttps://g.co/kgs/...',
    },
  ],
}
