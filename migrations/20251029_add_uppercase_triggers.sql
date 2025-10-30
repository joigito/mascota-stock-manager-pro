-- Ensures that specific text fields in the 'products' and 'customers' tables are stored in uppercase.
-- This is achieved by creating trigger functions that automatically convert the relevant column values to uppercase
-- before any insert or update operation.

-- Function to convert product fields to uppercase
CREATE OR REPLACE FUNCTION uppercase_product_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.name IS NOT NULL THEN
        NEW.name := UPPER(NEW.name);
    END IF;
    IF NEW.category IS NOT NULL THEN
        NEW.category := UPPER(NEW.category);
    END IF;
    IF NEW.description IS NOT NULL THEN
        NEW.description := UPPER(NEW.description);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for products table
-- This trigger fires before any insert or update on the 'products' table
-- and calls the uppercase_product_fields function to process the data.
CREATE TRIGGER trigger_uppercase_product_fields
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION uppercase_product_fields();

-- Function to convert customer fields to uppercase
CREATE OR REPLACE FUNCTION uppercase_customer_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.name IS NOT NULL THEN
        NEW.name := UPPER(NEW.name);
    END IF;
    IF NEW.address IS NOT NULL THEN
        NEW.address := UPPER(NEW.address);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for customers table
-- This trigger fires before any insert or update on the 'customers' table
-- and calls the uppercase_customer_fields function to process the data.
CREATE TRIGGER trigger_uppercase_customer_fields
BEFORE INSERT OR UPDATE ON customers
FOR EACH ROW
EXECUTE FUNCTION uppercase_customer_fields();

-- NOTE: The triggers above will only affect new or updated records.
-- To update all existing data to uppercase, you can run the following statements manually.
-- Be cautious with this operation, especially on large datasets.

/*
UPDATE products
SET
  name = UPPER(name),
  category = UPPER(category),
  description = UPPER(description)
WHERE
  name IS NOT NULL OR category IS NOT NULL OR description IS NOT NULL;

UPDATE customers
SET
  name = UPPER(name),
  address = UPPER(address)
WHERE
  name IS NOT NULL OR address IS NOT NULL;
*/
