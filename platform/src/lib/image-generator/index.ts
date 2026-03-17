import { fal } from '@fal-ai/client'

export type AdSize = 'square' | 'portrait' | 'story'

const SIZE_MAP: Record<AdSize, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
}

export async function generateAdImage(prompt: string, size: AdSize): Promise<string> {
  const dimensions = SIZE_MAP[size]

  const result = await fal.run('fal-ai/flux/schnell', {
    input: {
      prompt,
      image_size: {
        width: dimensions.width,
        height: dimensions.height,
      },
      num_inference_steps: 4,
      num_images: 1,
    },
  }) as unknown as { images: Array<{ url: string }> }

  if (!result?.images?.[0]?.url) {
    throw new Error('FAL AI returned no image URL')
  }

  return result.images[0].url
}

export async function generateAdImagesBatch(
  prompts: string[],
  size: AdSize
): Promise<Array<{ prompt: string; url: string | null; error?: string }>> {
  const results = await Promise.allSettled(
    prompts.map((prompt) => generateAdImage(prompt, size))
  )

  return results.map((result, i) => ({
    prompt: prompts[i],
    url: result.status === 'fulfilled' ? result.value : null,
    error: result.status === 'rejected' ? String(result.reason) : undefined,
  }))
}
