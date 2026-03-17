export interface ToolInput {
  key: string
  label: string
  type: 'text' | 'url' | 'textarea' | 'boolean' | 'select'
  required: boolean
  placeholder?: string
  helper_text?: string
  default_value?: string | boolean
  options?: string[]  // for select type
  // If set, pre-fills from this Client field key
  prefill_from?: string
}

export interface ToolDefinition {
  id: string
  label: string
  description: string
  workflow_file: string        // relative to repo root: 'workflows/build_icp.md'
  output_type: string          // 'icp' | 'ads' | 'seo_audit' | 'report' | 'brand_pack'
  status: 'active' | 'coming_soon'

  // Which sections of ClientContext this tool consumes
  context_needs: Array<'overview' | 'services' | 'competitors' | 'reviews' | 'icp' | 'transcript'>

  // Where the output is persisted after completion
  saves_to: 'icp_documents' | 'workflow_outputs' | null

  // Tool IDs that must have a completed run for this client before this tool can run.
  // e.g. ['build_icp'] means an ICP must exist first.
  prerequisites?: string[]

  // Claude model to use. Defaults to claude-sonnet-4-6 if not set.
  model?: string

  // Max output tokens. Defaults to 16000 if not set.
  max_tokens?: number

  required_inputs: ToolInput[]
  optional_inputs: ToolInput[]
}
