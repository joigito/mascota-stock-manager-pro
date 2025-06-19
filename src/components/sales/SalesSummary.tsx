
import { DollarSign, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SalesSummaryProps {
  totalAmount: number;
  totalProfit: number;
  averageMargin: number;
}

const SalesSummary = ({ totalAmount, totalProfit, averageMargin }: SalesSummaryProps) => {
  return (
    <div className="border-t pt-4 mt-4 space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold">Total Venta:</span>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          <DollarSign className="h-4 w-4 mr-1" />
          ${totalAmount.toLocaleString()}
        </Badge>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold text-green-700">Total Ganancia:</span>
        <Badge variant="default" className="text-lg px-3 py-1 bg-green-600">
          <TrendingUp className="h-4 w-4 mr-1" />
          ${totalProfit.toLocaleString()}
        </Badge>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Margen promedio:</span>
        <span className="text-sm font-medium">{averageMargin.toFixed(1)}%</span>
      </div>
    </div>
  );
};

export default SalesSummary;
