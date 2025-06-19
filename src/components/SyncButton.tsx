
import { useState } from "react";
import { RefreshCw, Cloud, CloudOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useProducts } from "@/hooks/useProducts";
import { useSalesData } from "@/hooks/useSalesData";
import { useCustomers } from "@/hooks/useCustomers";
import { Badge } from "@/components/ui/badge";

const SyncButton = () => {
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();
  const { syncProducts } = useProducts();
  const { syncSales } = useSalesData();
  const { syncCustomers } = useCustomers();

  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      await Promise.all([
        syncProducts(),
        syncSales(),
        syncCustomers()
      ]);

      toast({
        title: "Sincronización completa",
        description: "Todos los datos se han actualizado desde la base de datos",
      });
    } catch (error) {
      toast({
        title: "Error de sincronización",
        description: "Algunos datos no se pudieron sincronizar",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Badge variant="outline" className="flex items-center space-x-1">
        <Cloud className="h-3 w-3 text-green-500" />
        <span className="text-xs">En línea</span>
      </Badge>
      <Button 
        onClick={handleSyncAll} 
        disabled={syncing}
        variant="outline"
        size="sm"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
        {syncing ? 'Sincronizando...' : 'Sincronizar Todo'}
      </Button>
    </div>
  );
};

export default SyncButton;
