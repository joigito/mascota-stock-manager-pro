-- Add missing categories to the product_category enum
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'informatica';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'accesorios_tecnologia';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'electrodomesticos';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'ferreteria';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'construccion';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'textil';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'calzado';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'juguetes';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'jardineria';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'automotriz';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'bebidas';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'limpieza';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'veterinarios';