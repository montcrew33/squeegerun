const { createClient } = require('@supabase/supabase-js')

async function diagnoseDatabase() {
  require('dotenv').config({ path: '.env.local' })
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  console.log('🔍 Diagnosing database setup...\n')
  
  try {
    // Check if tables exist
    console.log('1️⃣ Checking if tables exist...')
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['profiles', 'organizations', 'customers', 'jobs'])
    
    if (tablesError) {
      console.error('❌ Error checking tables:', tablesError.message)
      return
    }
    
    const tableNames = tables.map(t => t.table_name)
    console.log('✅ Found tables:', tableNames.join(', '))
    
    if (!tableNames.includes('profiles')) {
      console.error('❌ Missing "profiles" table!')
      return
    }
    
    if (!tableNames.includes('organizations')) {
      console.error('❌ Missing "organizations" table!')
      return
    }
    
    // Check if any organizations exist
    console.log('\n2️⃣ Checking organizations...')
    const { data: orgs, error: orgsError } = await supabase
      .from('organizations')
      .select('*')
      .limit(5)
    
    if (orgsError) {
      console.error('❌ Error querying organizations:', orgsError.message)
    } else {
      console.log(`✅ Found ${orgs.length} organizations`)
      if (orgs.length > 0) {
        orgs.forEach(org => console.log(`   - ${org.name} (${org.id})`))
      }
    }
    
    // Check if any users exist in auth.users
    console.log('\n3️⃣ Checking auth users...')
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      console.error('❌ Error querying auth users:', usersError.message)
    } else {
      console.log(`✅ Found ${users.length} auth users`)
      if (users.length > 0) {
        users.forEach(user => console.log(`   - ${user.email} (${user.id})`))
      }
    }
    
    // Check if trigger function exists
    console.log('\n4️⃣ Checking trigger function...')
    const { data: functions, error: functionsError } = await supabase
      .rpc('exec_sql', {
        query: `SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';`
      })
      .single()
    
    if (functionsError) {
      console.log('⚠️  Could not check trigger function (might not have RPC access)')
    } else {
      console.log('✅ Trigger function check completed')
    }
    
    // Try to manually insert a test profile to see what fails
    console.log('\n5️⃣ Testing manual profile insert...')
    
    // First, create a test organization if none exist
    if (!orgs || orgs.length === 0) {
      console.log('Creating test organization...')
      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: 'Test Organization',
          subscription_status: 'active'
        })
        .select()
        .single()
      
      if (orgError) {
        console.error('❌ Failed to create test organization:', orgError.message)
        return
      }
      console.log('✅ Created test organization:', newOrg.id)
    }
    
    // Now try to insert a test profile
    const testOrgId = orgs && orgs.length > 0 ? orgs[0].id : null
    if (testOrgId) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: '00000000-0000-0000-0000-000000000001', // Test UUID
          full_name: 'Test User',
          role: 'owner',
          organization_id: testOrgId
        })
        .select()
        .single()
      
      if (profileError) {
        console.error('❌ Failed to insert test profile:', profileError.message)
        console.error('   This might be the same error happening during signup')
      } else {
        console.log('✅ Successfully inserted test profile')
        
        // Clean up test profile
        await supabase
          .from('profiles')
          .delete()
          .eq('id', '00000000-0000-0000-0000-000000000001')
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

diagnoseDatabase()