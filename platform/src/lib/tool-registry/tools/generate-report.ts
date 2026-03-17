import type { ToolDefinition } from '@/types/tool'

export const generateReportTool: ToolDefinition = {
  id: 'generate_report',
  label: 'Generate Monthly Report',
  description:
    'Produces a formatted monthly performance report with campaign metrics, wins, and recommendations.',
  workflow_file: 'workflows/generate_report.md',
  output_type: 'report',
  status: 'coming_soon',
  context_needs: ['overview', 'services'],
  saves_to: 'workflow_outputs',
  // Report generation is lighter — summarising data rather than deep synthesis.
  model: 'claude-sonnet-4-6',
  max_tokens: 6000,
  required_inputs: [
    {
      key: 'reporting_period',
      label: 'Reporting Period',
      type: 'text',
      required: true,
      placeholder: 'e.g. March 2026',
    },
  ],
  optional_inputs: [
    {
      key: 'include_recommendations',
      label: 'Include next-month recommendations?',
      type: 'boolean',
      required: false,
      default_value: true,
    },
  ],
}
