import { useState } from "react";
import { FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSalesData } from "@/hooks/useSalesData";
import DateRangeSelector from "./DateRangeSelector";

const SalesDetailCard = () => {
  const { getSalesForReport } = useSalesData();
  
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

  const [reportSales, setReportSales] = useState(() => {
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return getSalesForReport(
      firstDay.toISOString().split('T')[0],
      lastDay.toISOString().split('T')[0]
    );
  });

  const handleGenerateReport = () => {
    const sales = getSalesForReport(startDate, endDate);
    setReportSales(sales);
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
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Detalle de Ventas</span>
        </CardTitle>
        <CardDescription>
          Listado completo de productos vendidos por período
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <DateRangeSelector
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onGenerateReport={handleGenerateReport}
        />

        {detailedRows.length === 0 ? (
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
