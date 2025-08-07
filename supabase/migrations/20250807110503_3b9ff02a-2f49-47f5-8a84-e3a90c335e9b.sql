-- Add enabled categories configuration for organizations
-- This will allow each organization to have its own set of enabled categories

-- Insert default enabled categories for existing organizations
DO $$
DECLARE
    org_record RECORD;
    informatica_categories TEXT[] := ARRAY['informatica', 'electronica', 'accesorios_tecnologia'];
    forrajeria_categories TEXT[] := ARRAY['forrajeria', 'mascotas', 'veterinarios', 'limpieza', 'bebidas'];
BEGIN
    FOR org_record IN SELECT id, name FROM organizations LOOP
        -- Check if organization name contains "informática" or similar
        IF LOWER(org_record.name) LIKE '%informática%' OR LOWER(org_record.name) LIKE '%informatica%' THEN
            -- Set informática categories for tech stores
            INSERT INTO system_configurations (organization_id, config_type, config_key, config_value, created_by)
            VALUES (
                org_record.id,
                'category_settings',
                'enabled_categories',
                to_jsonb(informatica_categories),
                (SELECT id FROM auth.users LIMIT 1)
            )
            ON CONFLICT (organization_id, config_type, config_key) DO UPDATE
            SET config_value = EXCLUDED.config_value, updated_at = now();
        ELSE
            -- Set forrajería categories for other stores
            INSERT INTO system_configurations (organization_id, config_type, config_key, config_value, created_by)
            VALUES (
                org_record.id,
                'category_settings',
                'enabled_categories',
                to_jsonb(forrajeria_categories),
                (SELECT id FROM auth.users LIMIT 1)
            )
            ON CONFLICT (organization_id, config_type, config_key) DO UPDATE
            SET config_value = EXCLUDED.config_value, updated_at = now();
        END IF;
    END LOOP;
END $$;