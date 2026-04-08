import type { ToolDefinition } from '@/types/tool'

export const seoAuditTool: ToolDefinition = {
  id: 'seo_audit',
  label: 'SEO Audit',
  description:
    'Full local SEO audit: technical signals, on-page analysis, keyword research with clusters, competitor benchmarking, and Local Pack status. Required before running any other SEO module.',
  workflow_file: 'workflows/seo_audit.md',
  output_type: 'seo_audit',
  status: 'active',
  context_needs: ['overview', 'services', 'competitors', 'icp'],
  saves_to: 'workflow_outputs',
  prerequisites: ['build_icp'],
  model: 'claude-sonnet-4-6',
  max_tokens: 16000,
  required_inputs: [
    {
      key: 'target_service',
      label: 'Primary Service to Audit',
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
  ],
  optional_inputs: [
    {
      key: 'website_url',
      label: 'Client Website URL',
      type: 'url',
      required: false,
      placeholder: 'https://example.com',
      prefill_from: 'website_url',
    },
    {
      key: 'gbp_url',
      label: 'Google Business Profile URL',
      type: 'url',
      required: false,
      placeholder: 'https://g.co/kgs/...',
      prefill_from: 'gbp_url',
    },
    {
      key: 'audit_scope',
      label: 'Audit Scope',
      type: 'select',
      required: false,
      options: ['full', 'technical_only', 'keywords_only', 'competitors_only'],
      default_value: 'full',
    },
    {
      key: 'competitor_count',
      label: 'Competitors to Analyze',
      type: 'select',
      required: false,
      options: ['2', '3', '5'],
      default_value: '3',
    },
  ],
}
