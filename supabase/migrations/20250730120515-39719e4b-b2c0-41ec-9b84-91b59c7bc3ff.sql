-- Fase 1: Crear estructura multi-tenant

-- 1. Crear enum para roles de usuario
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'user');

-- 2. Crear tabla de organizaciones (tiendas)
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL -- referencia al usuario que creó la organización
);

-- 3. Crear tabla de roles de usuario
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- 4. Crear tabla de relación usuario-organización
CREATE TABLE public.user_organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user', -- 'admin', 'user'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

-- 5. Crear tabla de invitaciones a organizaciones
CREATE TABLE public.organization_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  token TEXT NOT NULL DEFAULT public.generate_invitation_token(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  used_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(token)
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;

-- Función de seguridad para verificar roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Función para verificar si un usuario pertenece a una organización
CREATE OR REPLACE FUNCTION public.user_belongs_to_org(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_organizations
    WHERE user_id = _user_id
      AND organization_id = _org_id
  )
$$;

-- RLS Policies para organizations
CREATE POLICY "Super admins can view all organizations" 
ON public.organizations 
FOR SELECT 
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view their organizations" 
ON public.organizations 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.user_organizations 
  WHERE user_id = auth.uid() AND organization_id = organizations.id
));

CREATE POLICY "Super admins can create organizations" 
ON public.organizations 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update all organizations" 
ON public.organizations 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies para user_roles
CREATE POLICY "Super admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- RLS Policies para user_organizations
CREATE POLICY "Users can view their organization memberships" 
ON public.user_organizations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all memberships" 
ON public.user_organizations 
FOR ALL 
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Organization admins can manage their org memberships" 
ON public.user_organizations 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_organizations uo 
  WHERE uo.user_id = auth.uid() 
    AND uo.organization_id = user_organizations.organization_id 
    AND uo.role = 'admin'
));

-- RLS Policies para organization_invitations
CREATE POLICY "Super admins can manage all invitations" 
ON public.organization_invitations 
FOR ALL 
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Organization admins can manage their org invitations" 
ON public.organization_invitations 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_organizations uo 
  WHERE uo.user_id = auth.uid() 
    AND uo.organization_id = organization_invitations.organization_id 
    AND uo.role = 'admin'
));

-- Triggers para updated_at
CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Crear índices para performance
CREATE INDEX idx_user_organizations_user_id ON public.user_organizations(user_id);
CREATE INDEX idx_user_organizations_org_id ON public.user_organizations(organization_id);
CREATE INDEX idx_organization_invitations_token ON public.organization_invitations(token);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);