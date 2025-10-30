import { SaleItem } from "@/types/sales";
import SaleItemCard from "./SaleItemCard";
import SalesSummary from "./SalesSummary";

interface SalesListProps {
  saleItems: SaleItem[];
  onUpdateQuantity: (productId: string, newQuantity: number, variantId?: string) => void;
  onUpdatePrice: (productId: string, variantId: string | undefined, newPrice: number) => void;
  onRemoveItem: (productId: string, variantId?: string) => void;
  totalAmount: number;
  totalProfit: number;
  averageMargin: number;
}

const SalesList = ({
  saleItems,
  onUpdateQuantity,
  onUpdatePrice,
  onRemoveItem,
  totalAmount,
  totalProfit,
  averageMargin
}: SalesListProps) => {
  if (saleItems.length === 0) {
    return null;
  }

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold mb-4">Productos en la venta:</h3>
      <div className="space-y-3">
        {saleItems.map((item) => (
          <SaleItemCard
            key={`${item.productId}-${item.variantId || 'default'}`}
            item={item}
            onUpdateQuantity={(newQuantity) => onUpdateQuantity(item.productId, newQuantity, item.variantId)}
            onUpdatePrice={(newPrice) => onUpdatePrice(item.productId, item.variantId, newPrice)}
            onRemoveItem={() => onRemoveItem(item.productId, item.variantId)}
          />
        ))}
      </div>
      
      <SalesSummary
        totalAmount={totalAmount}
        totalProfit={totalProfit}
        averageMargin={averageMargin}
      />
    </div>
  );
};

export default SalesList;