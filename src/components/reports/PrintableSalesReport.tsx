
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOrganization } from "@/hooks/useOrganization";
import { useEffect, useState } from "react";

interface Sale {
  id: string;
  date: string;
  customer: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    costPrice?: number;
    subtotal: number;
    profit?: number;
    margin?: number;
  }>;
  total: number;
  totalProfit?: number;
  averageMargin?: number;
}

interface PrintableSalesReportProps {
  sales: Sale[];
  startDate: string;
  endDate: string;
}

const PrintableSalesReport = ({ sales, startDate, endDate }: PrintableSalesReportProps) => {
  const { currentOrganization, isAdmin, isSuperAdmin } = useOrganization();
  const [canViewProfits, setCanViewProfits] = useState(false);
  
  useEffect(() => {
    const checkPermissions = async () => {
      const isAdminUser = await isAdmin();
      const isSuperAdminUser = await isSuperAdmin();
      setCanViewProfits(isAdminUser || isSuperAdminUser);
    };
    checkPermissions();
  }, [isAdmin, isSuperAdmin]);

  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalProfit = sales.reduce((sum, sale) => sum + (sale.totalProfit || 0), 0);
  const averageMargin = totalSales > 0 ? (totalProfit / totalSales * 100) : 0;

  return (
    <div className="print-content p-8 bg-white">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">{currentOrganization?.name || "Sistema de Gestión"}</h1>
        <h2 className="text-xl font-semibold mb-4">Reporte de Ventas</h2>
        <p className="text-sm text-muted-foreground">
          Período: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
        </p>
        <p className="text-sm text-muted-foreground">Generado el: {new Date().toLocaleDateString()}</p>
      </div>

      <div className={`mb-6 grid ${canViewProfits ? 'grid-cols-4' : 'grid-cols-2'} gap-4 border rounded-lg p-4`}>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Total Ventas</p>
          <p className="text-xl font-bold">${totalSales.toLocaleString()}</p>
        </div>
        {canViewProfits && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Ganancias</p>
            <p className="text-xl font-bold text-foreground">${totalProfit.toLocaleString()}</p>
          </div>
        )}
        {canViewProfits && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Margen Promedio</p>
            <p className="text-xl font-bold">{averageMargin.toFixed(1)}%</p>
          </div>
        )}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Transacciones</p>
          <p className="text-xl font-bold">{sales.length}</p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Productos</TableHead>
            <TableHead className="text-right">Total Venta</TableHead>
            {canViewProfits && <TableHead className="text-right">Total Ganancia</TableHead>}
            {canViewProfits && <TableHead className="text-right">Margen %</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
              <TableCell>{sale.customer}</TableCell>
              <TableCell>{sale.items.length} productos</TableCell>
              <TableCell className="text-right font-semibold">${sale.total.toLocaleString()}</TableCell>
              {canViewProfits && (
                <TableCell className="text-right font-semibold text-foreground">
                  ${(sale.totalProfit || 0).toLocaleString()}
                </TableCell>
              )}
              {canViewProfits && <TableCell className="text-right">{(sale.averageMargin || 0).toFixed(1)}%</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-8 border-t pt-4">
        <div className="flex justify-end space-x-8">
          <div className="text-right">
            <p className="text-lg font-semibold">Total Ventas: ${totalSales.toLocaleString()}</p>
          </div>
          {canViewProfits && (
            <div className="text-right">
              <p className="text-lg font-semibold text-green-600">Total Ganancias: ${totalProfit.toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrintableSalesReport;
