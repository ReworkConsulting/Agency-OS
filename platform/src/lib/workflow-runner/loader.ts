import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

// The repo root is two levels up from platform/src/lib/workflow-runner/
// platform/ → Agency OS/ → workflows/
const REPO_ROOT = path.resolve(process.cwd(), '..')

export interface WorkflowFile {
  content: string
  /** SHA-256 hex digest of the file contents at time of load */
  hash: string
}

/**
 * Reads a workflow markdown file from the workflows/ directory at repo root.
 * Returns both the file content and a SHA-256 hash for versioning/auditing.
 * @param workflowFile - relative path from repo root, e.g. 'workflows/build_icp.md'
 */
export async function loadWorkflowMarkdown(workflowFile: string): Promise<WorkflowFile> {
  const absolutePath = path.join(REPO_ROOT, workflowFile)

  try {
    const content = await fs.readFile(absolutePath, 'utf-8')
    const hash = crypto.createHash('sha256').update(content).digest('hex')
    return { content, hash }
  } catch (err) {
    throw new Error(
      `Could not load workflow file "${workflowFile}" from ${absolutePath}. ` +
        `Make sure the file exists in the Agency OS workflows/ directory. Original error: ${String(err)}`
    )
  }
}

/**
 * Lists all available workflow files in workflows/ at repo root.
 */
export async function listWorkflowFiles(): Promise<string[]> {
  const workflowsDir = path.join(REPO_ROOT, 'workflows')
  try {
    const files = await fs.readdir(workflowsDir)
    return files
      .filter((f) => f.endsWith('.md'))
      .map((f) => `workflows/${f}`)
  } catch {
    return []
  }
}
