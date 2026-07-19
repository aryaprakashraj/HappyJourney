import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Manually parse env vars
const envPath = path.resolve(process.cwd(), '.env')
const envContent = fs.readFileSync(envPath, 'utf8')
const envConfig = {}
envContent.split('\n').forEach(line => {
  const parts = line.split('=')
  if (parts.length === 2) {
    envConfig[parts[0].trim()] = parts[1].trim()
  }
})

const supabaseUrl = envConfig.VITE_SUPABASE_URL
const supabaseKey = envConfig.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const email = 'user@happyjourney.com'
  const password = 'userpassword123'
  const fullName = 'Test User'

  console.log(`Checking if user ${email} exists / registering...`)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }
    }
  })

  if (error) {
    console.error('Error signing up user:', error.message)
  } else {
    console.log('User status:', data.user ? 'Signed up / Already exists' : 'No user returned')
  }
}

test()
