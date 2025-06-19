
export interface Sale {
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

export interface SalesSummary {
  totalSales: number;
  totalProfit: number;
  totalTransactions: number;
  averageSale: number;
  averageMargin: number;
  topProducts: Array<[string, ProductData]>;
  mostProfitableProducts: Array<[string, ProductData]>;
}

export interface ProductData {
  name: string;
  quantity: number;
  revenue: number;
  profit: number;
  margin: number;
}
