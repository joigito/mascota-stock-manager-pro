
import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Product } from "@/hooks/useProducts";
import { getPeriodLabel } from "@/utils/salesCalculations";
import { useSalesData } from "@/hooks/useSalesData";
import { useOrganization } from "@/hooks/useOrganization";
import PrintableStockReport from "@/components/reports/PrintableStockReport";
import PrintSection from "@/components/reports/PrintSection";
import SalesSummaryCards from "@/components/reports/SalesSummaryCards";
import TopProductsCard from "@/components/reports/TopProductsCard";
import MostProfitableProductsCard from "@/components/reports/MostProfitableProductsCard";
import InventoryOverviewCard from "@/components/reports/InventoryOverviewCard";
import AlertsCard from "@/components/reports/AlertsCard";
import RecentSalesCard from "@/components/reports/RecentSalesCard";
import ReportsHeader from "@/components/reports/ReportsHeader";
import InvoicesCard from "@/components/reports/InvoicesCard";

interface ReportsTabProps {
  products: Product[];
}

const ReportsTab = ({ products }: ReportsTabProps) => {
  const { currentOrganization, isAdmin, isSuperAdmin } = useOrganization();
  const {
    filteredSales,
    salesSummary,
    selectedPeriod,
    setSelectedPeriod,
    getSalesForReport,
    loading,
    syncing,
    syncSales
  } = useSalesData();

  const [showStockPrint, setShowStockPrint] = useState(false);
  const [showSalesPrint, setShowSalesPrint] = useState(false);
  const [canViewProfits, setCanViewProfits] = useState(false);
  const [salesReportStartDate, setSalesReportStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [salesReportEndDate, setSalesReportEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    const checkPermissions = async () => {
      const isAdminUser = await isAdmin();
      const isSuperAdminUser = await isSuperAdmin();
      setCanViewProfits(isAdminUser || isSuperAdminUser);
    };
    checkPermissions();
  }, [currentOrganization, isAdmin, isSuperAdmin]);

  const lowStockProducts = products.filter(product => product.stock <= product.minStock);
  const totalInventoryValue = products.reduce((sum, product) => sum + (product.stock * product.price), 0);
  const totalInventoryCost = products.reduce((sum, product) => sum + (product.stock * (product.costPrice || 0)), 0);
  const potentialProfit = totalInventoryValue - totalInventoryCost;

  // Productos con margen bajo (menos del 20%)
  const lowMarginProducts = products.filter(product => {
    const margin = product.price > 0 ? ((product.price - (product.costPrice || 0)) / product.price * 100) : 0;
    return margin < 20 && margin > 0;
  });

  const generateSalesPrintHTML = (sales: any[], startDate: string, endDate: string) => {
    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalProfit = sales.reduce((sum, sale) => sum + (sale.totalProfit || 0), 0);
    const averageMargin = totalSales > 0 ? (totalProfit / totalSales * 100) : 0;
    
    const salesRows = sales.map(sale => `
      <tr>
        <td>${new Date(sale.date).toLocaleDateString()}</td>
        <td>${sale.customer}</td>
        <td>${sale.items.length} productos</td>
        <td class="text-right font-semibold">$${sale.total.toLocaleString()}</td>
        ${canViewProfits ? `
          <td class="text-right font-semibold">$${(sale.totalProfit || 0).toLocaleString()}</td>
          <td class="text-right">${(sale.averageMargin || 0).toFixed(1)}%</td>
        ` : ''}
      </tr>
    `).join('');

    return `
      <html>
        <head>
          <title>Reporte de Ventas</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px;
              color: #000;
              background: #fff;
              font-size: 14px;
            }
            .header {
              text-center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .header h1 {
              margin: 0 0 10px 0;
              font-size: 24px;
            }
            .header h2 {
              margin: 0 0 5px 0;
              font-size: 20px;
            }
            .header p {
              margin: 5px 0;
              color: #666;
              font-size: 12px;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(${canViewProfits ? '4' : '2'}, 1fr);
              gap: 15px;
              margin-bottom: 30px;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 8px;
            }
            .summary-item {
              text-align: center;
            }
            .summary-label {
              font-size: 12px;
              color: #666;
              margin-bottom: 5px;
            }
            .summary-value {
              font-size: 20px;
              font-weight: bold;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 10px; 
              text-align: left;
            }
            th { 
              background-color: #333;
              color: #fff;
              font-weight: bold;
            }
            tbody tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .text-right { 
              text-align: right; 
            }
            .font-semibold {
              font-weight: 600;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #333;
              text-align: right;
            }
            .footer-total {
              font-size: 18px;
              font-weight: bold;
              margin: 10px 0;
            }
            @media print { 
              body { 
                margin: 0;
                font-size: 12px;
              }
              .summary-grid {
                grid-template-columns: repeat(2, 1fr);
              }
            }
            @media (max-width: 600px) {
              body {
                margin: 10px;
                font-size: 12px;
              }
              .summary-grid {
                grid-template-columns: 1fr;
              }
              table {
                font-size: 11px;
              }
              th, td {
                padding: 6px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${currentOrganization?.name || "Sistema de Gestión"}</h1>
            <h2>Reporte de Ventas</h2>
            <p>Período: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}</p>
            <p>Generado el: ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-label">Total Ventas</div>
              <div class="summary-value">$${totalSales.toLocaleString()}</div>
            </div>
            ${canViewProfits ? `
              <div class="summary-item">
                <div class="summary-label">Total Ganancias</div>
                <div class="summary-value">$${totalProfit.toLocaleString()}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Margen Promedio</div>
                <div class="summary-value">${averageMargin.toFixed(1)}%</div>
              </div>
            ` : ''}
            <div class="summary-item">
              <div class="summary-label">Transacciones</div>
              <div class="summary-value">${sales.length}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Productos</th>
                <th class="text-right">Total Venta</th>
                ${canViewProfits ? `
                  <th class="text-right">Total Ganancia</th>
                  <th class="text-right">Margen %</th>
                ` : ''}
              </tr>
            </thead>
            <tbody>
              ${salesRows}
            </tbody>
          </table>

          <div class="footer">
            <div class="footer-total">Total Ventas: $${totalSales.toLocaleString()}</div>
            ${canViewProfits ? `
              <div class="footer-total" style="color: #16a34a;">Total Ganancias: $${totalProfit.toLocaleString()}</div>
            ` : ''}
          </div>
        </body>
      </html>
    `;
  };

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
    
    const printContent = generateSalesPrintHTML(salesForReport, salesReportStartDate, salesReportEndDate);
    
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (showStockPrint) {
    return <PrintableStockReport products={products} organizationName={currentOrganization?.name} />;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando datos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reportes</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={syncSales}
            disabled={syncing}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-muted/50 text-foreground rounded-md hover:bg-muted/60 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Sincronizando...' : 'Actualizar Datos'}</span>
          </button>
        </div>
      </div>

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
      
      <InvoicesCard />
    </div>
  );
};

export default ReportsTab;
