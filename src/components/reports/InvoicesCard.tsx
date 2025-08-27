import { FileText, Printer, Eye, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useInvoices } from "@/hooks/useInvoices";
import { useToast } from "@/hooks/use-toast";

const InvoicesCard = () => {
  const { invoices, loading } = useInvoices();
  const { toast } = useToast();

  const formatInvoiceNumber = (number: number, puntoVenta: number) => {
    return `${String(puntoVenta).padStart(4, '0')}-${String(number).padStart(8, '0')}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pendiente</Badge>;
      case 'approved':
        return <Badge variant="default">Aprobada</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rechazada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getInvoiceType = (tipo: number) => {
    switch (tipo) {
      case 1: return 'Factura A';
      case 6: return 'Factura B';
      case 11: return 'Factura C';
      case 3: return 'Nota de Crédito A';
      case 8: return 'Nota de Crédito B';
      case 13: return 'Nota de Crédito C';
      default: return `Tipo ${tipo}`;
    }
  };

  const handlePrintInvoice = (invoiceId: string, invoiceNumber: number, puntoVenta: number) => {
    // Por ahora mostrar un mensaje, más adelante implementaremos la impresión
    toast({
      title: "Función de impresión",
      description: `Impresión de factura ${formatInvoiceNumber(invoiceNumber, puntoVenta)} estará disponible próximamente`,
    });
  };

  const handleViewInvoice = (invoiceId: string, invoiceNumber: number, puntoVenta: number) => {
    toast({
      title: "Vista previa",
      description: `Vista previa de factura ${formatInvoiceNumber(invoiceNumber, puntoVenta)} estará disponible próximamente`,
    });
  };

  const handleDownloadInvoice = (invoiceId: string, invoiceNumber: number, puntoVenta: number) => {
    toast({
      title: "Descarga",
      description: `Descarga de factura ${formatInvoiceNumber(invoiceNumber, puntoVenta)} estará disponible próximamente`,
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Facturas Electrónicas</CardTitle>
          <CardDescription>Cargando facturas...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Facturas Electrónicas</CardTitle>
        <CardDescription>
          Gestiona tus facturas electrónicas generadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay facturas generadas aún</p>
            <p className="text-sm mt-2">Las facturas aparecerán aquí cuando generes facturas desde las ventas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex justify-between items-center p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="font-semibold text-lg">
                      {formatInvoiceNumber(invoice.invoice_number, invoice.punto_venta)}
                    </div>
                    {getStatusBadge(invoice.estado)}
                    <Badge variant="outline">
                      {getInvoiceType(invoice.tipo_comprobante)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Fecha:</span> {new Date(invoice.fecha_emision).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Total:</span> ${invoice.importe_total.toLocaleString()}
                    </div>
                    {invoice.cae && (
                      <div>
                        <span className="font-medium">CAE:</span> {invoice.cae}
                      </div>
                    )}
                  </div>
                  {invoice.observaciones && (
                    <div className="text-sm text-gray-500 mt-1">
                      {invoice.observaciones}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewInvoice(invoice.id, invoice.invoice_number, invoice.punto_venta)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePrintInvoice(invoice.id, invoice.invoice_number, invoice.punto_venta)}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadInvoice(invoice.id, invoice.invoice_number, invoice.punto_venta)}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoicesCard;