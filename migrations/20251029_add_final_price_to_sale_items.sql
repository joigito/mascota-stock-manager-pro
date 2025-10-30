-- Add the final_unit_price column to the sale_items table to store the actual price a product was sold for.
ALTER TABLE public.sale_items
ADD COLUMN final_unit_price NUMERIC NOT NULL DEFAULT 0;

-- Comments: 
-- The new column 'final_unit_price' will store the effective selling price per unit, 
-- which can be different from the product's list price due to discounts or surcharges.
-- The existing 'price' column will keep the historical list price at the time of sale.

-- Backfill existing data:
-- For past sales, we assume the final price was the same as the list price.
-- This ensures that historical sales data remains consistent.
UPDATE public.sale_items
SET final_unit_price = price;
