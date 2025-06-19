
import { useState } from "react";
import { Plus, Package, PawPrint, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductList from "@/components/ProductList";
import AddProductDialog from "@/components/AddProductDialog";
import StockAlert from "@/components/StockAlert";
import Dashboard from "@/components/Dashboard";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { products, loading, addProduct, updateProduct, deleteProduct } = useProducts();
  const { user, signOut } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const lowStockProducts = products.filter(product => product.stock <= product.minStock);

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user?.email}</span>
              </div>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Producto
              </Button>
              <Button 
                onClick={handleSignOut}
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stock Alerts */}
        {lowStockProducts.length > 0 && (
          <div className="mb-8">
            <StockAlert products={lowStockProducts} />
          </div>
        )}

        {/* Dashboard */}
        <div className="mb-8">
          <Dashboard products={products} />
        </div>

        {/* Product List */}
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

      {/* Add Product Dialog */}
      <AddProductDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddProduct={addProduct}
      />
    </div>
  );
};

export default Index;
