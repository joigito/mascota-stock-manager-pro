
import { Product } from "@/hooks/useProducts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOrganization } from "@/hooks/useOrganization";

interface PrintableStockReportProps {
  products: Product[];
  organizationName?: string;
}

const PrintableStockReport = ({ products, organizationName }: PrintableStockReportProps) => {
  const { currentOrganization } = useOrganization();
  const totalInventoryValue = products.reduce((sum, product) => sum + (product.stock * product.price), 0);
  const totalInventoryCost = products.reduce((sum, product) => sum + (product.stock * (product.costPrice || 0)), 0);
  const potentialProfit = totalInventoryValue - totalInventoryCost;

  return (
    <div className="print-content p-8 bg-white">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">{organizationName || currentOrganization?.name || "Sistema de Gestión"}</h1>
        <h2 className="text-xl font-semibold mb-4">Reporte de Stock de Productos</h2>
        <p className="text-sm text-gray-600">Generado el: {new Date().toLocaleDateString()}</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead className="text-right">Stock Actual</TableHead>
            <TableHead className="text-right">Stock Mínimo</TableHead>
            <TableHead className="text-right">Precio Venta</TableHead>
            <TableHead className="text-right">Precio Costo</TableHead>
            <TableHead className="text-right">Valor Total</TableHead>
            <TableHead className="text-right">Margen %</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const totalValue = product.stock * product.price;
            const margin = product.price > 0 ? ((product.price - (product.costPrice || 0)) / product.price * 100) : 0;
            const isLowStock = product.stock <= product.minStock;
            
            return (
              <TableRow key={product.id} className={isLowStock ? "bg-red-50" : ""}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="capitalize">{product.category}</TableCell>
                <TableCell className="text-right">{product.stock}</TableCell>
                <TableCell className="text-right">{product.minStock}</TableCell>
                <TableCell className="text-right">${product.price.toLocaleString()}</TableCell>
                <TableCell className="text-right">${(product.costPrice || 0).toLocaleString()}</TableCell>
                <TableCell className="text-right">${totalValue.toLocaleString()}</TableCell>
                <TableCell className="text-right">{margin.toFixed(1)}%</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <div className="mt-8 border-t pt-4">
        <div className="flex justify-end space-x-8">
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Productos:</p>
            <p className="font-semibold">{products.length}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Valor Total Inventario:</p>
            <p className="font-semibold">${totalInventoryValue.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Costo Total Inventario:</p>
            <p className="font-semibold">${totalInventoryCost.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-green-600">Ganancia Potencial:</p>
            <p className="font-semibold text-green-600">${potentialProfit.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 text-xs text-gray-500">
        <p>* Productos marcados en rojo tienen stock bajo (igual o menor al stock mínimo)</p>
      </div>
    </div>
  );
};

export default PrintableStockReport;
