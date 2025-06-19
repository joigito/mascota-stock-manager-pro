
import { Sale, SalesSummary } from "@/types/sales";

export const calculateSalesSummary = (filteredSales: Sale[]): SalesSummary => {
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
};

export const filterSalesForReport = (
  sales: Sale[], 
  startDate: string, 
  endDate: string
): Sale[] => {
  console.log('=== FILTERING SALES FOR REPORT (FIXED) ===');
  console.log('Start date input (salesReportStartDate):', startDate);
  console.log('End date input (salesReportEndDate):', endDate);
  console.log('Total sales to filter:', sales.length);
  
  if (sales.length === 0) {
    console.log('No sales found in localStorage');
    return [];
  }
  
  // Create date objects in UTC to avoid timezone issues
  const startDateUTC = new Date(startDate + 'T00:00:00.000Z');
  const endDateUTC = new Date(endDate + 'T23:59:59.999Z');
  
  console.log('UTC start date:', startDateUTC.toISOString());
  console.log('UTC end date:', endDateUTC.toISOString());
  
  const filtered = sales.filter((sale: Sale) => {
    const saleDate = new Date(sale.date);
    const isInRange = saleDate >= startDateUTC && saleDate <= endDateUTC;
    
    console.log(`Sale ${sale.id}:`);
    console.log(`  - Original date string: "${sale.date}"`);
    console.log(`  - Parsed date: ${saleDate.toISOString()}`);
    console.log(`  - Is valid date: ${!isNaN(saleDate.getTime())}`);
    console.log(`  - Is in range: ${isInRange}`);
    console.log(`  - Compare: ${saleDate.toISOString()} >= ${startDateUTC.toISOString()} && <= ${endDateUTC.toISOString()}`);
    
    return isInRange;
  });
  
  console.log('Filtered sales count:', filtered.length);
  console.log('Filtered sales:', filtered);
  
  return filtered;
};

export const getPeriodLabel = (period: string): string => {
  switch (period) {
    case "1": return "Último día";
    case "7": return "Últimos 7 días";
    case "30": return "Últimos 30 días";
    case "90": return "Últimos 90 días";
    default: return "Período seleccionado";
  }
};
