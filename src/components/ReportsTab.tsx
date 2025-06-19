
import { useState } from "react";
import { Product } from "@/hooks/useProducts";
import { Sale } from "@/types/sales";
import { getPeriodLabel } from "@/utils/salesCalculations";
import { useSalesData } from "@/hooks/useSalesData";
import PrintableStockReport from "@/components/reports/PrintableStockReport";
import PrintableSalesReport from "@/components/reports/PrintableSalesReport";
import PrintSection from "@/components/reports/PrintSection";
import SalesSummaryCards from "@/components/reports/SalesSummaryCards";
import TopProductsCard from "@/components/reports/TopProductsCard";
import MostProfitableProductsCard from "@/components/reports/MostProfitableProductsCard";
import InventoryOverviewCard from "@/components/reports/InventoryOverviewCard";
import AlertsCard from "@/components/reports/AlertsCard";
import RecentSalesCard from "@/components/reports/RecentSalesCard";
import ReportsHeader from "@/components/reports/ReportsHeader";

interface ReportsTabProps {
  products: Product[];
}

const ReportsTab = ({ products }: ReportsTabProps) => {
  const {
    filteredSales,
    salesSummary,
    selectedPeriod,
    setSelectedPeriod,
    getSalesForReport
  } = useSalesData();

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

  const lowStockProducts = products.filter(product => product.stock <= product.minStock);
  const totalInventoryValue = products.reduce((sum, product) => sum + (product.stock * product.price), 0);
  const totalInventoryCost = products.reduce((sum, product) => sum + (product.stock * (product.costPrice || 0)), 0);
  const potentialProfit = totalInventoryValue - totalInventoryCost;

  // Productos con margen bajo (menos del 20%)
  const lowMarginProducts = products.filter(product => {
    const margin = product.price > 0 ? ((product.price - (product.costPrice || 0)) / product.price * 100) : 0;
    return margin < 20 && margin > 0;
  });

  const handlePrintStock = () => {
    setShowStockPrint(true);
    setTimeout(() => {
      window.print();
      setShowStockPrint(false);
    }, 100);
  };

  const handlePrintSales = () => {
    const salesForReport = getSalesForReport(salesReportStartDate, salesReportEndDate);
    console.log('Printing sales report with data:', salesForReport);
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
    const salesForReport = getSalesForReport(salesReportStartDate, salesReportEndDate);
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

      <ReportsHeader
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
      />

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
