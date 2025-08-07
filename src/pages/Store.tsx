import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductList from '@/components/ProductList';
import AddProductDialog from '@/components/AddProductDialog';
import StockAlert from '@/components/StockAlert';
import Dashboard from '@/components/Dashboard';
import SalesTab from '@/components/SalesTab';
import ReportsTab from '@/components/ReportsTab';
import CustomersTab from '@/components/CustomersTab';
import { StoreLayout } from '@/components/StoreLayout';
import { useStoreSlug } from '@/hooks/useStoreSlug';
import { useProducts } from '@/hooks/useProducts';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/hooks/useOrganization';

const Store: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { organization, loading: storeLoading, error } = useStoreSlug(slug);
  const { products, loading: productsLoading, addProduct, updateProduct, deleteProduct } = useProducts();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { user } = useAuth();
  const { switchOrganization } = useOrganization();

  // Auto-switch to the organization when it loads
  useEffect(() => {
    if (organization && user) {
      console.log('Store: Auto-switching to organization:', organization);
      // Always switch to the store's organization for personalized experience
      switchOrganization(organization);
    }
  }, [organization?.id, user?.id, switchOrganization]);

  if (storeLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tienda...</p>
        </div>
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏪</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tienda no encontrada</h1>
          <p className="text-gray-600 mb-4">
            La tienda que buscas no existe o no tienes acceso a ella.
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  const lowStockProducts = products.filter(product => product.stock <= product.minStock);

  return (
    <StoreLayout organization={organization}>
      {/* Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <StockAlert products={lowStockProducts} />
        </div>
      )}

      {/* Tabs Navigation */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6 sm:mb-8 h-auto">
          <TabsTrigger value="dashboard" className="text-xs sm:text-sm px-1 sm:px-3 py-2">
            <span className="hidden sm:inline">Inicio</span>
            <span className="sm:hidden">Inicio</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="text-xs sm:text-sm px-1 sm:px-3 py-2">
            <span className="hidden sm:inline">Inventario</span>
            <span className="sm:hidden">Stock</span>
          </TabsTrigger>
          <TabsTrigger value="sales" className="text-xs sm:text-sm px-1 sm:px-3 py-2">
            Ventas
          </TabsTrigger>
          <TabsTrigger value="customers" className="text-xs sm:text-sm px-1 sm:px-3 py-2">
            <span className="hidden sm:inline">Clientes</span>
            <span className="sm:hidden">Clientes</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="text-xs sm:text-sm px-1 sm:px-3 py-2">
            <span className="hidden sm:inline">Reportes</span>
            <span className="sm:hidden">Rep.</span>
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6 sm:space-y-8">
          <Dashboard products={products} />
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-green-600" />
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Inventario de Productos</h2>
                </div>
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Producto
                </Button>
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

      {/* Add Product Dialog */}
      <AddProductDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddProduct={addProduct}
        storeName={organization?.name}
      />
    </StoreLayout>
  );
};

export default Store;