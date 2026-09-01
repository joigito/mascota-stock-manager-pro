import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "./useOrganization";
import { Sale } from "@/types/sales";
import { useToast } from "@/components/ui/use-toast";

interface Invoice {
  id: string;
  organization_id: string;
  sale_id: string;
  invoice_number: number;
  punto_venta: number;
  tipo_comprobante: number;
  fecha_emision: string;
  fecha_vto_cae: string | null;
  importe_total: number;
  importe_neto: number;
  importe_iva: number;
  importe_exento: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  qr_data: string | null;
  cae: string | null;
  pdf_path: string | null;
  estado: string;
  observaciones: string | null;
}

const invoicesKey = (orgId: string) => ['invoices', orgId] as const;

export const useInvoices = () => {
  const [creating, setCreating] = useState(false);
  const { currentOrganization } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const orgId = currentOrganization?.id;

  const query = useQuery({
    queryKey: invoicesKey(orgId || 'none'),
    queryFn: async (): Promise<Invoice[]> => {
      if (!orgId) return [];

      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
  });

  const invoices = query.data ?? [];

  const loadInvoices = async () => {
    await queryClient.refetchQueries({ queryKey: invoicesKey(orgId || 'none') });
  };

  const getNextInvoiceNumber = async (puntoVenta: number = 1, tipoComprobante: number = 6) => {
    if (!orgId) return 1;

    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('invoice_number')
        .eq('organization_id', orgId)
        .eq('punto_venta', puntoVenta)
        .eq('tipo_comprobante', tipoComprobante)
        .order('invoice_number', { ascending: false })
        .limit(1);

      if (error) throw error;

      return (data && data.length > 0) ? data[0].invoice_number + 1 : 1;
    } catch (error) {
      console.error('Error getting next invoice number:', error);
      return 1;
    }
  };

  const createInvoiceFromSale = async (sale: Sale) => {
    if (!orgId) {
      throw new Error('No organization selected');
    }

    try {
      setCreating(true);

      const nextNumber = await getNextInvoiceNumber();

      const importeNeto = sale.total;
      const importeIva = 0;
      const importeExento = 0;
      const importeTotal = importeNeto + importeIva;

      const invoiceData = {
        organization_id: orgId,
        sale_id: sale.id,
        invoice_number: nextNumber,
        punto_venta: 1,
        tipo_comprobante: 11,
        fecha_emision: new Date().toISOString().split('T')[0],
        importe_total: importeTotal,
        importe_neto: importeNeto,
        importe_iva: importeIva,
        importe_exento: importeExento,
        created_by: orgId,
        estado: 'pending',
        observaciones: `Factura generada para venta de ${sale.customer} - ${sale.items.length} productos`
      };

      const { data, error } = await supabase
        .from('invoices')
        .insert([invoiceData])
        .select()
        .maybeSingle();

      if (error) throw error;

      await loadInvoices();

      toast({
        title: "Factura creada",
        description: `Factura N° ${String(nextNumber).padStart(8, '0')} generada exitosamente`,
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      toast({
        title: "Error",
        description: `No se pudo crear la factura: ${error.message}`,
        variant: "destructive",
      });
      return { data: null, error };
    } finally {
      setCreating(false);
    }
  };

  return {
    invoices,
    loading: creating || (query.isLoading && !query.data),
    createInvoiceFromSale,
    loadInvoices
  };
};