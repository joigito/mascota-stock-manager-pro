export interface SaleItem {
  productId: string;
  productName: string;
  variantId?: string;
  variantInfo?: string;
  quantity: number;
  price: number; // Original list price at time of sale
  finalUnitPrice: number; // The actual price per unit sold (editable)
  costPrice: number;
  subtotal: number;
  profit: number;
  margin: number;
}

export interface Sale {
  id: string;
  date: string;
  customer: string;
  items: SaleItem[];
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
