import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://bwulxmhxtknpedcyhhxt.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3dWx4bWh4dGtucGVkY3loaHh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDQ2OTY5MCwiZXhwIjoyMTAwMDQ1NjkwfQ._Wbh1lYMVzxNTCVV9EX-lYMAl2RQOHMYw0zv2XQPHyA'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function updateAdmin() {
  console.log('Updating Admin credentials...')
  
  // Update Auth user
  const { data: users, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) return console.error(listError)
  
  const adminUser = users.users.find(u => u.email === 'admin@happyjourney.com')
  if (adminUser) {
    const { error: updateError } = await supabase.auth.admin.updateUserById(adminUser.id, {
      email: 'admin@happyjourney.com'
    })
    if (updateError) console.error('Error updating auth email:', updateError)
    else console.log('Auth email updated successfully.')
  } else {
    console.log('Admin user not found in auth.')
  }

  // Update Profile table
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ email: 'admin@happyjourney.com' })
    .eq('email', 'admin@happyjourney.com')
    
  if (profileError) console.error('Error updating profile email:', profileError)
  else console.log('Profile email updated successfully.')
}

updateAdmin()
