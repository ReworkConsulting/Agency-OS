import type { ToolDefinition } from '@/types/tool'

export const seoGamePlanTool: ToolDefinition = {
  id: 'seo_game_plan',
  label: 'SEO Game Plan',
  description:
    'Synthesizes all SEO module outputs into one unified execution document: health dashboard, 80/20 priority fixes, 60-day week-by-week schedule, content calendar, and VA-ready task breakdown.',
  workflow_file: 'workflows/seo_game_plan.md',
  output_type: 'seo_game_plan',
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
      key: 'output_scope',
      label: 'Output Scope',
      type: 'select',
      required: false,
      options: ['full', 'quick_wins_only', '30_day_sprint'],
      default_value: 'full',
    },
    {
      key: 'include_va_task_breakdown',
      label: 'Include VA Task Breakdown',
      type: 'select',
      required: false,
      options: ['true', 'false'],
      default_value: 'true',
    },
    {
      key: 'include_content_calendar',
      label: 'Include Content Calendar',
      type: 'select',
      required: false,
      options: ['true', 'false'],
      default_value: 'true',
    },
  ],
}
