import { useMemo, useState } from "react";
import { Product } from "./useProducts";

export const useProductSearch = (products: Product[]) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = useMemo(() => {
    console.log("🔍 useProductSearch - searchTerm:", searchTerm);
    console.log("🔍 useProductSearch - products count:", products.length);
    
    if (!searchTerm.trim()) {
      console.log("🔍 No search term, returning all products");
      return products;
    }

    const normalizedSearchTerm = searchTerm.toLowerCase().trim();
    console.log("🔍 Normalized search term:", normalizedSearchTerm);

    const filtered = products.filter((product) => {
      // Search in product name
      const nameMatch = product.name.toLowerCase().includes(normalizedSearchTerm);
      
      // Search in base SKU
      const skuMatch = product.baseSku?.toLowerCase().includes(normalizedSearchTerm);
      
      // Search in description
      const descriptionMatch = product.description?.toLowerCase().includes(normalizedSearchTerm);

      const matches = nameMatch || skuMatch || descriptionMatch;
      if (matches) {
        console.log("🔍 Product matches:", product.name, "baseSku:", product.baseSku);
      }
      
      return matches;
    });
    
    console.log("🔍 Filtered products count:", filtered.length);
    return filtered;
  }, [products, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filteredProducts,
    resultCount: filteredProducts.length,
    hasSearchTerm: searchTerm.trim().length > 0
  };
};