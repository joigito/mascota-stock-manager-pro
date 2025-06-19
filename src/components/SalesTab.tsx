
import { useState } from "react";
import { ShoppingCart, Plus, Minus, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Product } from "@/hooks/useProducts";

interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface SalesTabProps {
  products: Product[];
  onUpdateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
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
      
      newItems[existingItemIndex].quantity = newQuantity;
      newItems[existingItemIndex].subtotal = newQuantity * product.price;
      setSaleItems(newItems);
    } else {
      const newItem: SaleItem = {
        productId: selectedProductId,
        productName: product.name,
        quantity,
        price: product.price,
        subtotal: quantity * product.price
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

    setSaleItems(saleItems.map(item => 
      item.productId === productId 
        ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.price }
        : item
    ));
  };

  const getTotalAmount = () => {
    return saleItems.reduce((total, item) => total + item.subtotal, 0);
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
        total: getTotalAmount()
      };
      
      sales.push(newSale);
      localStorage.setItem('sales', JSON.stringify(sales));

      toast({
        title: "Venta completada",
        description: `Venta por $${getTotalAmount().toLocaleString()} registrada exitosamente`,
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

  const availableProducts = products.filter(p => p.stock > 0);

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Producto</Label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar producto" />
                </SelectTrigger>
                <SelectContent>
                  {availableProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - Stock: {product.stock} - ${product.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Cantidad</Label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="flex items-end">
              <Button onClick={addItemToSale} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </div>
          </div>

          {/* Sale Items */}
          {saleItems.length > 0 && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Productos en la venta:</h3>
                <div className="space-y-3">
                  {saleItems.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex-1">
                        <span className="font-medium">{item.productName}</span>
                        <div className="text-sm text-gray-600">
                          ${item.price} x {item.quantity} = ${item.subtotal.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateItemQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateItemQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeItemFromSale(item.productId)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total:</span>
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      <DollarSign className="h-4 w-4 mr-1" />
                      ${getTotalAmount().toLocaleString()}
                    </Badge>
                  </div>
                </div>
              </div>

              <Button onClick={completeSale} className="w-full bg-green-600 hover:bg-green-700">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Completar Venta
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesTab;
