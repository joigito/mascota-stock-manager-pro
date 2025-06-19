
import { useState } from "react";
import { Plus, Package, PawPrint, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductList from "@/components/ProductList";
import AddProductDialog from "@/components/AddProductDialog";
import StockAlert from "@/components/StockAlert";
import Dashboard from "@/components/Dashboard";
import SalesTab from "@/components/SalesTab";
import ReportsTab from "@/components/ReportsTab";
import CustomersTab from "@/components/CustomersTab";
import SyncButton from "@/components/SyncButton";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { products, loading, addProduct, updateProduct, deleteProduct } = useProducts();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { signOut } = useAuth();
  const { toast } = useToast();

  const lowStockProducts = products.filter(product => product.stock <= product.minStock);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cerrar sesión",
        variant: "destructive",
      });
    }
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
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-orange-500 rounded-xl shadow-lg">
                <PawPrint className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">LA QUERENCIA</h1>
                <p className="text-base text-gray-600">Gestión de inventario para mascotas y forrajería</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <SyncButton />
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
                className="border-gray-300 hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
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

        {/* Tabs Navigation */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="dashboard">Inicio</TabsTrigger>
            <TabsTrigger value="inventory">Inventario</TabsTrigger>
            <TabsTrigger value="sales">Ventas</TabsTrigger>
            <TabsTrigger value="customers">Clientes</TabsTrigger>
            <TabsTrigger value="reports">Reportes</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-8">
            <Dashboard products={products} />
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory">
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
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales">
            <SalesTab products={products} onUpdateProduct={updateProduct} />
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <CustomersTab />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <ReportsTab products={products} />
          </TabsContent>
        </Tabs>
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
