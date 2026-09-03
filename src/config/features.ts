import { FileText, Users, BarChart3, Layers } from 'lucide-react';

export interface FeatureDefinition {
  key: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'ventas' | 'inventario' | 'clientes' | 'reportes';
}

export const FEATURES: Record<string, FeatureDefinition> = {
  electronic_invoicing: {
    key: 'electronic_invoicing',
    name: 'Facturación Electrónica',
    description: 'Habilitar facturación AFIP con puntos de venta y generación de comprobantes',
    icon: FileText,
    category: 'ventas',
  },
  current_account: {
    key: 'current_account',
    name: 'Cuentas Corrientes',
    description: 'Gestionar saldos y movimientos de cuentas corrientes de clientes',
    icon: Users,
    category: 'clientes',
  },
  use_variants: {
    key: 'use_variants',
    name: 'Variantes de Producto',
    description: 'Manejar variantes de productos con atributos personalizados (talle, color, etc.)',
    icon: Layers,
    category: 'inventario',
  },
  advanced_reports: {
    key: 'advanced_reports',
    name: 'Reportes Avanzados',
    description: 'Reportes detallados de ventas, márgenes y rotación de stock',
    icon: BarChart3,
    category: 'reportes',
  },
};

export const FEATURE_KEYS = Object.keys(FEATURES);

export const FEATURES_BY_CATEGORY = Object.values(FEATURES).reduce(
  (acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  },
  {} as Record<string, FeatureDefinition[]>
);
