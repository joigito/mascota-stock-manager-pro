
import { useState, useMemo } from "react";
import { BarChart3, Calendar, DollarSign, ShoppingBag, TrendingUp, Package, Target } from "lucide-react";
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
    costPrice?: number;
    subtotal: number;
    profit?: number;
    margin?: number;
  }>;
  total: number;
  totalProfit?: number;
  averageMargin?: number;
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
    const totalProfit = filteredSales.reduce((sum: number, sale: Sale) => sum + (sale.totalProfit || 0), 0);
    const totalTransactions = filteredSales.length;
    const averageSale = totalTransactions > 0 ? totalSales / totalTransactions : 0;
    const averageMargin = totalSales > 0 ? (totalProfit / totalSales * 100) : 0;

    // Productos más vendidos y más rentables
    const productSales: Record<string, { 
      name: string; 
      quantity: number; 
      revenue: number; 
      profit: number;
      margin: number;
    }> = {};
    
    filteredSales.forEach((sale: Sale) => {
      sale.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name: item.productName,
            quantity: 0,
            revenue: 0,
            profit: 0,
            margin: 0
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.subtotal;
        productSales[item.productId].profit += item.profit || 0;
        
        if (productSales[item.productId].revenue > 0) {
          productSales[item.productId].margin = 
            (productSales[item.productId].profit / productSales[item.productId].revenue) * 100;
        }
      });
    });

    const topProducts = Object.entries(productSales)
      .sort(([,a], [,b]) => b.quantity - a.quantity)
      .slice(0, 5);

    const mostProfitableProducts = Object.entries(productSales)
      .sort(([,a], [,b]) => b.profit - a.profit)
      .slice(0, 5);

    return {
      totalSales,
      totalProfit,
      totalTransactions,
      averageSale,
      averageMargin,
      topProducts,
      mostProfitableProducts
    };
  }, [filteredSales]);

  const lowStockProducts = products.filter(product => product.stock <= product.minStock);
  const totalInventoryValue = products.reduce((sum, product) => sum + (product.stock * product.price), 0);
  const totalInventoryCost = products.reduce((sum, product) => sum + (product.stock * (product.costPrice || 0)), 0);
  const potentialProfit = totalInventoryValue - totalInventoryCost;

  // Productos con margen bajo (menos del 20%)
  const lowMarginProducts = products.filter(product => {
    const margin = product.price > 0 ? ((product.price - (product.costPrice || 0)) / product.price * 100) : 0;
    return margin < 20 && margin > 0;
  });

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
                Análisis de ventas, rentabilidad e inventario del negocio
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
            <CardTitle className="text-sm font-medium">Ganancia Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${salesSummary.totalProfit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Margen: {salesSummary.averageMargin.toFixed(1)}%
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
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${salesSummary.averageSale.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Valor promedio por transacción
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Products and Most Profitable */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
            <CardDescription>
              Top 5 productos por cantidad vendida
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
                      <div className="text-sm text-green-600">+${data.profit.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productos Más Rentables</CardTitle>
            <CardDescription>
              Top 5 productos por ganancia generada
            </CardDescription>
          </CardHeader>
          <CardContent>
            {salesSummary.mostProfitableProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay ventas registradas en este período</p>
              </div>
            ) : (
              <div className="space-y-4">
                {salesSummary.mostProfitableProducts.map(([productId, data], index) => (
                  <div key={productId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Badge variant="default" className="w-8 h-8 rounded-full flex items-center justify-center bg-green-600">
                        {index + 1}
                      </Badge>
                      <div>
                        <h4 className="font-medium">{data.name}</h4>
                        <p className="text-sm text-gray-600">
                          {data.margin.toFixed(1)}% margen
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">${data.profit.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">${data.revenue.toLocaleString()} ventas</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
              <span className="text-sm text-gray-600">Costo total del inventario:</span>
              <span className="font-semibold">${totalInventoryCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center border-t pt-2">
              <span className="text-sm text-green-600 font-medium">Ganancia potencial:</span>
              <span className="font-semibold text-green-600">${potentialProfit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Productos con stock bajo:</span>
              <Badge variant={lowStockProducts.length > 0 ? "destructive" : "secondary"}>
                {lowStockProducts.length}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Productos con margen bajo:</span>
              <Badge variant={lowMarginProducts.length > 0 ? "destructive" : "secondary"}>
                {lowMarginProducts.length}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {lowStockProducts.length === 0 && lowMarginProducts.length === 0 ? (
              <div className="text-center py-4 text-green-600">
                <p className="font-medium">✓ Todo está en orden</p>
                <p className="text-xs text-gray-500">Stock y márgenes adecuados</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lowStockProducts.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-600 mb-2">Stock Bajo:</h4>
                    <div className="space-y-1">
                      {lowStockProducts.slice(0, 3).map((product) => (
                        <div key={product.id} className="flex justify-between items-center text-sm">
                          <span className="truncate">{product.name}</span>
                          <Badge variant="destructive" className="ml-2 text-xs">
                            {product.stock} restantes
                          </Badge>
                        </div>
                      ))}
                      {lowStockProducts.length > 3 && (
                        <p className="text-xs text-gray-500">
                          ... y {lowStockProducts.length - 3} más
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {lowMarginProducts.length > 0 && (
                  <div>
                    <h4 className="font-medium text-yellow-600 mb-2">Margen Bajo (&lt;20%):</h4>
                    <div className="space-y-1">
                      {lowMarginProducts.slice(0, 3).map((product) => {
                        const margin = ((product.price - (product.costPrice || 0)) / product.price * 100);
                        return (
                          <div key={product.id} className="flex justify-between items-center text-sm">
                            <span className="truncate">{product.name}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {margin.toFixed(1)}%
                            </Badge>
                          </div>
                        );
                      })}
                      {lowMarginProducts.length > 3 && (
                        <p className="text-xs text-gray-500">
                          ... y {lowMarginProducts.length - 3} más
                        </p>
                      )}
                    </div>
                  </div>
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
            Últimas transacciones con información de rentabilidad
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
                    <div className="text-sm text-green-600">
                      +${(sale.totalProfit || 0).toLocaleString()} 
                      ({(sale.averageMargin || 0).toFixed(1)}%)
                    </div>
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
