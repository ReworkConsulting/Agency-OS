import { fal } from '@fal-ai/client'

fal.config({ credentials: process.env.FAL_KEY })

export type AdSize = 'square' | 'portrait' | 'story'

const SIZE_MAP: Record<AdSize, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
}

type FalResult = { data: { images: Array<{ url: string }> }; images?: Array<{ url: string }> }

export async function generateAdImage(
  prompt: string,
  size: AdSize,
  referenceImageUrl?: string
): Promise<string> {
  const dimensions = SIZE_MAP[size]

  let result: FalResult

  if (referenceImageUrl) {
    // Image-to-image: output conditioned on reference image style/composition
    result = await fal.run('fal-ai/flux/dev/image-to-image', {
      input: {
        image_url: referenceImageUrl,
        prompt,
        strength: 0.75, // 0 = copy reference exactly, 1 = ignore it. 0.75 = inspired by, not copied
        num_inference_steps: 28,
        guidance_scale: 3.5,
      },
    }) as unknown as FalResult
  } else {
    // Text-to-image: Flux Dev for high quality advertising photography
    result = await fal.run('fal-ai/flux/dev', {
      input: {
        prompt,
        image_size: {
          width: dimensions.width,
          height: dimensions.height,
        },
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
        enable_safety_checker: false,
      },
    }) as unknown as FalResult
  }

  // fal.run wraps output in `data`; fall back to top-level for older SDK versions
  const images = result?.data?.images ?? result?.images
  if (!images?.[0]?.url) {
    throw new Error(`FAL AI returned no image URL. Response keys: ${Object.keys(result ?? {}).join(', ')}`)
  }

  return images[0].url
}

export async function generateAdImagesBatch(
  prompts: string[],
  size: AdSize,
  referenceImageUrl?: string
): Promise<Array<{ prompt: string; url: string | null; error?: string }>> {
  const results = await Promise.allSettled(
    prompts.map((prompt) => generateAdImage(prompt, size, referenceImageUrl))
  )

  return results.map((result, i) => ({
    prompt: prompts[i],
    url: result.status === 'fulfilled' ? result.value : null,
    error: result.status === 'rejected' ? String(result.reason) : undefined,
  }))
}
