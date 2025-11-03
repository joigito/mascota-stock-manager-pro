import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Product } from "@/hooks/useProducts";
import { useSales } from "@/hooks/useSales";
import { useCustomers } from "@/hooks/useCustomers";
import { useBatches } from "@/hooks/useBatches";
import ProductSelectorWithVariants from "./sales/ProductSelectorWithVariants";
import SalesList from "./sales/SalesList";
import CustomerSelector from "./sales/CustomerSelector";
import { SaleItem } from "@/types/sales";

interface SalesTabProps {
  products: Product[];
  onUpdateProduct: (id: string, updates: Partial<Product>) => Promise<{ error: any }>;
}

const SalesTab = ({ products, onUpdateProduct }: SalesTabProps) => {
  const { toast } = useToast();
  const { addSale } = useSales();
  const { customers, addCustomer } = useCustomers();
  const { updateBatchesAfterSale } = useBatches();
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>();
  const [finalPrice, setFinalPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [customerName, setCustomerName] = useState<string>("Consumidor final");

  const addItemToSale = () => {
    if (!selectedProductId) {
      toast({ title: "Error", description: "Por favor selecciona un producto", variant: "destructive" });
      return;
    }

    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    let availableStock = 0;
    let currentPrice = finalPrice || product.price;
    let variantInfo = "";

    if (product.hasVariants && selectedVariantId) {
      availableStock = 999; // Placeholder
      variantInfo = `Variante: ${selectedVariantId}`;
    } else if (!product.hasVariants) {
      availableStock = product.stock;
    } else {
      toast({ title: "Error", description: "Por favor selecciona una variante para este producto", variant: "destructive" });
      return;
    }

    if (quantity > availableStock && availableStock !== 999) {
      toast({ title: "Stock insuficiente", description: `Solo hay ${availableStock} unidades disponibles`, variant: "destructive" });
      return;
    }

    const existingItemIndex = saleItems.findIndex(item => 
      item.productId === selectedProductId && item.variantId === selectedVariantId
    );
    
    if (existingItemIndex >= 0) {
      const newItems = [...saleItems];
      const newQuantity = newItems[existingItemIndex].quantity + quantity;
      
      if (newQuantity > availableStock && availableStock !== 999) {
        toast({ title: "Stock insuficiente", description: `Solo hay ${availableStock} unidades disponibles`, variant: "destructive" });
        return;
      }
      
      const item = newItems[existingItemIndex];
      const subtotal = newQuantity * item.finalUnitPrice;
      const profit = newQuantity * (item.finalUnitPrice - (item.costPrice || 0));
      const margin = item.finalUnitPrice > 0 ? ((item.finalUnitPrice - (item.costPrice || 0)) / item.finalUnitPrice * 100) : 0;
      
      newItems[existingItemIndex] = {
        ...item,
        quantity: newQuantity,
        subtotal,
        profit,
        margin
      };
      setSaleItems(newItems);
    } else {
      const subtotal = quantity * currentPrice;
      const profit = quantity * (currentPrice - (product.costPrice || 0));
      const margin = currentPrice > 0 ? ((currentPrice - (product.costPrice || 0)) / currentPrice * 100) : 0;
      
      const newItem: SaleItem = {
        productId: selectedProductId,
        productName: product.name,
        variantId: selectedVariantId,
        variantInfo: variantInfo || undefined,
        quantity,
        price: product.price, // Store original price
        finalUnitPrice: currentPrice, // Editable price
        costPrice: product.costPrice || 0,
        subtotal,
        profit,
        margin
      };
      setSaleItems([...saleItems, newItem]);
    }

    setSelectedProductId("");
    setSelectedVariantId(undefined);
    setFinalPrice(0);
    setQuantity(1);
  };

  const removeItemFromSale = (productId: string, variantId?: string) => {
    setSaleItems(saleItems.filter(item => 
      !(item.productId === productId && item.variantId === variantId)
    ));
  };

  const updateItemQuantity = (productId: string, newQuantity: number, variantId?: string) => {
    if (newQuantity <= 0) {
      removeItemFromSale(productId, variantId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (!product.hasVariants && newQuantity > product.stock) {
      toast({ title: "Stock insuficiente", description: `Solo hay ${product.stock} unidades disponibles`, variant: "destructive" });
      return;
    }

    setSaleItems(saleItems.map(item => {
      if (item.productId === productId && item.variantId === variantId) {
        const subtotal = newQuantity * item.finalUnitPrice;
        const profit = newQuantity * (item.finalUnitPrice - item.costPrice);
        return { 
          ...item, 
          quantity: newQuantity, 
          subtotal,
          profit
        };
      }
      return item;
    }));
  };

  const updateItemPrice = (productId: string, variantId: string | undefined, newPrice: number) => {
    setSaleItems(saleItems.map(item => {
      if (item.productId === productId && item.variantId === variantId) {
        const subtotal = item.quantity * newPrice;
        const profit = item.quantity * (newPrice - item.costPrice);
        const margin = newPrice > 0 ? ((newPrice - item.costPrice) / newPrice * 100) : 0;
        return {
          ...item,
          finalUnitPrice: newPrice,
          subtotal,
          profit,
          margin,
        };
      }
      return item;
    }));
  };

  const getTotalAmount = () => saleItems.reduce((total, item) => total + item.subtotal, 0);
  const getTotalProfit = () => saleItems.reduce((total, item) => total + item.profit, 0);

  const getAverageMargin = () => {
    if (saleItems.length === 0) return 0;
    const totalRevenue = getTotalAmount();
    const totalProfit = getTotalProfit();
    return totalRevenue > 0 ? (totalProfit / totalRevenue * 100) : 0;
  };

  const completeSale = async () => {
    if (saleItems.length === 0) {
      toast({ title: "Error", description: "Agrega al menos un producto a la venta", variant: "destructive" });
      return;
    }

    try {
      for (const item of saleItems) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          await updateBatchesAfterSale(item.productId, item.quantity);
          await onUpdateProduct(item.productId, { stock: product.stock - item.quantity });
        }
      }

      const newSale = {
        date: new Date().toISOString(),
        customer: customerName || 'Consumidor final',
        items: saleItems,
        total: getTotalAmount(),
        totalProfit: getTotalProfit(),
        averageMargin: getAverageMargin()
      };
      
      const { error } = await addSale(newSale);
      
      if (error) {
        throw error;
      }

      toast({ title: "Venta completada", description: `Venta por $${getTotalAmount().toLocaleString()}` });
      setSaleItems([]);
      setCustomerName("Consumidor final");
    } catch (error) {
      console.error('Error completing sale:', error);
      toast({ title: "Error", description: "No se pudo completar la venta.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2"><ShoppingCart className="h-5 w-5" /><span>Nueva Venta</span></CardTitle>
          <CardDescription>Registra una nueva venta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <CustomerSelector
            customers={customers}
            selectedCustomer={customerName}
            onCustomerSelect={setCustomerName}
            onQuickAddCustomer={async (name) => {
              const result = await addCustomer({ name });
              if (!result.error) {
                setCustomerName(name);
                toast({ title: "Cliente agregado", description: `Se agregó ${name}.` });
              }
            }}
          />
          <ProductSelectorWithVariants
            products={products}
            selectedProductId={selectedProductId}
            selectedVariantId={selectedVariantId}
            quantity={quantity}
            finalPrice={finalPrice}
            onProductSelect={setSelectedProductId}
            onVariantSelect={(variantId, price) => {
              setSelectedVariantId(variantId || undefined);
              setFinalPrice(price);
            }}
            onQuantityChange={setQuantity}
            onAddItem={addItemToSale}
          />
          <div className="space-y-4">
            <SalesList
              saleItems={saleItems}
              onUpdateQuantity={updateItemQuantity}
              onUpdatePrice={updateItemPrice}
              onRemoveItem={removeItemFromSale}
              totalAmount={getTotalAmount()}
              totalProfit={getTotalProfit()}
              averageMargin={getAverageMargin()}
            />
            {saleItems.length > 0 && (
              <Button onClick={completeSale} className="w-full" variant="default">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Completar Venta
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesTab;