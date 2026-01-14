const { createClient } = require('@supabase/supabase-js')

async function debugSignup() {
  require('dotenv').config({ path: '.env.local' })
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  const supabase = createClient(supabaseUrl, serviceRoleKey)
  
  console.log('🔍 Debugging signup issue...\n')
  
  try {
    // Check if the trigger function exists
    console.log('1️⃣ Checking if trigger function exists...')
    const { data: functions, error: funcError } = await supabase
      .from('pg_proc')
      .select('proname')
      .eq('proname', 'handle_new_user')
    
    if (funcError) {
      console.log('⚠️  Could not check functions directly, trying alternative...')
    } else {
      console.log(`✅ Found ${functions.length} function(s) named 'handle_new_user'`)
    }
    
    // Check organizations table structure
    console.log('\n2️⃣ Checking organizations table structure...')
    const { data: orgTest, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .limit(1)
    
    if (orgError) {
      console.error('❌ Organizations table error:', orgError.message)
    } else {
      console.log('✅ Organizations table accessible')
    }
    
    // Test manual organization insert
    console.log('\n3️⃣ Testing manual organization insert...')
    const testOrgId = crypto.randomUUID()
    const testUserId = crypto.randomUUID()
    
    const { data: newOrg, error: insertOrgError } = await supabase
      .from('organizations')
      .insert({
        id: testOrgId,
        name: 'Test Org',
        owner_id: testUserId,
        subscription_status: 'active'
      })
      .select()
    
    if (insertOrgError) {
      console.error('❌ Failed to insert test organization:', insertOrgError.message)
      console.error('   This might be the same error the trigger is hitting')
      
      // Check if subscription_status column exists
      console.log('\n4️⃣ Checking if subscription_status column exists...')
      const { data: orgColumns, error: colError } = await supabase
        .rpc('exec_sql', {
          query: `SELECT column_name FROM information_schema.columns WHERE table_name = 'organizations' AND table_schema = 'public';`
        })
      
      if (colError) {
        console.log('⚠️  Could not check columns, trying without subscription_status...')
        
        // Try insert without subscription_status
        const { data: newOrgSimple, error: insertOrgSimpleError } = await supabase
          .from('organizations')
          .insert({
            id: crypto.randomUUID(),
            name: 'Test Org Simple',
            owner_id: testUserId
          })
          .select()
        
        if (insertOrgSimpleError) {
          console.error('❌ Even simple insert failed:', insertOrgSimpleError.message)
        } else {
          console.log('✅ Simple organization insert worked!')
          console.log('   Issue: subscription_status column might not exist')
        }
      }
      
    } else {
      console.log('✅ Test organization created successfully')
      
      // Clean up
      await supabase.from('organizations').delete().eq('id', testOrgId)
    }
    
    // Test if we can create an auth user manually
    console.log('\n5️⃣ Testing manual auth user creation...')
    const testEmail = `test-${Date.now()}@example.com`
    
    const { data: authResult, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'testpass123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Test User'
      }
    })
    
    if (authError) {
      console.error('❌ Failed to create auth user:', authError.message)
    } else {
      console.log('✅ Auth user created successfully')
      console.log(`   User ID: ${authResult.user.id}`)
      
      // Check if profile was created by trigger
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*, organizations(*)')
        .eq('id', authResult.user.id)
        .single()
      
      if (profileError) {
        console.error('❌ Profile was not created by trigger:', profileError.message)
        console.log('   This confirms the trigger is not working')
      } else {
        console.log('✅ Profile created by trigger!')
        console.log(`   Name: ${profile.full_name}`)
        console.log(`   Role: ${profile.role}`)
        console.log(`   Org: ${profile.organizations?.name}`)
      }
      
      // Clean up test user
      await supabase.auth.admin.deleteUser(authResult.user.id)
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

debugSignup()