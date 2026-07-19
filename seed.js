import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://bwulxmhxtknpedcyhhxt.supabase.co'
// Using the service role key provided in the conversation earlier for admin powers
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3dWx4bWh4dGtucGVkY3loaHh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDQ2OTY5MCwiZXhwIjoyMTAwMDQ1NjkwfQ._Wbh1lYMVzxNTCVV9EX-lYMAl2RQOHMYw0zv2XQPHyA'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function seed() {
  console.log('Testing Supabase connection...')
  
  // 1. Create Admin User
  console.log('Creating admin user...')
  const adminEmail = 'admin@happyjourney.com'
  const adminPassword = 'adminpassword123'
  
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { full_name: 'System Admin' }
  })
  
  if (authError) {
    if (authError.message.includes('already been registered')) {
        console.log('Admin user already exists.')
    } else {
        console.error('Error creating admin auth user:', authError)
        return
    }
  } else {
      console.log('Admin auth user created:', authData.user.id)
      
      // Update profile to admin role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'admin', full_name: 'System Admin' })
        .eq('id', authData.user.id)
        
      if (profileError) {
          console.error('Error updating admin profile:', profileError)
      } else {
          console.log('Admin profile updated with admin role.')
      }
  }

  // 2. Insert Dummy Vehicles
  console.log('Inserting vehicles...')
  const vehicles = [
    { make: 'Toyota', model: 'Hiace', year: 2020, license_plate: 'KCX 123A', capacity: 14, status: 'available' },
    { make: 'Mercedes', model: 'Sprinter', year: 2022, license_plate: 'KDD 456B', capacity: 20, status: 'available' },
    { make: 'Nissan', model: 'Caravan', year: 2019, license_plate: 'KCY 789C', capacity: 11, status: 'maintenance' }
  ]
  const { data: insertedVehicles, error: vError } = await supabase.from('vehicles').upsert(vehicles, { onConflict: 'license_plate' }).select()
  if (vError) console.error('Error inserting vehicles:', vError)
  else console.log('Vehicles inserted/updated.')

  // 3. Insert Dummy Drivers
  console.log('Inserting drivers...')
  const drivers = [
    { full_name: 'John Doe', license_number: 'DL-KE-1001', phone: '+254700000001', status: 'available' },
    { full_name: 'Jane Smith', license_number: 'DL-KE-1002', phone: '+254700000002', status: 'available' },
    { full_name: 'Peter Jones', license_number: 'DL-KE-1003', phone: '+254700000003', status: 'off' }
  ]
  const { data: insertedDrivers, error: dError } = await supabase.from('drivers').upsert(drivers, { onConflict: 'license_number' }).select()
  if (dError) console.error('Error inserting drivers:', dError)
  else console.log('Drivers inserted/updated.')

  // 4. Create a Scheduled Journey (if we have a vehicle and driver)
  if (insertedVehicles && insertedDrivers && insertedVehicles.length > 0 && insertedDrivers.length > 0) {
      console.log('Inserting dummy journey...')
      const vehicle = insertedVehicles.find(v => v.status === 'available')
      const driver = insertedDrivers.find(d => d.status === 'available')
      
      if (vehicle && driver) {
          // Tomorrow at 10 AM
          const tomorrow = new Date()
          tomorrow.setDate(tomorrow.getDate() + 1)
          tomorrow.setHours(10, 0, 0, 0)
          
          const arrival = new Date(tomorrow)
          arrival.setHours(16, 0, 0, 0)

          const { error: jError } = await supabase.from('journeys').insert([{
              vehicle_id: vehicle.id,
              driver_id: driver.id,
              origin: 'Nairobi',
              destination: 'Mombasa',
              departure_time: tomorrow.toISOString(),
              arrival_time: arrival.toISOString(),
              status: 'scheduled',
              fare: 1500,
              available_seats: vehicle.capacity
          }])
          
          if (jError) console.error('Error inserting journey:', jError)
          else console.log('Dummy journey created successfully.')
      } else {
          console.log('Not enough available vehicles/drivers to create a journey.')
      }
  }

  console.log('Seeding complete.')
}

seed()
