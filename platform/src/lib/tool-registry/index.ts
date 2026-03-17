import type { ToolDefinition } from '@/types/tool'
import { buildIcpTool } from './tools/build-icp'
import { onboardClientTool } from './tools/onboard-client'
import { generateAdsTool } from './tools/generate-ads'
import { seoAuditTool } from './tools/seo-audit'
import { generateReportTool } from './tools/generate-report'

const REGISTRY: Record<string, ToolDefinition> = {
  build_icp: buildIcpTool,
  onboard_client: onboardClientTool,
  generate_ads: generateAdsTool,
  seo_audit: seoAuditTool,
  generate_report: generateReportTool,
}

export function getTool(toolId: string): ToolDefinition | null {
  return REGISTRY[toolId] ?? null
}

export function getAllTools(): ToolDefinition[] {
  return Object.values(REGISTRY)
}

type Module = 'research' | 'ads' | 'seo' | 'reports' | 'brand'

const MODULE_MAP: Record<Module, string[]> = {
  research: ['build_icp'],
  ads: ['generate_ads'],
  seo: ['seo_audit'],
  reports: ['generate_report'],
  brand: [],
}

export function getToolsForModule(module: Module): ToolDefinition[] {
  return (MODULE_MAP[module] ?? [])
    .map((id) => REGISTRY[id])
    .filter(Boolean)
}
