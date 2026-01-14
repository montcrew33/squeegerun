-- Step 3: Enable RLS and create policies (run this after step 2 succeeds)
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users" ON invoices
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all for authenticated users" ON invoice_line_items  
  FOR ALL USING (auth.uid() IS NOT NULL);