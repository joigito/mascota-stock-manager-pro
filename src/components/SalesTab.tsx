import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Product } from "@/hooks/useProducts";
import { useSales } from "@/hooks/useSales";
import { useCustomers } from "@/hooks/useCustomers";
import { useBatches } from "@/hooks/useBatches";
import ProductSelectorWithVariants from "./sales/ProductSelectorWithVariants";
import SalesList from "./sales/SalesList";
import CustomerSelector from "./sales/CustomerSelector";

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
  const [customerName, setCustomerName] = useState<string>("Cliente General");

  const addItemToSale = () => {
    if (!selectedProductId) {
      toast({
        title: "Error",
        description: "Por favor selecciona un producto",
        variant: "destructive",
      });
      return;
    }

    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    // For products with variants, check variant stock; for simple products, check product stock
    let availableStock = 0;
    let currentPrice = finalPrice || product.price;
    let variantInfo = "";

    if (product.hasVariants && selectedVariantId) {
      // We'll need to get variant stock from the variant itself
      // For now, assume the finalPrice and stock validation is handled by the selector
      availableStock = 999; // Placeholder - should come from variant
      variantInfo = `Variante: ${selectedVariantId}`;
    } else if (!product.hasVariants) {
      availableStock = product.stock;
    } else {
      toast({
        title: "Error",
        description: "Por favor selecciona una variante para este producto",
        variant: "destructive",
      });
      return;
    }

    if (quantity > availableStock && availableStock !== 999) {
      toast({
        title: "Stock insuficiente",
        description: `Solo hay ${availableStock} unidades disponibles`,
        variant: "destructive",
      });
      return;
    }

    const itemKey = selectedVariantId ? `${selectedProductId}-${selectedVariantId}` : selectedProductId;
    const existingItemIndex = saleItems.findIndex(item => 
      item.productId === selectedProductId && item.variantId === selectedVariantId
    );
    
    if (existingItemIndex >= 0) {
      const newItems = [...saleItems];
      const newQuantity = newItems[existingItemIndex].quantity + quantity;
      
      if (newQuantity > availableStock && availableStock !== 999) {
        toast({
          title: "Stock insuficiente",
          description: `Solo hay ${availableStock} unidades disponibles`,
          variant: "destructive",
        });
        return;
      }
      
      const subtotal = newQuantity * currentPrice;
      const profit = newQuantity * (currentPrice - (product.costPrice || 0));
      const margin = currentPrice > 0 ? ((currentPrice - (product.costPrice || 0)) / currentPrice * 100) : 0;
      
      newItems[existingItemIndex].quantity = newQuantity;
      newItems[existingItemIndex].subtotal = subtotal;
      newItems[existingItemIndex].profit = profit;
      newItems[existingItemIndex].margin = margin;
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
        price: currentPrice,
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

    // For variant products, we'll need proper stock validation
    // For now, allow the update but this should be improved with actual variant stock
    if (!product.hasVariants && newQuantity > product.stock) {
      toast({
        title: "Stock insuficiente",
        description: `Solo hay ${product.stock} unidades disponibles`,
        variant: "destructive",
      });
      return;
    }

    setSaleItems(saleItems.map(item => {
      if (item.productId === productId && item.variantId === variantId) {
        const subtotal = newQuantity * item.price;
        const profit = newQuantity * (item.price - item.costPrice);
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

  const getTotalAmount = () => {
    return saleItems.reduce((total, item) => total + item.subtotal, 0);
  };

  const getTotalProfit = () => {
    return saleItems.reduce((total, item) => total + item.profit, 0);
  };

  const getAverageMargin = () => {
    if (saleItems.length === 0) return 0;
    const totalRevenue = getTotalAmount();
    const totalProfit = getTotalProfit();
    return totalRevenue > 0 ? (totalProfit / totalRevenue * 100) : 0;
  };

  const completeSale = async () => {
    if (saleItems.length === 0) {
      toast({
        title: "Error",
        description: "Agrega al menos un producto a la venta",
        variant: "destructive",
      });
      return;
    }

    try {
      // Actualizar lotes FIFO y stock de productos
      for (const item of saleItems) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          // Actualizar lotes usando FIFO
          await updateBatchesAfterSale(item.productId, item.quantity);
          
          // Actualizar stock del producto
          await onUpdateProduct(item.productId, {
            stock: product.stock - item.quantity
          });
        }
      }

      // Crear nueva venta usando el hook
      const newSale = {
        date: new Date().toISOString(),
        customer: customerName || 'Cliente General',
        items: saleItems,
        total: getTotalAmount(),
        totalProfit: getTotalProfit(),
        averageMargin: getAverageMargin()
      };
      
      const { error } = await addSale(newSale);
      
      if (error) {
        throw error;
      }

      toast({
        title: "Venta completada",
        description: `Venta por $${getTotalAmount().toLocaleString()} con ganancia de $${getTotalProfit().toLocaleString()} (${getAverageMargin().toFixed(1)}% margen) - Usando cálculo FIFO`,
      });

      // Limpiar formulario
      setSaleItems([]);
      setCustomerName("Cliente General");
    } catch (error) {
      console.error('Error completing sale:', error);
      toast({
        title: "Error",
        description: "No se pudo completar la venta. Verifique que hay suficiente stock en lotes.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Nueva Venta</span>
          </CardTitle>
          <CardDescription>
            Registra una nueva venta seleccionando productos y cantidades
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Customer Selection */}
          <CustomerSelector
            customers={customers}
            selectedCustomer={customerName}
            onCustomerSelect={setCustomerName}
            onQuickAddCustomer={async (name) => {
              const result = await addCustomer({ name });
              if (!result.error) {
                setCustomerName(name);
                toast({
                  title: "Cliente agregado",
                  description: `Se agregó el cliente ${name} exitosamente.`,
                });
              }
            }}
          />

          {/* Product Selection */}
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

          {/* Sale Items */}
          <div className="space-y-4">
            <SalesList
              saleItems={saleItems}
              onUpdateQuantity={(productId, newQuantity, variantId) => updateItemQuantity(productId, newQuantity, variantId)}
              onRemoveItem={(productId, variantId) => removeItemFromSale(productId, variantId)}
              totalAmount={getTotalAmount()}
              totalProfit={getTotalProfit()}
              averageMargin={getAverageMargin()}
            />

            {saleItems.length > 0 && (
              <Button onClick={completeSale} className="w-full bg-green-600 hover:bg-green-700">
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
