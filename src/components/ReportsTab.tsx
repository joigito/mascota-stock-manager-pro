
import { useState, useMemo } from "react";
import { BarChart3, Calendar, DollarSign, ShoppingBag, TrendingUp, Package } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/hooks/useProducts";

interface Sale {
  id: string;
  date: string;
  customer: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  total: number;
}

interface ReportsTabProps {
  products: Product[];
}

const ReportsTab = ({ products }: ReportsTabProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState("7");
  
  const sales = useMemo(() => {
    const saved = localStorage.getItem('sales');
    return saved ? JSON.parse(saved) : [];
  }, []);

  const filteredSales = useMemo(() => {
    const days = parseInt(selectedPeriod);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return sales.filter((sale: Sale) => new Date(sale.date) >= cutoffDate);
  }, [sales, selectedPeriod]);

  const salesSummary = useMemo(() => {
    const totalSales = filteredSales.reduce((sum: number, sale: Sale) => sum + sale.total, 0);
    const totalTransactions = filteredSales.length;
    const averageSale = totalTransactions > 0 ? totalSales / totalTransactions : 0;

    // Productos más vendidos
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    
    filteredSales.forEach((sale: Sale) => {
      sale.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name: item.productName,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.subtotal;
      });
    });

    const topProducts = Object.entries(productSales)
      .sort(([,a], [,b]) => b.quantity - a.quantity)
      .slice(0, 5);

    return {
      totalSales,
      totalTransactions,
      averageSale,
      topProducts
    };
  }, [filteredSales]);

  const lowStockProducts = products.filter(product => product.stock <= product.minStock);
  const totalInventoryValue = products.reduce((sum, product) => sum + (product.stock * product.price), 0);

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case "1": return "Último día";
      case "7": return "Últimos 7 días";
      case "30": return "Últimos 30 días";
      case "90": return "Últimos 90 días";
      default: return "Período seleccionado";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with period selector */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Reportes y Analytics</span>
              </CardTitle>
              <CardDescription>
                Análisis de ventas, inventario y rendimiento del negocio
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Último día</SelectItem>
                  <SelectItem value="7">Últimos 7 días</SelectItem>
                  <SelectItem value="30">Últimos 30 días</SelectItem>
                  <SelectItem value="90">Últimos 90 días</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Sales Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${salesSummary.totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {getPeriodLabel(selectedPeriod)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesSummary.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Número de ventas realizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Venta Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${salesSummary.averageSale.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Valor promedio por transacción
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Productos Más Vendidos</CardTitle>
          <CardDescription>
            Top 5 productos por cantidad vendida en {getPeriodLabel(selectedPeriod).toLowerCase()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {salesSummary.topProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay ventas registradas en este período</p>
            </div>
          ) : (
            <div className="space-y-4">
              {salesSummary.topProducts.map(([productId, data], index) => (
                <div key={productId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <h4 className="font-medium">{data.name}</h4>
                      <p className="text-sm text-gray-600">
                        {data.quantity} unidades vendidas
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${data.revenue.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">ingresos</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inventory Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Resumen de Inventario</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total de productos:</span>
              <span className="font-semibold">{products.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Valor total del inventario:</span>
              <span className="font-semibold">${totalInventoryValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Productos con stock bajo:</span>
              <Badge variant={lowStockProducts.length > 0 ? "destructive" : "secondary"}>
                {lowStockProducts.length}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas de Stock</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-4 text-green-600">
                <p className="font-medium">✓ Todos los productos tienen stock adecuado</p>
              </div>
            ) : (
              <div className="space-y-2">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex justify-between items-center text-sm">
                    <span className="truncate">{product.name}</span>
                    <Badge variant="destructive" className="ml-2">
                      {product.stock} restantes
                    </Badge>
                  </div>
                ))}
                {lowStockProducts.length > 5 && (
                  <p className="text-xs text-gray-500 text-center">
                    ... y {lowStockProducts.length - 5} productos más
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales */}
      <Card>
        <CardHeader>
          <CardTitle>Ventas Recientes</CardTitle>
          <CardDescription>
            Últimas transacciones realizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSales.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay ventas registradas en este período</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSales.slice(0, 10).map((sale: Sale) => (
                <div key={sale.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">{sale.customer}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(sale.date).toLocaleDateString()} - {sale.items.length} productos
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${sale.total.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsTab;
