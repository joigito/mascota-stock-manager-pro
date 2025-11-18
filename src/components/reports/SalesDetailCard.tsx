import { useState, useEffect } from "react";
import { FileText, Printer } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSalesData } from "@/hooks/useSalesData";
import DateRangeSelector from "./DateRangeSelector";

const SalesDetailCard = () => {
  const { getSalesForReport, loading } = useSalesData();
  
  // Default to current month
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1); // First day of current month
    return date.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    date.setDate(0); // Last day of current month
    return date.toISOString().split('T')[0];
  });

  const [reportSales, setReportSales] = useState<any[]>([]);

  // Automatically generate report when sales data is loaded
  useEffect(() => {
    if (!loading) {
      const sales = getSalesForReport(startDate, endDate);
      setReportSales(sales);
    }
  }, [loading, startDate, endDate, getSalesForReport]);

  const handleGenerateReport = () => {
    const sales = getSalesForReport(startDate, endDate);
    setReportSales(sales);
  };

  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Detalle de Ventas</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; margin-bottom: 10px; }
            .period { text-align: center; color: #666; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .text-right { text-align: right; }
            .summary { margin-top: 30px; display: flex; justify-content: space-between; }
            .summary-item { font-weight: bold; }
            @media print {
              body { margin: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Detalle de Ventas</h1>
          <p class="period">Período: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}</p>
          
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Producto</th>
                <th class="text-right">Cantidad</th>
                <th class="text-right">Importe</th>
                <th class="text-right">Total Venta</th>
              </tr>
            </thead>
            <tbody>
              ${detailedRows.map(row => `
                <tr>
                  <td>${new Date(row.date).toLocaleDateString()}</td>
                  <td>${row.customer}</td>
                  <td>
                    ${row.product}
                    ${row.variantInfo ? `<span style="color: #666; font-size: 0.9em;"> (${row.variantInfo})</span>` : ''}
                  </td>
                  <td class="text-right">${row.quantity}</td>
                  <td class="text-right">$${row.itemTotal.toLocaleString()}</td>
                  <td class="text-right">
                    ${row.isFirstItem ? `$${row.saleTotal.toLocaleString()}` : '—'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="summary">
            <div class="summary-item">
              ${reportSales.length} ${reportSales.length === 1 ? 'venta' : 'ventas'} con ${detailedRows.length} ${detailedRows.length === 1 ? 'producto' : 'productos'}
            </div>
            <div class="summary-item">
              Total del período: $${reportSales.reduce((sum, sale) => sum + sale.total, 0).toLocaleString()}
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Flatten sales to show each item in a separate row
  const detailedRows = reportSales.flatMap(sale => 
    sale.items.map((item, index) => ({
      saleId: sale.id,
      date: sale.date,
      customer: sale.customer,
      product: item.productName,
      variantInfo: item.variantInfo,
      quantity: item.quantity,
      itemTotal: item.subtotal,
      saleTotal: sale.total,
      isFirstItem: index === 0,
      itemCount: sale.items.length
    }))
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Detalle de Ventas</span>
            </CardTitle>
            <CardDescription>
              Listado completo de productos vendidos por período
            </CardDescription>
          </div>
          {detailedRows.length > 0 && (
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <DateRangeSelector
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onGenerateReport={handleGenerateReport}
        />

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : detailedRows.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay ventas en el período seleccionado</p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Importe</TableHead>
                  <TableHead className="text-right">Total Venta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailedRows.map((row, idx) => (
                  <TableRow key={`${row.saleId}-${idx}`}>
                    <TableCell className="text-sm">
                      {new Date(row.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{row.customer}</TableCell>
                    <TableCell>
                      {row.product}
                      {row.variantInfo && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({row.variantInfo})
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{row.quantity}</TableCell>
                    <TableCell className="text-right font-medium">
                      ${row.itemTotal.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {row.isFirstItem && (
                        <span>${row.saleTotal.toLocaleString()}</span>
                      )}
                      {!row.isFirstItem && row.itemCount > 1 && (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {detailedRows.length > 0 && (
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {reportSales.length} {reportSales.length === 1 ? 'venta' : 'ventas'} con {detailedRows.length} {detailedRows.length === 1 ? 'producto' : 'productos'}
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Total del período</div>
              <div className="text-2xl font-bold">
                ${reportSales.reduce((sum, sale) => sum + sale.total, 0).toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SalesDetailCard;
