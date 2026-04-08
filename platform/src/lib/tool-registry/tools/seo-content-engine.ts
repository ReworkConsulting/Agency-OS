import type { ToolDefinition } from '@/types/tool'

export const seoContentEngineTool: ToolDefinition = {
  id: 'seo_content_engine',
  label: 'SEO Content Engine',
  description:
    'Produces detailed content briefs for service pages, location pages, and blog posts. Each brief is grounded in competitor data and ICP research — ready for direct handoff to a writer.',
  workflow_file: 'workflows/seo_content_engine.md',
  output_type: 'seo_content_engine',
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
      key: 'page_type',
      label: 'Page Type',
      type: 'select',
      required: true,
      options: ['all', 'service_page', 'location_page', 'blog_post'],
      default_value: 'all',
    },
  ],
  optional_inputs: [
    {
      key: 'word_count_target',
      label: 'Word Count Target',
      type: 'text',
      required: false,
      placeholder: 'e.g. 800-1200',
      default_value: '800-1200',
    },
    {
      key: 'include_schema_recommendations',
      label: 'Include Schema Recommendations',
      type: 'select',
      required: false,
      options: ['true', 'false'],
      default_value: 'true',
    },
    {
      key: 'include_faq_sections',
      label: 'Include FAQ Sections (PAA data)',
      type: 'select',
      required: false,
      options: ['true', 'false'],
      default_value: 'true',
    },
  ],
}
