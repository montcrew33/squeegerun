const { createClient } = require('@supabase/supabase-js')

async function simpleCheck() {
  require('dotenv').config({ path: '.env.local' })
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  const supabase = createClient(supabaseUrl, serviceRoleKey)
  
  console.log('🔍 Simple database check...\n')
  
  // Try to query each table directly
  const tables = ['organizations', 'profiles', 'customers', 'jobs']
  
  for (const table of tables) {
    try {
      console.log(`Checking ${table}...`)
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.error(`❌ ${table}: ${error.message}`)
      } else {
        console.log(`✅ ${table}: table exists (${data.length} rows found)`)
      }
    } catch (err) {
      console.error(`❌ ${table}: ${err.message}`)
    }
  }
  
  console.log('\n🔍 Checking auth users...')
  try {
    const { data: { users }, error } = await supabase.auth.admin.listUsers()
    if (error) {
      console.error('❌ Auth users:', error.message)
    } else {
      console.log(`✅ Auth users: ${users.length} users found`)
      users.forEach(user => console.log(`   - ${user.email} (created: ${user.created_at})`))
    }
  } catch (err) {
    console.error('❌ Auth users:', err.message)
  }
}

simpleCheck()