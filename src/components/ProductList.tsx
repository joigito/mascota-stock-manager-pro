
import { useState } from "react";
import { Edit, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/pages/Index";
import EditProductDialog from "./EditProductDialog";

interface ProductListProps {
  products: Product[];
  onUpdateProduct: (id: string, product: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
}

const ProductList = ({ products, onUpdateProduct, onDeleteProduct }: ProductListProps) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getCategoryBadge = (category: string) => {
    if (category === "mascotas") {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Mascotas</Badge>;
    }
    return <Badge variant="secondary" className="bg-green-100 text-green-800">Forrajería</Badge>;
  };

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock <= minStock) {
      return <Badge variant="destructive">Stock Bajo</Badge>;
    }
    if (stock <= minStock * 1.5) {
      return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Stock Medio</Badge>;
    }
    return <Badge variant="outline" className="border-green-500 text-green-700">Stock Bueno</Badge>;
  };

  if (products.length === 0) {
    return (
      <div className="p-8 text-center">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos</h3>
        <p className="text-gray-500">Comienza agregando tu primer producto al inventario.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    {product.description && (
                      <div className="text-sm text-gray-500">{product.description}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getCategoryBadge(product.category)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{product.stock} unidades</div>
                  <div className="text-xs text-gray-500">Mín: {product.minStock}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(product.price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStockStatus(product.stock, product.minStock)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingProduct(product)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteProduct(product.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingProduct && (
        <EditProductDialog
          product={editingProduct}
          open={!!editingProduct}
          onOpenChange={(open) => !open && setEditingProduct(null)}
          onUpdateProduct={(updatedProduct) => {
            onUpdateProduct(editingProduct.id, updatedProduct);
            setEditingProduct(null);
          }}
        />
      )}
    </>
  );
};

export default ProductList;
