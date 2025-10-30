
import { Printer, Package, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DateRangeSelector from "./DateRangeSelector";

interface PrintSectionProps {
  handlePrintStock: () => void;
  salesReportStartDate: string;
  salesReportEndDate: string;
  setSalesReportStartDate: (date: string) => void;
  setSalesReportEndDate: (date: string) => void;
  handlePrintSales: () => void;
}

const PrintSection = ({
  handlePrintStock,
  salesReportStartDate,
  salesReportEndDate,
  setSalesReportStartDate,
  setSalesReportEndDate,
  handlePrintSales
}: PrintSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Printer className="h-5 w-5" />
          <span>Reportes para Imprimir</span>
        </CardTitle>
        <CardDescription>
          Genera reportes imprimibles de stock y ventas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={handlePrintStock}
            variant="outline"
            className="h-auto p-4 flex flex-col items-center space-y-2"
          >
            <Package className="h-8 w-8" />
            <div className="text-center">
              <div className="font-semibold">Reporte de Stock</div>
              <div className="text-sm text-muted-foreground">Inventario completo con valores</div>
            </div>
          </Button>

          <div className="border border-border rounded-lg p-4 bg-card">
            <div className="flex items-center space-x-2 mb-3">
              <ShoppingBag className="h-5 w-5" />
              <span className="font-semibold">Reporte de Ventas</span>
            </div>
            <DateRangeSelector
              startDate={salesReportStartDate}
              endDate={salesReportEndDate}
              onStartDateChange={setSalesReportStartDate}
              onEndDateChange={setSalesReportEndDate}
              onGenerateReport={handlePrintSales}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrintSection;
