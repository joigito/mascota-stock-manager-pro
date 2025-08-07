
import { useState, useEffect } from "react";
import { Plus, Package, PawPrint, LogOut, Settings, Building2 } from "lucide-react";
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
import { OrganizationSelector } from "@/components/OrganizationSelector";
import { OrganizationManager } from "@/components/OrganizationManager";
import { OrganizationDashboard } from "@/components/OrganizationDashboard";
import { SuperAdminDashboard } from "@/components/SuperAdminDashboard";
import { OrganizationUserManagement } from "@/components/OrganizationUserManagement";
import { OrganizationUrlGenerator } from "@/components/OrganizationUrlGenerator";
import { UserIndicator } from "@/components/UserIndicator";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { products, loading, addProduct, updateProduct, deleteProduct } = useProducts();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const { signOut, user } = useAuth();
  const { currentOrganization, isSuperAdmin: checkSuperAdmin, isAdmin: checkOrgAdmin, clearOrganization, loading: orgLoading } = useOrganization();
  const { toast } = useToast();

  useEffect(() => {
    const loadSuperAdminStatus = async () => {
      const isSuper = await checkSuperAdmin();
      const isOrgAdm = await checkOrgAdmin();
      console.log('Index: Super admin status:', isSuper);
      console.log('Index: Org admin status:', isOrgAdm);
      setIsSuperAdmin(isSuper);
      setIsOrgAdmin(isOrgAdm);
    };
    
    if (user?.id && currentOrganization) {
      loadSuperAdminStatus();
    }
  }, [user?.id, currentOrganization, checkSuperAdmin, checkOrgAdmin]);

  useEffect(() => {
    console.log('Index: currentOrganization changed:', currentOrganization);
    console.log('Index: orgLoading:', orgLoading);
    console.log('Index: isSuperAdmin:', isSuperAdmin);
    console.log('Index: Will show SuperAdminDashboard?', isSuperAdmin && !currentOrganization && !orgLoading);
    console.log('Index: Will show OrganizationDashboard?', !orgLoading && !currentOrganization && !isSuperAdmin);
    setForceUpdate(prev => prev + 1);
  }, [currentOrganization, orgLoading, isSuperAdmin]);

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

  if (loading || orgLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  // Show super admin dashboard if no organization is selected and user is super admin
  if (!currentOrganization && isSuperAdmin) {
    console.log('Index: Showing SuperAdminDashboard');
    return <SuperAdminDashboard />;
  }

  // Log current organization for debugging
  console.log('Index: Current organization:', currentOrganization);
  console.log('Index: Organization loading:', orgLoading);
  console.log('Index: Is super admin:', isSuperAdmin);

  // Show organization dashboard if no organization is selected
  if (!currentOrganization && !orgLoading) {
    return <OrganizationDashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-orange-500 rounded-xl shadow-lg">
                <PawPrint className="h-6 w-6 sm:h-10 sm:w-10 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900">
                  {currentOrganization?.name || 'Sistema de Inventario'}
                </h1>
                <p className="text-xs sm:text-base text-gray-600">Gestión de inventario para mascotas y forrajería</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
              {isSuperAdmin && <OrganizationSelector />}
              {isSuperAdmin && (
                <Button
                  onClick={clearOrganization}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Panel Central</span>
                  <span className="sm:hidden">Panel</span>
                </Button>
              )}
              <SyncButton />
              <UserIndicator />
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="border-gray-300 hover:bg-gray-50 flex-1 sm:flex-none"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
                <span className="sm:hidden">Salir</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Stock Alerts */}
        {lowStockProducts.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <StockAlert products={lowStockProducts} />
          </div>
        )}

        {/* Tabs Navigation */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className={`grid w-full mb-6 sm:mb-8 h-auto ${isSuperAdmin || isOrgAdmin ? 'grid-cols-6' : 'grid-cols-5'}`}>
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
            {(isSuperAdmin || isOrgAdmin) && (
              <TabsTrigger value="admin" className="text-xs sm:text-sm px-1 sm:px-3 py-2">
                <span className="hidden sm:inline">{isSuperAdmin ? 'Admin' : 'Usuarios'}</span>
                <span className="sm:hidden">{isSuperAdmin ? 'Admin' : 'Users'}</span>
              </TabsTrigger>
            )}
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

          {/* Admin Tab - For super admins and org admins */}
          {isSuperAdmin && (
            <TabsContent value="admin">
              <div className="space-y-6">
                <OrganizationManager />
                <OrganizationUrlGenerator />
              </div>
            </TabsContent>
          )}
          {isOrgAdmin && !isSuperAdmin && (
            <TabsContent value="admin">
              <OrganizationUserManagement />
            </TabsContent>
          )}
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
