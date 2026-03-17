import type { ToolDefinition } from '@/types/tool'

export const onboardClientTool: ToolDefinition = {
  id: 'onboard_client',
  label: 'Onboard New Client',
  description:
    'Validates client data, fills gaps, and kicks off initial review scraping. Run after creating a new client record.',
  workflow_file: 'workflows/onboard_client.md',
  output_type: 'onboarding',
  status: 'active',
  context_needs: ['overview', 'services', 'competitors'],
  saves_to: 'workflow_outputs',
  required_inputs: [],
  optional_inputs: [
    {
      key: 'intake_notes',
      label: 'Additional intake notes',
      type: 'textarea',
      required: false,
      placeholder: 'Any extra context from the intake call...',
    },
  ],
}
