import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Package, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductList from '@/components/ProductList';
import AddProductDialog from '@/components/AddProductDialog';
import Dashboard from '@/components/Dashboard';
import SalesTab from '@/components/SalesTab';
import ReportsTab from '@/components/ReportsTab';
import CustomersTab from '@/components/CustomersTab';
import { StoreLayout } from '@/components/StoreLayout';
import { useStoreSlug } from '@/hooks/useStoreSlug';
import { useProducts } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useSales';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/hooks/useOrganization';
import { OrganizationManager } from '@/components/OrganizationManager';
import { OrganizationUserManagement } from '@/components/OrganizationUserManagement';
import { OrganizationUrlGenerator } from '@/components/OrganizationUrlGenerator';
import { CategoryManager } from '@/components/CategoryManager';

const Store: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { organization, loading: storeLoading, error } = useStoreSlug(slug);
  const { products, loading: productsLoading, addProduct, updateProduct, deleteProduct } = useProducts();
  const { sales } = useSales();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const { user } = useAuth();
  const { switchOrganization, isSuperAdmin, hasRole } = useOrganization();
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);

  // Auto-switch to the organization when it loads
  useEffect(() => {
    if (organization && user) {
      console.log('Store: Auto-switching to organization:', organization);
      // Always switch to the store's organization for personalized experience
      switchOrganization(organization);
    }
  }, [organization?.id, user?.id, switchOrganization]);

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const superAdmin = await isSuperAdmin();
        const orgAdmin = hasRole('admin');
        setIsSuperAdminUser(superAdmin);
        setIsOrgAdmin(orgAdmin);
        console.log('Store: Super admin status:', superAdmin);
        console.log('Store: Org admin status:', orgAdmin);
      }
    };
    checkAdminStatus();
  }, [user, isSuperAdmin, hasRole]);

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

  return (
    <StoreLayout organization={organization}>
      {/* Tabs Navigation */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className={`grid w-full mb-6 sm:mb-8 h-auto ${isSuperAdminUser ? 'grid-cols-6' : 'grid-cols-5'}`}>
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
          {isSuperAdminUser && (
            <TabsTrigger value="admin" className="text-xs sm:text-sm px-1 sm:px-3 py-2">
              <span className="hidden sm:inline">Admin</span>
              <span className="sm:hidden">Admin</span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6 sm:space-y-8">
          <Dashboard products={products} sales={sales} />
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory">
          <div className="space-y-6">
            <div className="bg-card rounded-xl shadow-sm border border-border">
              <div className="p-4 sm:p-6 border-b border-border">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-primary" />
                    <h2 className="text-lg sm:text-xl font-semibold text-foreground">Inventario de Productos</h2>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      onClick={() => setIsCategoryManagerOpen(true)}
                      variant="outline"
                      className="flex-1 sm:flex-none"
                    >
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Categorías
                    </Button>
                    <Button
                      onClick={() => setIsAddDialogOpen(true)}
                      className="shadow-md flex-1 sm:flex-none"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Producto
                    </Button>
                  </div>
                </div>
              </div>
              <ProductList 
                products={products}
                onUpdateProduct={updateProduct}
                onDeleteProduct={deleteProduct}
              />
            </div>
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

        {/* Admin Tab - For super admins only */}
        {isSuperAdminUser && (
          <TabsContent value="admin">
            <div className="space-y-6">
              <OrganizationManager />
              <OrganizationUrlGenerator />
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Add Product Dialog */}
      <AddProductDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddProduct={addProduct}
        storeName={organization?.name}
      />

      {/* Category Manager Dialog */}
      <CategoryManager 
        open={isCategoryManagerOpen}
        onOpenChange={setIsCategoryManagerOpen}
      />
    </StoreLayout>
  );
};

export default Store;