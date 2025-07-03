-- LIMPIEZA COMPLETA DE MULTI-TENANT - RETORNO A SINGLE TENANT

-- 1. Eliminar todas las políticas RLS relacionadas con tenants
DROP POLICY IF EXISTS "Users can view customers in their tenants" ON public.customers;
DROP POLICY IF EXISTS "Users can create customers in their tenants" ON public.customers;
DROP POLICY IF EXISTS "Users can update customers in their tenants" ON public.customers;
DROP POLICY IF EXISTS "Users can delete customers in their tenants" ON public.customers;

DROP POLICY IF EXISTS "Users can view products in their tenants" ON public.products;
DROP POLICY IF EXISTS "Users can create products in their tenants" ON public.products;
DROP POLICY IF EXISTS "Users can update products in their tenants" ON public.products;
DROP POLICY IF EXISTS "Users can delete products in their tenants" ON public.products;

DROP POLICY IF EXISTS "Users can view sales in their tenants" ON public.sales;
DROP POLICY IF EXISTS "Users can create sales in their tenants" ON public.sales;
DROP POLICY IF EXISTS "Users can update sales in their tenants" ON public.sales;
DROP POLICY IF EXISTS "Users can delete sales in their tenants" ON public.sales;

DROP POLICY IF EXISTS "Users can view sale items in their tenants" ON public.sale_items;
DROP POLICY IF EXISTS "Users can create sale items in their tenants" ON public.sale_items;
DROP POLICY IF EXISTS "Users can update sale items in their tenants" ON public.sale_items;
DROP POLICY IF EXISTS "Users can delete sale items in their tenants" ON public.sale_items;

DROP POLICY IF EXISTS "Users can view product audit in their tenants" ON public.product_audit;
DROP POLICY IF EXISTS "Users can create product audit in their tenants" ON public.product_audit;

-- 2. Eliminar columnas tenant_id de todas las tablas
ALTER TABLE public.customers DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE public.products DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE public.sales DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE public.sale_items DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE public.product_audit DROP COLUMN IF EXISTS tenant_id;

-- 3. Eliminar tablas multi-tenant completamente
DROP TABLE IF EXISTS public.tenant_audit_logs CASCADE;
DROP TABLE IF EXISTS public.tenant_invitations CASCADE;
DROP TABLE IF EXISTS public.user_tenants CASCADE;
DROP TABLE IF EXISTS public.tenants CASCADE;

-- 4. Eliminar funciones multi-tenant
DROP FUNCTION IF EXISTS public.get_user_tenant_ids(uuid);
DROP FUNCTION IF EXISTS public.user_has_role_in_tenant(uuid, uuid, user_role);
DROP FUNCTION IF EXISTS public.is_super_admin(uuid);
DROP FUNCTION IF EXISTS public.bootstrap_user_to_tenant(uuid);
DROP FUNCTION IF EXISTS public.log_audit_event(uuid, uuid, text, text, text, jsonb, jsonb);

-- 5. Eliminar enum user_role si existe
DROP TYPE IF EXISTS public.user_role CASCADE;

-- 6. Restaurar políticas RLS originales simples basadas en user_id

-- Políticas para customers
CREATE POLICY "Users can view their own customers" 
ON public.customers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own customers" 
ON public.customers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customers" 
ON public.customers 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customers" 
ON public.customers 
FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas para products (mantener las existentes que son correctas)
-- Ya existen: "Users can insert their own products"

-- Políticas para sales (mantener las existentes que son correctas)
-- Ya existe: "Users can view their own sales", etc.

-- Políticas para sale_items (mantener las existentes que son correctas)
-- Ya existen: "Users can view their sale items", etc.

-- Políticas para product_audit (mantener las existentes que son correctas) 
-- Ya existe: "Users can view their own audit logs"