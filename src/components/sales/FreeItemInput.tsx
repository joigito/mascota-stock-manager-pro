import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface FreeItemInputProps {
  onAddFreeItem: (item: {
    name: string;
    price: number;
    quantity: number;
    cost: number;
  }) => void;
}

const FreeItemInput = ({ onAddFreeItem }: FreeItemInputProps) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [cost, setCost] = useState("0");

  const handleAdd = () => {
    if (!name.trim() || !price || parseFloat(price) <= 0) {
      return;
    }

    onAddFreeItem({
      name: name.trim(),
      price: parseFloat(price),
      quantity: parseInt(quantity) || 1,
      cost: parseFloat(cost) || 0
    });

    // Reset form
    setName("");
    setPrice("");
    setQuantity("1");
    setCost("0");
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div>
          <Label htmlFor="free-item-name">Descripción del Item</Label>
          <Input
            id="free-item-name"
            placeholder="Ej: Servicio de instalación, envío, etc."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="free-item-price">Precio Unit.</Label>
            <Input
              id="free-item-price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="free-item-quantity">Cantidad</Label>
            <Input
              id="free-item-quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="free-item-cost">Costo (opcional)</Label>
            <Input
              id="free-item-cost"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
          </div>
        </div>

        <Button 
          onClick={handleAdd} 
          className="w-full"
          disabled={!name.trim() || !price || parseFloat(price) <= 0}
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Item Libre
        </Button>
      </div>
    </Card>
  );
};

export default FreeItemInput;
