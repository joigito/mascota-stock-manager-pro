-- Migration: add variant_attribute_definitions table and use_variants flag
-- Date: 2025-10-28

-- Add 'size' column to product_variants if it does not exist (backwards compatibility)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='product_variants' AND column_name='size'
    ) THEN
        ALTER TABLE public.product_variants
        ADD COLUMN size text;
    END IF;
END$$;

-- Add use_variants flag to organizations (default true)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='organizations' AND column_name='use_variants'
    ) THEN
        ALTER TABLE public.organizations
        ADD COLUMN use_variants boolean DEFAULT true NOT NULL;
    END IF;
END$$;

-- Create variant_attribute_definitions table to allow per-organization attribute configs
CREATE TABLE IF NOT EXISTS public.variant_attribute_definitions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    key text NOT NULL,
    data_type text NOT NULL DEFAULT 'string', -- 'string' | 'number' | 'enum'
    options jsonb DEFAULT NULL, -- for enums: ["S","M","L"]
    position integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Index for faster lookup by organization
CREATE INDEX IF NOT EXISTS idx_variant_attr_org ON public.variant_attribute_definitions (organization_id);

-- Simple trigger to update updated_at
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS variant_attr_updated_at ON public.variant_attribute_definitions;
CREATE TRIGGER variant_attr_updated_at
BEFORE UPDATE ON public.variant_attribute_definitions
FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();
