
import { useState } from "react";
import { Plus, Package, AlertTriangle, TrendingUp, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProductList from "@/components/ProductList";
import AddProductDialog from "@/components/AddProductDialog";
import StockAlert from "@/components/StockAlert";
import Dashboard from "@/components/Dashboard";

export interface Product {
  id: string;
  name: string;
  category: "mascotas" | "forrajeria";
  stock: number;
  minStock: number;
  price: number;
  description?: string;
}

const Index = () => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Alimento Premium para Perros Adultos",
      category: "mascotas",
      stock: 15,
      minStock: 10,
      price: 45000,
      description: "Alimento balanceado para perros adultos de razas medianas y grandes"
    },
    {
      id: "2",
      name: "Concentrado para Pollos",
      category: "forrajeria",
      stock: 5,
      minStock: 8,
      price: 32000,
      description: "Concentrado nutritivo para pollos en etapa de crecimiento"
    },
    {
      id: "3",
      name: "Arena Sanitaria para Gatos",
      category: "mascotas",
      stock: 20,
      minStock: 5,
      price: 18000,
      description: "Arena aglomerante con control de olores"
    },
    {
      id: "4",
      name: "Suplemento Vitamínico Bovino",
      category: "forrajeria",
      stock: 3,
      minStock: 5,
      price: 85000,
      description: "Complejo vitamínico para ganado bovino"
    }
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const addProduct = (product: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString()
    };
    setProducts([...products, newProduct]);
  };

  const updateProduct = (id: string, updatedProduct: Partial<Product>) => {
    setProducts(products.map(product => 
      product.id === id ? { ...product, ...updatedProduct } : product
    ));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const lowStockProducts = products.filter(product => product.stock <= product.minStock);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-500 to-orange-500 rounded-lg">
                <PawPrint className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">PetStock Manager Pro</h1>
                <p className="text-sm text-gray-600">Gestión de inventario para mascotas y forrajería</p>
              </div>
            </div>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Producto
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alertas de Stock Bajo */}
        {lowStockProducts.length > 0 && (
          <div className="mb-8">
            <StockAlert products={lowStockProducts} />
          </div>
        )}

        {/* Dashboard */}
        <div className="mb-8">
          <Dashboard products={products} />
        </div>

        {/* Lista de Productos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Inventario de Productos</h2>
            </div>
          </div>
          <ProductList 
            products={products}
            onUpdateProduct={updateProduct}
            onDeleteProduct={deleteProduct}
          />
        </div>
      </main>

      {/* Dialog para agregar productos */}
      <AddProductDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddProduct={addProduct}
      />
    </div>
  );
};

export default Index;
