-- Add unique constraints for SKU fields and create SKU generation functions

-- First, add unique constraints for SKUs within organization scope
ALTER TABLE products ADD CONSTRAINT unique_base_sku_per_org 
UNIQUE (base_sku, organization_id);

ALTER TABLE product_variants ADD CONSTRAINT unique_variant_sku_per_org 
UNIQUE (sku, organization_id);

-- Create function to generate automatic SKU for products
CREATE OR REPLACE FUNCTION generate_product_sku(
    product_name text,
    category text,
    org_id uuid
) RETURNS text AS $$
DECLARE
    base_sku text;
    counter integer := 1;
    final_sku text;
BEGIN
    -- Clean and format the base SKU from name and category
    base_sku := UPPER(
        REPLACE(
            REPLACE(
                REPLACE(LEFT(category, 3) || '-' || LEFT(product_name, 8), ' ', ''),
                'Á', 'A'), 'É', 'E'), 'Í', 'I'
        )
    );
    
    -- Remove special characters
    base_sku := REGEXP_REPLACE(base_sku, '[^A-Z0-9-]', '', 'g');
    
    -- Ensure uniqueness by adding counter if needed
    final_sku := base_sku || '-' || LPAD(counter::text, 3, '0');
    
    WHILE EXISTS (
        SELECT 1 FROM products 
        WHERE base_sku = final_sku 
        AND organization_id = org_id
    ) LOOP
        counter := counter + 1;
        final_sku := base_sku || '-' || LPAD(counter::text, 3, '0');
    END LOOP;
    
    RETURN final_sku;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate variant SKU
CREATE OR REPLACE FUNCTION generate_variant_sku(
    base_sku text,
    color text DEFAULT NULL,
    size text DEFAULT NULL,
    org_id uuid DEFAULT NULL
) RETURNS text AS $$
DECLARE
    variant_sku text;
    counter integer := 1;
    final_sku text;
BEGIN
    variant_sku := base_sku;
    
    -- Add color if provided
    IF color IS NOT NULL AND color != '' THEN
        variant_sku := variant_sku || '-' || UPPER(LEFT(color, 3));
    END IF;
    
    -- Add size if provided  
    IF size IS NOT NULL AND size != '' THEN
        variant_sku := variant_sku || '-' || UPPER(REPLACE(size, ' ', ''));
    END IF;
    
    -- If no variants specified, add a generic identifier
    IF variant_sku = base_sku THEN
        variant_sku := variant_sku || '-V';
    END IF;
    
    final_sku := variant_sku;
    
    -- Ensure uniqueness if org_id provided
    IF org_id IS NOT NULL THEN
        WHILE EXISTS (
            SELECT 1 FROM product_variants 
            WHERE sku = final_sku 
            AND organization_id = org_id
        ) LOOP
            counter := counter + 1;
            final_sku := variant_sku || '-' || counter;
        END LOOP;
    END IF;
    
    RETURN final_sku;
END;
$$ LANGUAGE plpgsql;