
import { DollarSign, TrendingUp, ShoppingBag, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesSummary } from "@/types/sales";

interface SalesSummaryCardsProps {
  salesSummary: SalesSummary;
  getPeriodLabel: (period: string) => string;
  selectedPeriod: string;
}

const SalesSummaryCards = ({ salesSummary, getPeriodLabel, selectedPeriod }: SalesSummaryCardsProps) => {
  return (
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
  );
};

export default SalesSummaryCards;
