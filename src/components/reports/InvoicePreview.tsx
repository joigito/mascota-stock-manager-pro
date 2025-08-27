import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useOrganization } from "@/hooks/useOrganization";

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

interface InvoicePreviewProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
}

const InvoicePreview = ({ invoice, isOpen, onClose, onPrint }: InvoicePreviewProps) => {
  const { currentOrganization } = useOrganization();

  if (!invoice) return null;

  const formatInvoiceNumber = (number: number, puntoVenta: number) => {
    return `${String(puntoVenta).padStart(4, "0")}-${String(number).padStart(8, "0")}`;
  };

  const getInvoiceType = (tipo: number) => {
    switch (tipo) {
      case 1: return "Factura A";
      case 6: return "Factura B";
      case 11: return "Factura C";
      case 3: return "Nota de Crédito A";
      case 8: return "Nota de Crédito B";
      case 13: return "Nota de Crédito C";
      default: return `Tipo ${tipo}`;
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("invoice-print-content");
    if (printContent) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Factura ${formatInvoiceNumber(invoice.invoice_number, invoice.punto_venta)}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .invoice-header { text-align: center; margin-bottom: 30px; }
                .invoice-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
                .invoice-details { margin-bottom: 30px; }
                .totals { margin-top: 30px; text-align: right; }
                .cae-info { margin-top: 20px; border: 1px solid #ccc; padding: 10px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f5f5f5; }
                @media print { .no-print { display: none; } }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }
    }
    onPrint();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            Vista Previa de Factura
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div id="invoice-print-content" className="space-y-6 p-6 bg-white">
          {/* Header */}
          <div className="invoice-header text-center border-b pb-6">
            <h1 className="text-2xl font-bold">{currentOrganization?.name || "Empresa"}</h1>
            <p className="text-gray-600 mt-2">Factura Electrónica</p>
            <div className="mt-4 text-lg font-semibold">
              {getInvoiceType(invoice.tipo_comprobante)}
            </div>
            <div className="text-xl font-bold text-blue-600 mt-2">
              N° {formatInvoiceNumber(invoice.invoice_number, invoice.punto_venta)}
            </div>
          </div>

          {/* Invoice Info */}
          <div className="invoice-info grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Datos del Emisor:</h3>
              <p>{currentOrganization?.name || "Empresa"}</p>
              <p className="text-sm text-gray-600">CUIT: Pendiente configuración</p>
              <p className="text-sm text-gray-600">Punto de Venta: {invoice.punto_venta}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Datos de la Factura:</h3>
              <p><strong>Fecha:</strong> {new Date(invoice.fecha_emision).toLocaleDateString()}</p>
              <p><strong>Estado:</strong> {invoice.estado === "pending" ? "Pendiente" : invoice.estado}</p>
              {invoice.fecha_vto_cae && (
                <p><strong>Vencimiento CAE:</strong> {new Date(invoice.fecha_vto_cae).toLocaleDateString()}</p>
              )}
            </div>
          </div>

          {/* Client Info */}
          <div className="invoice-details border-t pt-4">
            <h3 className="font-semibold mb-2">Cliente:</h3>
            <p>Cliente General</p>
            <p className="text-sm text-gray-600">Condición IVA: Consumidor Final</p>
          </div>

          {/* Items Table */}
          <div>
            <h3 className="font-semibold mb-4">Detalle de Productos/Servicios:</h3>
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border p-2 text-left">Descripción</th>
                  <th className="border p-2 text-right">Cantidad</th>
                  <th className="border p-2 text-right">Precio Unit.</th>
                  <th className="border p-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">Venta general</td>
                  <td className="border p-2 text-right">1</td>
                  <td className="border p-2 text-right">${invoice.importe_neto.toLocaleString()}</td>
                  <td className="border p-2 text-right">${invoice.importe_neto.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="totals border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div></div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${invoice.importe_neto.toLocaleString()}</span>
                </div>
                {invoice.importe_iva > 0 && (
                  <div className="flex justify-between">
                    <span>IVA:</span>
                    <span>${invoice.importe_iva.toLocaleString()}</span>
                  </div>
                )}
                {invoice.importe_exento > 0 && (
                  <div className="flex justify-between">
                    <span>Exento:</span>
                    <span>${invoice.importe_exento.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>TOTAL:</span>
                  <span>${invoice.importe_total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* CAE Info */}
          {invoice.cae && (
            <div className="cae-info border rounded p-4 bg-gray-50">
              <h3 className="font-semibold mb-2">Información de Autorización AFIP:</h3>
              <p><strong>CAE:</strong> {invoice.cae}</p>
              {invoice.fecha_vto_cae && (
                <p><strong>Fecha Vto. CAE:</strong> {new Date(invoice.fecha_vto_cae).toLocaleDateString()}</p>
              )}
            </div>
          )}

          {/* Observations */}
          {invoice.observaciones && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Observaciones:</h3>
              <p className="text-sm">{invoice.observaciones}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 mt-4 no-print">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button onClick={handlePrint}>
            Imprimir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePreview;