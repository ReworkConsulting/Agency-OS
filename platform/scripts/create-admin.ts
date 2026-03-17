/**
 * Create the first admin user for Agency OS.
 *
 * Usage:
 *   npx tsx scripts/create-admin.ts --email you@rework.com --name "Your Name"
 *
 * This script:
 *   1. Creates a user in Supabase Auth (email confirmed)
 *   2. Sets a temporary password and prints it
 *   3. Inserts a user_profiles row with role = 'admin'
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'

// ── Read .env.local ─────────────────────────────────────────
function readEnv(): Record<string, string> {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (!fs.existsSync(envPath)) {
    console.error('.env.local not found at', envPath)
    process.exit(1)
  }
  const raw = fs.readFileSync(envPath, 'utf8')
  const result: Record<string, string> = {}
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx < 0) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    result[key] = val
  }
  return result
}

// ── Parse CLI args ───────────────────────────────────────────
function parseArgs(): { email: string; name: string } {
  const args = process.argv.slice(2)
  let email = ''
  let name = ''
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--email') email = args[++i]
    if (args[i] === '--name') name = args[++i]
  }
  if (!email) {
    console.error('Usage: npx tsx scripts/create-admin.ts --email you@rework.com --name "Your Name"')
    process.exit(1)
  }
  return { email, name: name || email.split('@')[0] }
}

// ── Main ─────────────────────────────────────────────────────
async function main() {
  const env = readEnv()
  const { email, name } = parseArgs()

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Generate a strong temporary password
  const tempPassword = crypto.randomBytes(12).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 16) + '!A1'

  console.log(`\nCreating admin user: ${email}`)

  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const existing = existingUsers?.users?.find(u => u.email === email)

  let userId: string

  if (existing) {
    console.log(`User already exists (${existing.id}), updating profile to admin...`)
    userId = existing.id
  } else {
    // Create the user
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    })
    if (error) {
      console.error('Failed to create user:', error.message)
      process.exit(1)
    }
    userId = data.user.id
    console.log(`Created user: ${userId}`)
  }

  // Upsert user_profiles row as admin
  const { error: profileError } = await supabase.from('user_profiles').upsert({
    id: userId,
    full_name: name,
    role: 'admin',
  })

  if (profileError) {
    console.error('Failed to create profile:', profileError.message)
    process.exit(1)
  }

  console.log('\n✅ Admin user ready!\n')
  console.log(`  Email:    ${email}`)
  if (!existing) {
    console.log(`  Password: ${tempPassword}`)
    console.log('\n  ⚠️  Change this password immediately after first login via Settings → Account.')
  } else {
    console.log(`  Role:     admin (updated)`)
  }
  console.log('\n  Go to: http://localhost:3000/login\n')
}

main().catch(err => { console.error(err); process.exit(1) })
