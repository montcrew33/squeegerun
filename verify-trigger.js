const { createClient } = require('@supabase/supabase-js')

async function verifyTrigger() {
  // Load environment variables
  require('dotenv').config({ path: '.env.local' })
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
  }
  
  // Create Supabase client with service role key to access all data
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  console.log('🔍 Checking if new user trigger worked...\n')
  
  try {
    // Query profiles and organizations
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        role,
        organizations!inner (
          name
        )
      `)
      .limit(5)
    
    if (profileError) {
      console.error('❌ Error querying profiles:', profileError.message)
      return
    }
    
    if (!profiles || profiles.length === 0) {
      console.log('📝 No profiles found. Either:')
      console.log('   1. No users have signed up yet')
      console.log('   2. The trigger isn\'t working')
      console.log('   3. There\'s an issue with the database setup')
      return
    }
    
    console.log('✅ Found profiles:')
    console.log('================================')
    
    profiles.forEach((profile, index) => {
      console.log(`${index + 1}. User: ${profile.full_name}`)
      console.log(`   ID: ${profile.id}`)
      console.log(`   Role: ${profile.role}`)
      console.log(`   Organization: ${profile.organizations?.name || 'No organization'}`)
      console.log('')
    })
    
    // Check if we have any 'owner' users with 'My Business' organization
    const hasExpectedUser = profiles.some(p => 
      p.role === 'owner' && p.organizations?.name === 'My Business'
    )
    
    if (hasExpectedUser) {
      console.log('🎉 SUCCESS! Found test user with role "owner" and organization "My Business"')
      console.log('   The new user trigger is working correctly!')
    } else {
      console.log('⚠️  No test user found with expected values.')
      console.log('   Expected: role="owner", organization="My Business"')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

verifyTrigger()