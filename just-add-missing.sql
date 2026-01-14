-- Add only what's missing to existing tables

-- First, let's see what's in the invoices table
-- \d invoices

-- Add missing columns to invoices table if they don't exist
DO $$
BEGIN
    -- Add invoice_number if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='invoice_number') THEN
        ALTER TABLE invoices ADD COLUMN invoice_number TEXT;
    END IF;
    
    -- Add status if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='status') THEN
        ALTER TABLE invoices ADD COLUMN status TEXT DEFAULT 'draft';
    END IF;
    
    -- Add money fields if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='subtotal_cents') THEN
        ALTER TABLE invoices ADD COLUMN subtotal_cents INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='tax_rate') THEN
        ALTER TABLE invoices ADD COLUMN tax_rate NUMERIC DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='tax_cents') THEN
        ALTER TABLE invoices ADD COLUMN tax_cents INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='total_cents') THEN
        ALTER TABLE invoices ADD COLUMN total_cents INTEGER DEFAULT 0;
    END IF;
    
    -- Add date fields if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='issued_date') THEN
        ALTER TABLE invoices ADD COLUMN issued_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='due_date') THEN
        ALTER TABLE invoices ADD COLUMN due_date DATE;
    END IF;
    
    -- Add notes if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='notes') THEN
        ALTER TABLE invoices ADD COLUMN notes TEXT;
    END IF;
END $$;

-- Create invoice_line_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS invoice_line_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC DEFAULT 1,
    unit_price_cents INTEGER DEFAULT 0,
    total_cents INTEGER DEFAULT 0
);

-- Enable RLS if not already enabled
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;

-- Create simple policies (drop first in case they exist)
DROP POLICY IF EXISTS "Allow all for authenticated users" ON invoices;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON invoice_line_items;

CREATE POLICY "Allow all for authenticated users" ON invoices
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all for authenticated users" ON invoice_line_items
    FOR ALL USING (auth.uid() IS NOT NULL);