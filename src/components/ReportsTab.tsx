
import { useState, useMemo } from "react";
import { BarChart3, Calendar } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product } from "@/hooks/useProducts";
import PrintableStockReport from "@/components/reports/PrintableStockReport";
import PrintableSalesReport from "@/components/reports/PrintableSalesReport";
import PrintSection from "@/components/reports/PrintSection";
import SalesSummaryCards from "@/components/reports/SalesSummaryCards";
import TopProductsCard from "@/components/reports/TopProductsCard";
import MostProfitableProductsCard from "@/components/reports/MostProfitableProductsCard";
import InventoryOverviewCard from "@/components/reports/InventoryOverviewCard";
import AlertsCard from "@/components/reports/AlertsCard";
import RecentSalesCard from "@/components/reports/RecentSalesCard";

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
  const [showStockPrint, setShowStockPrint] = useState(false);
  const [showSalesPrint, setShowSalesPrint] = useState(false);
  const [salesReportStartDate, setSalesReportStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [salesReportEndDate, setSalesReportEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  
  const sales = useMemo(() => {
    const saved = localStorage.getItem('sales');
    console.log('Loaded sales from localStorage:', saved);
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

  const salesForReport = useMemo(() => {
    console.log('Filtering sales for report...');
    console.log('Start date:', salesReportStartDate);
    console.log('End date:', salesReportEndDate);
    console.log('All sales:', sales);
    
    const filtered = sales.filter((sale: Sale) => {
      const saleDate = new Date(sale.date);
      const startDate = new Date(salesReportStartDate);
      const endDate = new Date(salesReportEndDate);
      
      // Set start date to beginning of day
      startDate.setHours(0, 0, 0, 0);
      // Set end date to end of day
      endDate.setHours(23, 59, 59, 999);
      
      console.log(`Sale ${sale.id}: ${saleDate.toISOString()} between ${startDate.toISOString()} and ${endDate.toISOString()}`);
      console.log(`Includes sale: ${saleDate >= startDate && saleDate <= endDate}`);
      
      return saleDate >= startDate && saleDate <= endDate;
    });
    
    console.log('Filtered sales for report:', filtered);
    return filtered;
  }, [sales, salesReportStartDate, salesReportEndDate]);

  const handlePrintStock = () => {
    setShowStockPrint(true);
    setTimeout(() => {
      window.print();
      setShowStockPrint(false);
    }, 100);
  };

  const handlePrintSales = () => {
    setShowSalesPrint(true);
    setTimeout(() => {
      window.print();
      setShowSalesPrint(false);
    }, 100);
  };

  if (showStockPrint) {
    return <PrintableStockReport products={products} />;
  }

  if (showSalesPrint) {
    return <PrintableSalesReport 
      sales={salesForReport} 
      startDate={salesReportStartDate}
      endDate={salesReportEndDate}
    />;
  }

  return (
    <div className="space-y-6">
      <PrintSection
        handlePrintStock={handlePrintStock}
        salesReportStartDate={salesReportStartDate}
        salesReportEndDate={salesReportEndDate}
        setSalesReportStartDate={setSalesReportStartDate}
        setSalesReportEndDate={setSalesReportEndDate}
        handlePrintSales={handlePrintSales}
      />

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

      <SalesSummaryCards 
        salesSummary={salesSummary} 
        getPeriodLabel={getPeriodLabel} 
        selectedPeriod={selectedPeriod} 
      />

      {/* Top Products and Most Profitable */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopProductsCard topProducts={salesSummary.topProducts} />
        <MostProfitableProductsCard mostProfitableProducts={salesSummary.mostProfitableProducts} />
      </div>

      {/* Inventory Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InventoryOverviewCard
          products={products}
          totalInventoryValue={totalInventoryValue}
          totalInventoryCost={totalInventoryCost}
          potentialProfit={potentialProfit}
          lowStockProducts={lowStockProducts}
          lowMarginProducts={lowMarginProducts}
        />
        <AlertsCard lowStockProducts={lowStockProducts} lowMarginProducts={lowMarginProducts} />
      </div>

      <RecentSalesCard filteredSales={filteredSales} />
    </div>
  );
};

export default ReportsTab;
