
import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Product } from "@/hooks/useProducts";
import ProductSelector from "./sales/ProductSelector";
import SalesList from "./sales/SalesList";

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

interface SalesTabProps {
  products: Product[];
  onUpdateProduct: (id: string, updates: Partial<Product>) => Promise<{ error: any }>;
}

const SalesTab = ({ products, onUpdateProduct }: SalesTabProps) => {
  const { toast } = useToast();
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [customerName, setCustomerName] = useState<string>("");

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

    if (quantity > product.stock) {
      toast({
        title: "Stock insuficiente",
        description: `Solo hay ${product.stock} unidades disponibles`,
        variant: "destructive",
      });
      return;
    }

    const existingItemIndex = saleItems.findIndex(item => item.productId === selectedProductId);
    
    if (existingItemIndex >= 0) {
      const newItems = [...saleItems];
      const newQuantity = newItems[existingItemIndex].quantity + quantity;
      
      if (newQuantity > product.stock) {
        toast({
          title: "Stock insuficiente",
          description: `Solo hay ${product.stock} unidades disponibles`,
          variant: "destructive",
        });
        return;
      }
      
      const subtotal = newQuantity * product.price;
      const profit = newQuantity * (product.price - (product.costPrice || 0));
      const margin = product.price > 0 ? ((product.price - (product.costPrice || 0)) / product.price * 100) : 0;
      
      newItems[existingItemIndex].quantity = newQuantity;
      newItems[existingItemIndex].subtotal = subtotal;
      newItems[existingItemIndex].profit = profit;
      newItems[existingItemIndex].margin = margin;
      setSaleItems(newItems);
    } else {
      const subtotal = quantity * product.price;
      const profit = quantity * (product.price - (product.costPrice || 0));
      const margin = product.price > 0 ? ((product.price - (product.costPrice || 0)) / product.price * 100) : 0;
      
      const newItem: SaleItem = {
        productId: selectedProductId,
        productName: product.name,
        quantity,
        price: product.price,
        costPrice: product.costPrice || 0,
        subtotal,
        profit,
        margin
      };
      setSaleItems([...saleItems, newItem]);
    }

    setSelectedProductId("");
    setQuantity(1);
  };

  const removeItemFromSale = (productId: string) => {
    setSaleItems(saleItems.filter(item => item.productId !== productId));
  };

  const updateItemQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItemFromSale(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (newQuantity > product.stock) {
      toast({
        title: "Stock insuficiente",
        description: `Solo hay ${product.stock} unidades disponibles`,
        variant: "destructive",
      });
      return;
    }

    setSaleItems(saleItems.map(item => {
      if (item.productId === productId) {
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
      // Actualizar stock de productos
      for (const item of saleItems) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          await onUpdateProduct(item.productId, {
            stock: product.stock - item.quantity
          });
        }
      }

      // Guardar venta en localStorage
      const sales = JSON.parse(localStorage.getItem('sales') || '[]');
      const newSale = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        customer: customerName || 'Cliente General',
        items: saleItems,
        total: getTotalAmount(),
        totalProfit: getTotalProfit(),
        averageMargin: getAverageMargin()
      };
      
      sales.push(newSale);
      localStorage.setItem('sales', JSON.stringify(sales));

      toast({
        title: "Venta completada",
        description: `Venta por $${getTotalAmount().toLocaleString()} con ganancia de $${getTotalProfit().toLocaleString()} (${getAverageMargin().toFixed(1)}% margen)`,
      });

      // Limpiar formulario
      setSaleItems([]);
      setCustomerName("");
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo completar la venta",
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
          {/* Customer Info */}
          <div className="space-y-2">
            <Label htmlFor="customer">Cliente (Opcional)</Label>
            <Input
              id="customer"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nombre del cliente..."
            />
          </div>

          {/* Product Selection */}
          <ProductSelector
            products={products}
            selectedProductId={selectedProductId}
            quantity={quantity}
            onProductSelect={setSelectedProductId}
            onQuantityChange={setQuantity}
            onAddItem={addItemToSale}
          />

          {/* Sale Items */}
          <div className="space-y-4">
            <SalesList
              saleItems={saleItems}
              onUpdateQuantity={updateItemQuantity}
              onRemoveItem={removeItemFromSale}
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
