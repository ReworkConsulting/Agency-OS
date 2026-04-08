import type { ToolDefinition } from '@/types/tool'

export const seoSiteStructureTool: ToolDefinition = {
  id: 'seo_site_structure',
  label: 'Site Structure Generator',
  description:
    'Generates a full site architecture — URL map, page hierarchy, and internal linking plan — based on keyword clusters from the SEO audit. Produces the missing pages build queue for the Content Engine.',
  workflow_file: 'workflows/seo_site_structure.md',
  output_type: 'seo_site_structure',
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
  ],
  optional_inputs: [
    {
      key: 'service_count',
      label: 'Services to Plan For',
      type: 'select',
      required: false,
      options: ['all', '3', '5', '10'],
      default_value: 'all',
    },
    {
      key: 'location_count',
      label: 'Location Pages to Plan For',
      type: 'select',
      required: false,
      options: ['primary_only', '3', '5', '10'],
      default_value: '5',
    },
    {
      key: 'include_blog_structure',
      label: 'Include Blog Structure',
      type: 'select',
      required: false,
      options: ['true', 'false'],
      default_value: 'true',
    },
  ],
}
