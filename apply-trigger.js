const { createClient } = require('@supabase/supabase-js')

async function applyTrigger() {
  require('dotenv').config({ path: '.env.local' })
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  const supabase = createClient(supabaseUrl, serviceRoleKey)
  
  console.log('🔧 Applying trigger function manually...\n')
  
  try {
    // First, let's check if the trigger already exists
    console.log('1️⃣ Checking existing triggers...')
    const { data: existingTriggers, error: checkError } = await supabase
      .rpc('exec_sql', { 
        query: `
          SELECT tgname 
          FROM pg_trigger 
          WHERE tgname = 'on_auth_user_created';
        `
      })
    
    if (checkError && !checkError.message.includes('function "exec_sql" does not exist')) {
      console.error('❌ Error checking triggers:', checkError.message)
      return
    }
    
    // Create the trigger function
    console.log('2️⃣ Creating trigger function...')
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION handle_new_user()
      RETURNS TRIGGER AS $$
      DECLARE
          new_org_id uuid;
      BEGIN
          -- Create a new organization for the user
          INSERT INTO organizations (name, owner_id, subscription_status)
          VALUES ('My Business', NEW.id, 'active')
          RETURNING id INTO new_org_id;

          -- Create a profile for the user linked to the organization
          INSERT INTO profiles (id, organization_id, role, full_name)
          VALUES (NEW.id, new_org_id, 'owner', COALESCE(NEW.raw_user_meta_data->>'full_name', ''));

          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `
    
    // Use the Supabase SQL editor functionality
    const { data: functionResult, error: functionError } = await supabase
      .rpc('exec_sql', { query: createFunctionSQL })
    
    if (functionError && !functionError.message.includes('function "exec_sql" does not exist')) {
      console.error('❌ Error creating function:', functionError.message)
      console.log('   The function might need to be created in Supabase Dashboard SQL Editor')
    } else {
      console.log('✅ Function created/updated')
    }
    
    // Create the trigger
    console.log('3️⃣ Creating trigger...')
    const createTriggerSQL = `
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW
          EXECUTE FUNCTION handle_new_user();
    `
    
    const { data: triggerResult, error: triggerError } = await supabase
      .rpc('exec_sql', { query: createTriggerSQL })
    
    if (triggerError && !triggerError.message.includes('function "exec_sql" does not exist')) {
      console.error('❌ Error creating trigger:', triggerError.message)
      console.log('   The trigger might need to be created in Supabase Dashboard SQL Editor')
    } else {
      console.log('✅ Trigger created/updated')
    }
    
    if (functionError || triggerError) {
      console.log('\n📝 Manual Setup Required:')
      console.log('   1. Go to Supabase Dashboard > SQL Editor')
      console.log('   2. Run this SQL:')
      console.log('\n' + createFunctionSQL)
      console.log('\n' + createTriggerSQL)
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    
    console.log('\n📝 Manual Setup Required:')
    console.log('   1. Go to https://supabase.com/dashboard')
    console.log('   2. Open your project > SQL Editor')
    console.log('   3. Copy and run the trigger SQL from: supabase/migrations/001_initial_schema.sql')
    console.log('   4. Lines 278-300 contain the handle_new_user function and trigger')
  }
}

applyTrigger()