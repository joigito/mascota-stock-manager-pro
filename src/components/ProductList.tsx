
import { useState } from "react";
import { Edit, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/hooks/useProducts";
import { useProductSearch } from "@/hooks/useProductSearch";
import SearchInput from "@/components/ui/SearchInput";
import EditProductDialog from "./EditProductDialog";
import ProductVariantManager from "./variants/ProductVariantManager";

interface ProductListProps {
  products: Product[];
  onUpdateProduct: (id: string, product: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
  onProductChange?: () => void;
}

const ProductList = ({ products, onUpdateProduct, onDeleteProduct, onProductChange }: ProductListProps) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { searchTerm, setSearchTerm, filteredProducts, resultCount, hasSearchTerm } = useProductSearch(products);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getCategoryBadge = (category: string) => {
    const categoryMap: Record<string, { label: string; className: string }> = {
      'informatica': { label: 'Informática', className: 'bg-blue-100 text-blue-800' },
      'electronica': { label: 'Electrónica', className: 'bg-purple-100 text-purple-800' },
      'accesorios_tecnologia': { label: 'Accesorios Tecnología', className: 'bg-indigo-100 text-indigo-800' },
      'electrodomesticos': { label: 'Electrodomésticos', className: 'bg-orange-100 text-orange-800' },
      'ferreteria': { label: 'Ferretería', className: 'bg-gray-100 text-gray-800' },
      'construccion': { label: 'Construcción', className: 'bg-yellow-100 text-yellow-800' },
      'textil': { label: 'Textil', className: 'bg-pink-100 text-pink-800' },
      'calzado': { label: 'Calzado', className: 'bg-red-100 text-red-800' },
      'juguetes': { label: 'Juguetes', className: 'bg-cyan-100 text-cyan-800' },
      'jardineria': { label: 'Jardinería', className: 'bg-green-100 text-green-800' },
      'automotriz': { label: 'Automotriz', className: 'bg-slate-100 text-slate-800' },
      'bebidas': { label: 'Bebidas', className: 'bg-emerald-100 text-emerald-800' },
      'limpieza': { label: 'Limpieza', className: 'bg-teal-100 text-teal-800' },
      'veterinarios': { label: 'Veterinarios', className: 'bg-lime-100 text-lime-800' },
      'mascotas': { label: 'Mascotas', className: 'bg-blue-100 text-blue-800' },
      'forrajeria': { label: 'Alimentos', className: 'bg-green-100 text-green-800' },
      'alimentos': { label: 'Alimentos', className: 'bg-amber-100 text-amber-800' },
      'general': { label: 'General', className: 'bg-neutral-100 text-neutral-800' }
    };

    const categoryInfo = categoryMap[category] || { label: category, className: 'bg-gray-100 text-gray-800' };
    return <Badge variant="secondary" className={categoryInfo.className}>{categoryInfo.label}</Badge>;
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
      <div className="p-6 sm:p-8 text-center">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No hay productos</h3>
        <p className="text-muted-foreground">Comienza agregando tu primer producto al inventario.</p>
      </div>
    );
  }

  if (hasSearchTerm && filteredProducts.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            className="w-full sm:max-w-sm"
          />
        </div>
        <div className="p-6 sm:p-8 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No se encontraron productos</h3>
          <p className="text-muted-foreground">
            No hay productos que coincidan con "{searchTerm}"
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Search Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          className="w-full sm:max-w-sm"
        />
        {hasSearchTerm && (
          <div className="text-sm text-muted-foreground">
            {resultCount} producto{resultCount !== 1 ? 's' : ''} encontrado{resultCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="block sm:hidden">
        <div className="divide-y divide-border">
          {filteredProducts.map((product) => (
            <div key={product.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium truncate">{product.name}</h3>
                  {product.baseSku && (
                    <p className="text-xs text-muted-foreground mt-1">SKU: {product.baseSku}</p>
                  )}
                  {product.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
                  )}
                </div>
                <div className="flex space-x-1 ml-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingProduct(product)}
                    className="text-blue-600 hover:text-blue-700 p-1 h-8 w-8"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteProduct(product.id)}
                    className="text-red-600 hover:text-red-700 p-1 h-8 w-8"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {getCategoryBadge(product.category)}
                {getStockStatus(product.stock, product.minStock)}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-500">Stock:</span>
                  <div className="font-medium">
                    {product.hasVariants ? (
                      <span className="text-blue-600">Ver variantes</span>
                    ) : (
                      `${product.stock} unidades`
                    )}
                  </div>
                  <div className="text-gray-400">Mín: {product.minStock}</div>
                </div>
                <div>
                  <span className="text-gray-500">Precio:</span>
                  <div className="font-medium">{formatCurrency(product.price)}</div>
                  {product.hasVariants && (
                    <div className="text-xs text-blue-600">Precio base</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
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
          <tbody className="bg-background divide-y divide-border">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium">{product.name}</div>
                    {product.baseSku && (
                      <div className="text-xs text-muted-foreground">SKU: {product.baseSku}</div>
                    )}
                    {product.description && (
                      <div className="text-sm text-muted-foreground">{product.description}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getCategoryBadge(product.category)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {product.hasVariants ? (
                      <span className="text-blue-600">Ver variantes</span>
                    ) : (
                      `${product.stock} unidades`
                    )}
                  </div>
                  <div className="text-xs text-gray-500">Mín: {product.minStock}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatCurrency(product.price)}</div>
                  {product.hasVariants && (
                    <div className="text-xs text-blue-600">Precio base</div>
                  )}
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

      {/* Product Variant Managers */}
      {products.filter(product => product.hasVariants).map((product) => (
        <div key={`variants-${product.id}`} className="mt-6">
          <ProductVariantManager
            productId={product.id}
            productName={product.name}
            hasVariants={product.hasVariants}
            onVariantsChange={onProductChange}
          />
        </div>
      ))}

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
