import { useMemo, useState } from "react";
import { Product } from "./useProducts";

export const useProductSearch = (products: Product[]) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) {
      return products;
    }

    const normalizedSearchTerm = searchTerm.toLowerCase().trim();

    return products.filter((product) => {
      // Search in product name
      const nameMatch = product.name.toLowerCase().includes(normalizedSearchTerm);
      
      // Search in base SKU
      const skuMatch = product.baseSku?.toLowerCase().includes(normalizedSearchTerm);
      
      // Search in description
      const descriptionMatch = product.description?.toLowerCase().includes(normalizedSearchTerm);

      return nameMatch || skuMatch || descriptionMatch;
    });
  }, [products, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filteredProducts,
    resultCount: filteredProducts.length,
    hasSearchTerm: searchTerm.trim().length > 0
  };
};