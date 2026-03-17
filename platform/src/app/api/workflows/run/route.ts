import { NextRequest } from 'next/server'
import { runWorkflow } from '@/lib/workflow-runner'
import type { WorkflowRunRequest, StreamEvent } from '@/types/workflow'

export const runtime = 'nodejs'
export const maxDuration = 300  // 5 minutes for long-running workflow streams

export async function POST(request: NextRequest) {
  let body: WorkflowRunRequest

  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.client_slug || !body.tool_id) {
    return Response.json(
      { error: 'client_slug and tool_id are required' },
      { status: 400 }
    )
  }

  const encoder = new TextEncoder()

  function encodeEvent(event: StreamEvent): Uint8Array {
    return encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await runWorkflow(body, (chunk) => {
          controller.enqueue(encodeEvent({ type: 'chunk', text: chunk }))
        })

        controller.enqueue(
          encodeEvent({
            type: 'complete',
            text: '',
            run_id: result.run_id,
            output_id: result.output_id,
          })
        )
      } catch (err) {
        controller.enqueue(
          encodeEvent({
            type: 'error',
            message: err instanceof Error ? err.message : String(err),
          })
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
