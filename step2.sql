-- Step 2: Create invoice line items table (run this after step 1 succeeds)
CREATE TABLE invoice_line_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id),
  description TEXT NOT NULL,
  quantity NUMERIC DEFAULT 1,
  unit_price_cents INTEGER DEFAULT 0,
  total_cents INTEGER DEFAULT 0
);