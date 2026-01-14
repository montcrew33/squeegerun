-- SUPER SIMPLE - Run these ONE AT A TIME in Supabase SQL Editor

-- Step 1: Create invoices table (run this first)
CREATE TABLE invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  job_id UUID,
  invoice_number TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  subtotal_cents INTEGER DEFAULT 0,
  tax_rate NUMERIC DEFAULT 0,
  tax_cents INTEGER DEFAULT 0,
  total_cents INTEGER DEFAULT 0,
  issued_date DATE NOT NULL,
  due_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);