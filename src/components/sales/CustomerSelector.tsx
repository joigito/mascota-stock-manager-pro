import { Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface CustomerSelectorProps {
  customers: Customer[];
  selectedCustomer: string;
  onCustomerSelect: (customer: string) => void;
  onQuickAddCustomer?: (name: string) => void;
}

const CustomerSelector = ({
  customers,
  selectedCustomer,
  onCustomerSelect,
  onQuickAddCustomer
}: CustomerSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label>Cliente</Label>
      <div className="flex gap-2">
        <Select value={selectedCustomer} onValueChange={onCustomerSelect}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Seleccionar cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Consumidor final">
              <div className="flex items-center">  
                <User className="mr-2 h-4 w-4" />
                Consumidor final
              </div>
            </SelectItem>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.name}>
                <div className="flex flex-col">
                  <span className="font-medium">{customer.name}</span>
                  {customer.email && (
                    <span className="text-sm text-muted-foreground">{customer.email}</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {onQuickAddCustomer && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => {
              const name = prompt("Nombre del nuevo cliente:");
              if (name?.trim()) {
                onQuickAddCustomer(name.trim());
              }
            }}
            title="Agregar cliente rápido"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {selectedCustomer !== "Consumidor final" && customers.find(c => c.name === selectedCustomer) && (
        <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
          {(() => {
            const customer = customers.find(c => c.name === selectedCustomer);
            return (
              <div className="space-y-1">
                {customer?.email && <div>📧 {customer.email}</div>}
                {customer?.phone && <div>📞 {customer.phone}</div>}
                {customer?.address && <div>📍 {customer.address}</div>}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default CustomerSelector;