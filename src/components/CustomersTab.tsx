
import { useState } from "react";
import { Users, Plus, Edit, Trash2, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
}

const CustomersTab = () => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('customers');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });

  const saveCustomers = (newCustomers: Customer[]) => {
    setCustomers(newCustomers);
    localStorage.setItem('customers', JSON.stringify(newCustomers));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del cliente es obligatorio",
        variant: "destructive",
      });
      return;
    }

    if (editingCustomer) {
      // Editar cliente existente
      const updatedCustomers = customers.map(customer =>
        customer.id === editingCustomer.id
          ? { ...customer, ...formData }
          : customer
      );
      saveCustomers(updatedCustomers);
      
      toast({
        title: "Cliente actualizado",
        description: "La información del cliente se ha actualizado correctamente",
      });
    } else {
      // Crear nuevo cliente
      const newCustomer: Customer = {
        id: Date.now().toString(),
        ...formData,
        created_at: new Date().toISOString()
      };
      saveCustomers([...customers, newCustomer]);
      
      toast({
        title: "Cliente agregado",
        description: "El cliente se ha registrado correctamente",
      });
    }

    // Limpiar formulario y cerrar dialog
    setFormData({ name: "", email: "", phone: "", address: "" });
    setEditingCustomer(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (customer: Customer) => {
    setFormData({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || ""
    });
    setEditingCustomer(customer);
    setIsDialogOpen(true);
  };

  const handleDelete = (customerId: string) => {
    const updatedCustomers = customers.filter(customer => customer.id !== customerId);
    saveCustomers(updatedCustomers);
    
    toast({
      title: "Cliente eliminado",
      description: "El cliente ha sido eliminado correctamente",
    });
  };

  const openNewCustomerDialog = () => {
    setFormData({ name: "", email: "", phone: "", address: "" });
    setEditingCustomer(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Gestión de Clientes</span>
              </CardTitle>
              <CardDescription>
                Administra la información de tus clientes (opcional para las ventas)
              </CardDescription>
            </div>
            <Button onClick={openNewCustomerDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Cliente
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay clientes registrados</p>
              <p className="text-sm">Los clientes son opcionales para registrar ventas</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {customers.map((customer) => (
                <div key={customer.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{customer.name}</h3>
                      <div className="space-y-1 text-sm text-gray-600 mt-2">
                        {customer.email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4" />
                            <span>{customer.email}</span>
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4" />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                        {customer.address && (
                          <div className="text-gray-600">
                            <strong>Dirección:</strong> {customer.address}
                          </div>
                        )}
                        <div className="text-xs text-gray-400">
                          Registrado: {new Date(customer.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(customer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(customer.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para agregar/editar cliente */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
            </DialogTitle>
            <DialogDescription>
              {editingCustomer 
                ? 'Modifica la información del cliente' 
                : 'Agrega un nuevo cliente al sistema'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre completo del cliente"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="cliente@ejemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Número de teléfono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Dirección completa"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {editingCustomer ? 'Actualizar' : 'Agregar'} Cliente
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomersTab;
