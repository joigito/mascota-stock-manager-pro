
import SaleItemCard from "./SaleItemCard";
import SalesSummary from "./SalesSummary";

interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  costPrice: number;
  subtotal: number;
  profit: number;
  margin: number;
}

interface SalesListProps {
  saleItems: SaleItem[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
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
            key={item.productId}
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveItem={onRemoveItem}
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
