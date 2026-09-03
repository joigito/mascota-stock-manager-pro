import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ShoppingCart, Package, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Product } from "@/hooks/useProducts";
import { useSales } from "@/hooks/useSales";
import { useCustomers } from "@/hooks/useCustomers";
import { useOrganization } from "@/hooks/useOrganization";
import { useCurrentAccount } from "@/hooks/useCurrentAccount";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { supabase } from "@/integrations/supabase/client";
import { useProductVariants } from "@/hooks/useProductVariants";
import { generateSaleReceipt } from "@/utils/saleReceiptGenerator";
import ProductSelectorWithVariants from "./sales/ProductSelectorWithVariants";
import SearchInput from "@/components/ui/SearchInput";
import { useProductSearch } from "@/hooks/useProductSearch";
import SalesList from "./sales/SalesList";
import CustomerSelector from "./sales/CustomerSelector";
import FreeItemInput from "./sales/FreeItemInput";
import { SaleItem } from "@/types/sales";

interface SalesTabProps {
  products: Product[];
  onUpdateProduct: (id: string, updates: Partial<Product>) => Promise<{ error: any }>;
}

const SalesTab = ({ products, onUpdateProduct }: SalesTabProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { addSale } = useSales();
  const { customers, addCustomer } = useCustomers();
  const { currentOrganization } = useOrganization();
  const { isEnabled: isCurrentAccountEnabled, addTransaction, accounts: customerAccounts } = useCurrentAccount();
  const { isEnabled: variantsEnabled } = useFeatureFlag('use_variants', currentOrganization?.id);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>();
  const [selectedVariantInfo, setSelectedVariantInfo] = useState<string | undefined>();
  const [selectedVariantStock, setSelectedVariantStock] = useState<number | undefined>();
  const [finalPrice, setFinalPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [customerName, setCustomerName] = useState<string>("Consumidor final");
  const [isCreditSale, setIsCreditSale] = useState(false);
  const [isProductPanelOpen, setIsProductPanelOpen] = useState(false);

  const selectedCustomer = customers.find(c => c.name === customerName);
  const canUseCreditSale = isCurrentAccountEnabled && selectedCustomer && customerName !== "Consumidor final";
  const customerAccount = selectedCustomer
    ? customerAccounts.find(a => a.customer_id === selectedCustomer.id)
    : undefined;
  const currentBalance = Number(customerAccount?.balance || 0);

  const addItemToSale = () => {
    if (!selectedProductId) {
      toast({ title: "Error", description: "Por favor selecciona un producto", variant: "destructive" });
      return;
    }

    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    const isVariantProduct = product.hasVariants && variantsEnabled;

    if (isVariantProduct && !selectedVariantId) {
      toast({ title: "Error", description: "Selecciona una variante del producto", variant: "destructive" });
      return;
    }

    const availableStock = isVariantProduct
      ? (selectedVariantStock ?? 0)
      : product.stock;
    let currentPrice = finalPrice || product.price;

    if (quantity > availableStock) {
      toast({ title: "Stock insuficiente", description: `Solo hay ${availableStock} unidades disponibles`, variant: "destructive" });
      return;
    }

    const existingItemIndex = saleItems.findIndex(item =>
      item.productId === selectedProductId && item.variantId === selectedVariantId
    );
    
    if (existingItemIndex >= 0) {
      const newItems = [...saleItems];
      const newQuantity = newItems[existingItemIndex].quantity + quantity;
      
      if (newQuantity > availableStock) {
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
        variantInfo: selectedVariantInfo,
        quantity,
        price: product.price,
        finalUnitPrice: currentPrice,
        costPrice: product.costPrice || 0,
        subtotal,
        profit,
        margin
      };
      setSaleItems([...saleItems, newItem]);
    }

    setSelectedProductId("");
    setSelectedVariantId(undefined);
    setSelectedVariantInfo(undefined);
    setSelectedVariantStock(undefined);
    setFinalPrice(0);
    setQuantity(1);
  };

  const addFreeItemToSale = (freeItemData: {
    name: string;
    price: number;
    quantity: number;
    cost: number;
  }) => {
    const subtotal = freeItemData.quantity * freeItemData.price;
    const profit = freeItemData.quantity * (freeItemData.price - freeItemData.cost);
    const margin = freeItemData.price > 0 
      ? ((freeItemData.price - freeItemData.cost) / freeItemData.price * 100) 
      : 0;
    
    const newItem: SaleItem = {
      productId: '',
      productName: freeItemData.name,
      quantity: freeItemData.quantity,
      price: freeItemData.price,
      finalUnitPrice: freeItemData.price,
      costPrice: freeItemData.cost,
      subtotal,
      profit,
      margin
    };
    
    setSaleItems([...saleItems, newItem]);
    toast({ 
      title: "Item agregado", 
      description: `${freeItemData.name} agregado a la venta` 
    });
  };

  const removeItemFromSale = (productId: string, variantId?: string) => {
    setSaleItems(saleItems.filter(item => 
      !(item.productId === productId && item.variantId === variantId)
    ));
  };

  const updateItemQuantity = async (productId: string, newQuantity: number, variantId?: string) => {
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

    if (product.hasVariants && variantId) {
      const { data: variant } = await supabase
        .from('product_variants')
        .select('stock')
        .eq('id', variantId)
        .single();
      if (variant && newQuantity > variant.stock) {
        toast({ title: "Stock insuficiente", description: `Solo hay ${variant.stock} unidades disponibles de esta variante`, variant: "destructive" });
        return;
      }
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

    // Validate stock for all items before processing
    for (const item of saleItems) {
      if (!item.productId) continue;
      const product = products.find(p => p.id === item.productId);
      if (!product) continue;

      if (!product.hasVariants) {
        if (item.quantity > product.stock) {
          toast({ 
            title: "Stock insuficiente", 
            description: `${product.name}: solo hay ${product.stock} unidades disponibles`, 
            variant: "destructive" 
          });
          return;
        }
      } else if (item.variantId) {
        const { data: variant } = await supabase
          .from('product_variants')
          .select('stock')
          .eq('id', item.variantId)
          .single();
        if (variant && item.quantity > variant.stock) {
          toast({ 
            title: "Stock insuficiente", 
            description: `${product.name}: solo hay ${variant.stock} unidades de esta variante`, 
            variant: "destructive" 
          });
          return;
        }
      }
    }

    try {
      for (const item of saleItems) {
        if (!item.productId) continue;
        const product = products.find(p => p.id === item.productId);
        if (!product) continue;

        if (!product.hasVariants) {
          await onUpdateProduct(item.productId, { stock: product.stock - item.quantity });
        } else if (item.variantId) {
          const { data: variant } = await supabase
            .from('product_variants')
            .select('stock')
            .eq('id', item.variantId)
            .single();
          if (variant) {
            await supabase
              .from('product_variants')
              .update({ stock: variant.stock - item.quantity })
              .eq('id', item.variantId);
          }
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
      
      const { error, saleId } = await addSale(newSale);
      
      if (error) {
        throw error;
      }

      // Register credit sale in current account if enabled
      if (isCreditSale && selectedCustomer && saleId) {
        await addTransaction(
          selectedCustomer.id,
          'sale',
          getTotalAmount(),
          `Venta a crédito #${saleId.slice(0, 8)}`,
          saleId
        );
      }

      toast({ title: "Venta completada", description: `Venta por $${getTotalAmount().toLocaleString()}${isCreditSale ? ' (a crédito)' : ''}` });

      // Generate printable receipt
      const completedSale: import("@/types/sales").Sale = {
        id: saleId || '',
        date: newSale.date,
        customer: newSale.customer,
        items: newSale.items,
        total: newSale.total,
        totalProfit: newSale.totalProfit,
        averageMargin: newSale.averageMargin,
      };
      if (window.confirm('¿Imprimir comprobante?')) {
        generateSaleReceipt(completedSale, currentOrganization?.name || 'Mi Negocio');
      }

      setSaleItems([]);
      setCustomerName("Consumidor final");
      setIsCreditSale(false);
      await queryClient.invalidateQueries({ queryKey: ['product-variants'] });
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
          {canUseCreditSale && (
            <div className="space-y-2 p-3 rounded-lg border bg-muted/50">
              <div className="flex items-center space-x-3">
                <Switch
                  id="credit-sale"
                  checked={isCreditSale}
                  onCheckedChange={setIsCreditSale}
                />
                <Label htmlFor="credit-sale" className="cursor-pointer text-sm font-medium">
                  Venta a crédito (cargar a cuenta corriente de {customerName})
                </Label>
              </div>
              <div className="text-sm text-muted-foreground pl-12 space-y-0.5">
                <div>
                  Saldo actual:{" "}
                  <span className={`font-semibold ${currentBalance > 0 ? "text-destructive" : "text-foreground"}`}>
                    ${currentBalance.toLocaleString()}
                  </span>
                </div>
                {isCreditSale && saleItems.length > 0 && (
                  <div>
                    Saldo después de esta venta:{" "}
                    <span className="font-semibold text-destructive">
                      ${(currentBalance + getTotalAmount()).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label className="text-xs uppercase text-muted-foreground">Agregar item libre</Label>
            <FreeItemInput onAddFreeItem={addFreeItemToSale} />
          </div>

          <Collapsible open={isProductPanelOpen} onOpenChange={setIsProductPanelOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Buscar producto del inventario
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isProductPanelOpen ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <ProductSelectorWithVariants
                products={products}
                selectedProductId={selectedProductId}
                selectedVariantId={selectedVariantId}
                quantity={quantity}
                finalPrice={finalPrice}
                onProductSelect={(productId) => {
                  setSelectedProductId(productId);
                  setSelectedVariantId(undefined);
                  setSelectedVariantInfo(undefined);
                  setSelectedVariantStock(undefined);
                  setFinalPrice(0);
                }}
                onVariantSelect={(variantId, price, variantInfo, variantStock) => {
                  setSelectedVariantId(variantId || undefined);
                  setSelectedVariantInfo(variantInfo);
                  setSelectedVariantStock(variantStock);
                  setFinalPrice(price);
                }}
                onQuantityChange={setQuantity}
                onAddItem={addItemToSale}
              />
            </CollapsibleContent>
          </Collapsible>

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