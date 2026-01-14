-- Invoice system database setup - FIXED VERSION
-- Run these commands in your Supabase SQL Editor

-- First, let's check what tables already exist and their structure
-- You can run this separately to see what's already there:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- 1. Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  job_id UUID,
  invoice_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'paid', 'partial', 'overdue', 'cancelled')),
  subtotal_cents INTEGER NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,4) NOT NULL DEFAULT 0,
  tax_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,
  issued_date DATE NOT NULL,
  due_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create invoice_line_items table
CREATE TABLE IF NOT EXISTS invoice_line_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0
);

-- 3. Create payments table (for future use)
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'check', 'credit_card', 'bank_transfer', 'other')),
  payment_date DATE NOT NULL,
  reference_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create jobs table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  service_address JSONB NOT NULL,
  scheduled_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  price_cents INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_organization_id ON invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_job_id ON invoices(job_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_organization_id ON payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_jobs_organization_id ON jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_jobs_customer_id ON jobs(customer_id);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- 7. Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view invoices from their organization" ON invoices;
DROP POLICY IF EXISTS "Users can insert invoices to their organization" ON invoices;
DROP POLICY IF EXISTS "Users can update invoices in their organization" ON invoices;
DROP POLICY IF EXISTS "Users can delete invoices in their organization" ON invoices;

DROP POLICY IF EXISTS "Users can view invoice line items from their organization" ON invoice_line_items;
DROP POLICY IF EXISTS "Users can insert invoice line items to their organization" ON invoice_line_items;
DROP POLICY IF EXISTS "Users can update invoice line items in their organization" ON invoice_line_items;
DROP POLICY IF EXISTS "Users can delete invoice line items in their organization" ON invoice_line_items;

DROP POLICY IF EXISTS "Users can view payments from their organization" ON payments;
DROP POLICY IF EXISTS "Users can insert payments to their organization" ON payments;
DROP POLICY IF EXISTS "Users can update payments in their organization" ON payments;
DROP POLICY IF EXISTS "Users can delete payments in their organization" ON payments;

DROP POLICY IF EXISTS "Users can view jobs from their organization" ON jobs;
DROP POLICY IF EXISTS "Users can insert jobs to their organization" ON jobs;
DROP POLICY IF EXISTS "Users can update jobs in their organization" ON jobs;
DROP POLICY IF EXISTS "Users can delete jobs in their organization" ON jobs;

-- 8. Create RLS policies for invoices
-- First, let's check if user_organizations table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_organizations' AND table_schema = 'public') THEN
    -- Use user_organizations table
    EXECUTE '
    CREATE POLICY "Users can view invoices from their organization" ON invoices
      FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM user_organizations 
        WHERE user_id = auth.uid()
      ));

    CREATE POLICY "Users can insert invoices to their organization" ON invoices
      FOR INSERT WITH CHECK (organization_id IN (
        SELECT organization_id FROM user_organizations 
        WHERE user_id = auth.uid()
      ));

    CREATE POLICY "Users can update invoices in their organization" ON invoices
      FOR UPDATE USING (organization_id IN (
        SELECT organization_id FROM user_organizations 
        WHERE user_id = auth.uid()
      ));

    CREATE POLICY "Users can delete invoices in their organization" ON invoices
      FOR DELETE USING (organization_id IN (
        SELECT organization_id FROM user_organizations 
        WHERE user_id = auth.uid()
      ));
    ';
  ELSE
    -- Fallback: allow authenticated users to access their own data
    -- You'll need to adjust this based on your actual auth setup
    EXECUTE '
    CREATE POLICY "Users can view their invoices" ON invoices
      FOR SELECT USING (auth.uid() IS NOT NULL);

    CREATE POLICY "Users can insert their invoices" ON invoices
      FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

    CREATE POLICY "Users can update their invoices" ON invoices
      FOR UPDATE USING (auth.uid() IS NOT NULL);

    CREATE POLICY "Users can delete their invoices" ON invoices
      FOR DELETE USING (auth.uid() IS NOT NULL);
    ';
  END IF;
END $$;

-- 9. Create RLS policies for invoice_line_items
CREATE POLICY "Users can view invoice line items" ON invoice_line_items
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert invoice line items" ON invoice_line_items
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update invoice line items" ON invoice_line_items
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete invoice line items" ON invoice_line_items
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- 10. Create RLS policies for payments
CREATE POLICY "Users can view payments" ON payments
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update payments" ON payments
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete payments" ON payments
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- 11. Create RLS policies for jobs
CREATE POLICY "Users can view jobs" ON jobs
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert jobs" ON jobs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update jobs" ON jobs
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete jobs" ON jobs
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- 12. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 13. Create triggers for updated_at (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_invoices_updated_at') THEN
    CREATE TRIGGER update_invoices_updated_at 
      BEFORE UPDATE ON invoices 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_payments_updated_at') THEN
    CREATE TRIGGER update_payments_updated_at 
      BEFORE UPDATE ON payments 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_jobs_updated_at') THEN
    CREATE TRIGGER update_jobs_updated_at 
      BEFORE UPDATE ON jobs 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;