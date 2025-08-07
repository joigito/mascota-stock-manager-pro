import { Package, AlertTriangle, TrendingUp, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@/hooks/useProducts";

interface DashboardProps {
  products: Product[];
}

const Dashboard = ({ products }: DashboardProps) => {
  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-800">
            Total de Productos
          </CardTitle>
          <Package className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">{totalProducts}</div>
          <p className="text-xs text-blue-600 mt-1">
            {mascotasProducts} mascotas • {alimentosProducts} alimentos
          </p>
        </CardContent>
      </Card>

      <Card className={`${lowStockCount > 0 ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-200' : 'bg-gradient-to-r from-green-50 to-green-100 border-green-200'} hover:shadow-md transition-shadow`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={`text-sm font-medium ${lowStockCount > 0 ? 'text-red-800' : 'text-green-800'}`}>
            Alertas de Stock
          </CardTitle>
          <AlertTriangle className={`h-4 w-4 ${lowStockCount > 0 ? 'text-red-600' : 'text-green-600'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-red-900' : 'text-green-900'}`}>
            {lowStockCount}
          </div>
          <p className={`text-xs mt-1 ${lowStockCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {lowStockCount > 0 ? 'Productos con stock bajo' : 'Todo en orden'}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-800">
            Valor Total Inventario
          </CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">
            {formatCurrency(totalValue)}
          </div>
          <p className="text-xs text-green-600 mt-1">
            Valor total del stock
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-800">
            Promedio por Producto
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-900">
            {formatCurrency(totalProducts > 0 ? totalValue / totalProducts : 0)}
          </div>
          <p className="text-xs text-orange-600 mt-1">
            Valor promedio por ítem
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
