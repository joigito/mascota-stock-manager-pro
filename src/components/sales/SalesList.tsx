
import SaleItemCard from "./SaleItemCard";
import SalesSummary from "./SalesSummary";

interface SaleItem {
  productId: string;
  productName: string;
  variantId?: string;
  variantInfo?: string;
  quantity: number;
  price: number;
  costPrice: number;
  subtotal: number;
  profit: number;
  margin: number;
}

interface SalesListProps {
  saleItems: SaleItem[];
  onUpdateQuantity: (productId: string, newQuantity: number, variantId?: string) => void;
  onRemoveItem: (productId: string, variantId?: string) => void;
  totalAmount: number;
  totalProfit: number;
  averageMargin: number;
}

const SalesList = ({
  saleItems,
  onUpdateQuantity,
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
