import Anthropic from '@anthropic-ai/sdk'

const DEFAULT_MODEL = 'claude-sonnet-4-6'
const DEFAULT_MAX_TOKENS = 16000

let _client: Anthropic | null = null

function getClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('Missing ANTHROPIC_API_KEY in environment variables')
    }
    _client = new Anthropic({ apiKey })
  }
  return _client
}

/**
 * Streams a Claude response chunk by chunk.
 * Calls onChunk for each text delta, resolves when the stream ends.
 *
 * @param model - Claude model ID. Defaults to claude-sonnet-4-6.
 * @param maxTokens - Max output tokens. Defaults to 16000.
 */
export async function streamClaudeResponse(
  systemPrompt: string,
  userMessage: string,
  onChunk: (text: string) => void,
  options?: { model?: string; maxTokens?: number }
): Promise<{ total_tokens: number }> {
  const client = getClient()
  const model = options?.model ?? DEFAULT_MODEL
  const max_tokens = options?.maxTokens ?? DEFAULT_MAX_TOKENS

  const stream = await client.messages.stream({
    model,
    max_tokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      onChunk(event.delta.text)
    }
  }

  const finalMessage = await stream.finalMessage()
  const total_tokens =
    (finalMessage.usage?.input_tokens ?? 0) +
    (finalMessage.usage?.output_tokens ?? 0)

  return { total_tokens }
}
