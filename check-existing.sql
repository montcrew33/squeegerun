-- Check what invoice tables already exist
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('invoices', 'invoice_line_items')
ORDER BY table_name, ordinal_position;