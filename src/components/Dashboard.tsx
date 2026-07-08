import { Package, AlertTriangle, TrendingUp, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@/hooks/useProducts";
import { Sale } from "@/types/sales";
import StockAlert from "@/components/StockAlert";
import RecentSalesCard from "@/components/reports/RecentSalesCard";

interface DashboardProps {
  products: Product[];
  sales: Sale[];
}

const Dashboard = ({ products, sales }: DashboardProps) => {
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);
  const lowStockCount = lowStockProducts.length;
  const totalValue = products.reduce((sum, product) => sum + (product.stock * product.price), 0);
  const mascotasProducts = products.filter(p => p.category === "mascotas").length;
  const alimentosProducts = products.filter(p => p.category === "forrajeria").length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30 border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-300">
              Total de Productos
            </CardTitle>
            <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">{totalProducts}</div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {mascotasProducts} mascotas • {alimentosProducts} alimentos
            </p>
          </CardContent>
        </Card>

        <Card className={`${lowStockCount > 0 ? 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/40 dark:to-red-900/30 border-red-200 dark:border-red-800' : 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/30 border-green-200 dark:border-green-800'} hover:shadow-md transition-shadow`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${lowStockCount > 0 ? 'text-red-800 dark:text-red-300' : 'text-green-800 dark:text-green-300'}`}>
              Alertas de Stock
            </CardTitle>
            <AlertTriangle className={`h-4 w-4 ${lowStockCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-red-900 dark:text-red-200' : 'text-green-900 dark:text-green-200'}`}>
              {lowStockCount}
            </div>
            <p className={`text-xs mt-1 ${lowStockCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
              {lowStockCount > 0 ? 'Productos con stock bajo' : 'Todo en orden'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/30 border-green-200 dark:border-green-800 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-300">
              Valor Total Inventario
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-200">
              {formatCurrency(totalValue)}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              Valor total del stock
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/30 border-orange-200 dark:border-orange-800 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-300">
              Promedio por Producto
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-200">
              {formatCurrency(totalProducts > 0 ? totalValue / totalProducts : 0)}
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              Valor promedio por ítem
            </p>
          </CardContent>
        </Card>
      </div>

      {lowStockCount > 0 && <StockAlert products={lowStockProducts} />}
      
      <RecentSalesCard filteredSales={sales} />

    </div>
  );
};

export default Dashboard;
