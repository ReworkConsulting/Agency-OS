export interface WorkflowRunRequest {
  client_slug: string
  tool_id: string
  inputs: Record<string, string | boolean | number>
}

export interface WorkflowRun {
  id: string
  client_id: string
  workflow_id: string
  tool_id: string
  started_at: string
  completed_at: string | null
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  inputs: Record<string, unknown>
  output_id: string | null
  error_message: string | null
  model: string | null
  tokens_used: number | null
  workflow_file: string | null
  workflow_file_hash: string | null
}

export interface WorkflowOutput {
  id: string
  run_id: string
  client_id: string
  workflow_id: string
  created_at: string
  output_markdown: string
  output_type: string | null
  saved_to: string | null
  metadata: Record<string, unknown>
}

// SSE stream event shapes
export type StreamEvent =
  | { type: 'chunk'; text: string }
  | { type: 'complete'; text: string; run_id: string; output_id: string }
  | { type: 'error'; message: string }
