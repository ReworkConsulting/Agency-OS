import type { ToolDefinition } from '@/types/tool'

export const seoAuditTool: ToolDefinition = {
  id: 'seo_audit',
  label: 'SEO Audit',
  description:
    'Analyzes website SEO, identifies keyword opportunities, and benchmarks against competitors.',
  workflow_file: 'workflows/seo_audit.md',
  output_type: 'seo_audit',
  status: 'coming_soon',
  context_needs: ['overview', 'services', 'competitors'],
  saves_to: 'workflow_outputs',
  // ICP must exist so the audit understands who the target audience is.
  prerequisites: ['build_icp'],
  model: 'claude-sonnet-4-6',
  max_tokens: 12000,
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
  optional_inputs: [],
}
