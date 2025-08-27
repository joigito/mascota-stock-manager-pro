import { useState, useEffect } from "react";
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

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentOrganization } = useOrganization();
  const { toast } = useToast();

  const loadInvoices = async () => {
    if (!currentOrganization?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNextInvoiceNumber = async (puntoVenta: number = 1, tipoComprobante: number = 6) => {
    if (!currentOrganization?.id) return 1;

    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('invoice_number')
        .eq('organization_id', currentOrganization.id)
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
    if (!currentOrganization?.id) {
      throw new Error('No organization selected');
    }

    try {
      setLoading(true);

      // Obtener el siguiente número de factura
      const nextNumber = await getNextInvoiceNumber();

      // Calcular montos (por ahora sin IVA, como facturas de tipo C)
      const importeNeto = sale.total;
      const importeIva = 0; // Para facturas tipo C no hay IVA discriminado
      const importeExento = 0;
      const importeTotal = importeNeto + importeIva;

      const invoiceData = {
        organization_id: currentOrganization.id,
        sale_id: sale.id,
        invoice_number: nextNumber,
        punto_venta: 1, // Por defecto, se puede configurar más adelante
        tipo_comprobante: 11, // Factura C (sin discriminar IVA)
        fecha_emision: new Date().toISOString().split('T')[0],
        importe_total: importeTotal,
        importe_neto: importeNeto,
        importe_iva: importeIva,
        importe_exento: importeExento,
        created_by: currentOrganization.id,
        estado: 'pending',
        observaciones: `Factura generada para venta de ${sale.customer} - ${sale.items.length} productos`
      };

      const { data, error } = await supabase
        .from('invoices')
        .insert([invoiceData])
        .select()
        .maybeSingle();

      if (error) throw error;

      // Actualizar la lista local
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
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [currentOrganization?.id]);

  return {
    invoices,
    loading,
    createInvoiceFromSale,
    loadInvoices
  };
};