import type { ToolDefinition } from '@/types/tool'

export const generateAdsTool: ToolDefinition = {
  id: 'generate_ads',
  label: 'Generate Facebook Ads',
  description:
    'Creates a full set of Facebook ad copy — hooks, primary text, headlines, CTAs, and image generation prompts — based on ICP profiles and brand voice.',
  workflow_file: 'workflows/generate_ads.md',
  output_type: 'ads',
  status: 'active',
  context_needs: ['overview', 'services', 'icp'],
  saves_to: 'workflow_outputs',
  // Ad copy requires an ICP to exist first — otherwise output is generic.
  prerequisites: ['build_icp'],
  model: 'claude-sonnet-4-6',
  max_tokens: 16000,
  required_inputs: [
    {
      key: 'target_service',
      label: 'Target Service',
      type: 'text',
      required: true,
      placeholder: 'e.g. HVAC Installation',
    },
    {
      key: 'campaign_objective',
      label: 'Campaign Objective',
      type: 'select',
      required: true,
      options: ['Lead Generation', 'Awareness', 'Retargeting'],
    },
    {
      key: 'angle',
      label: 'Creative Angle',
      type: 'text',
      required: true,
      placeholder: 'e.g. Budget-Conscious Homeowner — lead with savings/ROI',
    },
    {
      key: 'ad_format',
      label: 'Ad Format',
      type: 'select',
      required: true,
      options: ['Headline Statement', 'Offer/Promotion', 'Testimonial Card', 'Before & After', 'Pain Point Hook', 'Social Proof/Stats', 'Us vs. Them', 'Feature Bullets', 'Lifestyle/Aspiration', 'Urgency/Seasonal'],
    },
    {
      key: 'ad_size',
      label: 'Ad Size',
      type: 'select',
      required: true,
      options: ['square', 'portrait', 'story'],
    },
  ],
  optional_inputs: [
    {
      key: 'ad_count',
      label: 'Number of ad variations',
      type: 'select',
      required: false,
      options: ['3', '5', '10'],
      default_value: '5',
    },
    {
      key: 'messaging_focus',
      label: 'Messaging Focus (optional)',
      type: 'text',
      required: false,
      placeholder: 'e.g. Emphasize 24/7 availability and same-day service',
    },
  ],
}
