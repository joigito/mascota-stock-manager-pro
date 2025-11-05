
import { useState, useEffect } from "react";
import { Plus, Package, Building2, LogOut, Settings, CreditCard, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductList from "@/components/ProductList";
import AddProductDialog from "@/components/AddProductDialog";
import Dashboard from "@/components/Dashboard";
import SalesTab from "@/components/SalesTab";
import ReportsTab from "@/components/ReportsTab";
import CustomersTab from "@/components/CustomersTab";
import { CurrentAccountTab } from "@/components/CurrentAccountTab";
import SyncButton from "@/components/SyncButton";
import { OrganizationSelector } from "@/components/OrganizationSelector";
import { OrganizationManager } from "@/components/OrganizationManager";
import { OrganizationDashboard } from "@/components/OrganizationDashboard";
import { SuperAdminDashboard } from "@/components/SuperAdminDashboard";
import { OrganizationUserManagement } from "@/components/OrganizationUserManagement";
import { OrganizationUrlGenerator } from "@/components/OrganizationUrlGenerator";
import { UserIndicator } from "@/components/UserIndicator";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { CategoryManager } from "@/components/CategoryManager";
import { useProducts } from "@/hooks/useProducts";
import { useSales } from "@/hooks/useSales";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { products, loading, addProduct, updateProduct, deleteProduct } = useProducts();
  const { sales } = useSales();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                <Building2 className="h-6 w-6 sm:h-10 sm:w-10 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold text-foreground">
                  {currentOrganization?.name || 'Sistemas de Gestión Comercial'}
                </h1>
                <p className="text-xs sm:text-base text-muted-foreground">Plataforma de gestión comercial para múltiples tipos de negocio</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
              {isSuperAdmin && <OrganizationSelector />}
              {isSuperAdmin && (
                <Button
                  onClick={clearOrganization}
                  variant="outline"
                  size="sm"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Panel Central</span>
                  <span className="sm:hidden">Panel</span>
                </Button>
              )}
              <SyncButton />
              <UserIndicator />
              <ModeToggle />
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
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
        {/* Tabs Navigation */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className={`grid w-full mb-6 sm:mb-8 h-auto ${isSuperAdmin ? 'grid-cols-7' : 'grid-cols-6'}`}>
            <TabsTrigger value="dashboard" className="text-xs sm:text-sm px-1 sm:px-3 py-2">
              <span className="hidden sm:inline">Inicio</span>
              <span className="sm:hidden">Inicio</span>
            </TabsTrigger>
            <TabsTrigger value="sales" className="text-xs sm:text-sm px-1 sm:px-3 py-2">
              Ventas
            </TabsTrigger>
            <TabsTrigger value="inventory" className="text-xs sm:text-sm px-1 sm:px-3 py-2">
              <span className="hidden sm:inline">Productos</span>
              <span className="sm:hidden">Prod.</span>
            </TabsTrigger>
            <TabsTrigger value="customers" className="text-xs sm:text-sm px-1 sm:px-3 py-2">
              <span className="hidden sm:inline">Clientes</span>
              <span className="sm:hidden">Clientes</span>
            </TabsTrigger>
            <TabsTrigger value="current-account" className="text-xs sm:text-sm px-1 sm:px-3 py-2">
              <span className="hidden sm:inline">Cta. Cte.</span>
              <span className="sm:hidden">Cta.</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-xs sm:text-sm px-1 sm:px-3 py-2">
              <span className="hidden sm:inline">Reportes</span>
              <span className="sm:hidden">Rep.</span>
            </TabsTrigger>
            {isSuperAdmin && (
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
                      <h2 className="text-lg sm:text-xl font-semibold text-foreground">Productos</h2>
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

          {/* Current Account Tab */}
          <TabsContent value="current-account">
            <CurrentAccountTab />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <ReportsTab products={products} />
          </TabsContent>

          {/* Admin Tab - For super admins only */}
          {isSuperAdmin && (
            <TabsContent value="admin">
              <div className="space-y-6">
                <OrganizationManager />
                <OrganizationUrlGenerator />
              </div>
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

      {/* Category Manager Dialog */}
      <CategoryManager 
        open={isCategoryManagerOpen}
        onOpenChange={setIsCategoryManagerOpen}
      />
    </div>
  );
};

export default Index;
