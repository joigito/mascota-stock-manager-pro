

## Plan: Comprobante de venta (PDF/imprimible) tipo "X" (no válido como factura)

### Objetivo
Generar un comprobante imprimible para cada venta, con fecha, cliente, detalle de productos y total. Marcado como "Comprobante X - No válido como factura". Debe poder generarse:
1. Al momento de completar una venta (automáticamente o con botón)
2. Posteriormente desde "Ventas Recientes" en Reportes

### Cambios a realizar

#### 1. Crear `src/utils/saleReceiptGenerator.ts`
Función utilitaria que recibe un `Sale` y el nombre de la organización, y genera un HTML imprimible con:
- Encabezado: nombre de la organización, "Comprobante X - No válido como factura"
- Fecha de la venta
- Cliente
- Tabla de productos: nombre (+ variante si aplica), cantidad, precio unitario, subtotal
- Total de la venta
- Pie: "Documento no válido como factura"
- Abre `window.open` y llama a `print()`

#### 2. Modificar `src/components/SalesTab.tsx`
- Importar la función generadora
- Después de `completeSale` exitoso, llamar a la función para abrir el comprobante automáticamente (o preguntar al usuario si desea imprimirlo)
- Pasar `currentOrganization?.name` desde `useOrganization`

#### 3. Modificar `src/components/reports/RecentSalesCard.tsx`
- Agregar un botón "Comprobante" (icono `Receipt` o `FileText`) en cada venta del listado
- Al hacer clic, llamar a la misma función generadora con los datos de esa venta
- Este botón estará disponible para todas las ventas, no solo para admins

### Detalle técnico

**`saleReceiptGenerator.ts`** - Función `generateSaleReceipt(sale: Sale, organizationName: string)`:
- Construye HTML con estilos inline para impresión
- Encabezado con "X" prominente y leyenda "No válido como factura"
- Tabla con columnas: Producto, Cantidad, Precio Unitario, Subtotal
- Fila por cada item en `sale.items`, incluyendo `variantInfo` si existe
- Total al final
- Abre ventana nueva y ejecuta `print()`

**`SalesTab.tsx`**:
- Importar `useOrganization` para obtener el nombre
- Importar `generateSaleReceipt`
- En `completeSale`, después de éxito, construir el objeto `Sale` completo y llamar `generateSaleReceipt`

**`RecentSalesCard.tsx`**:
- Agregar botón con icono `Receipt` junto a los botones existentes (Facturar, Eliminar)
- Disponible para todos los usuarios (no requiere permisos especiales)

### Archivos a crear/modificar
- **Crear**: `src/utils/saleReceiptGenerator.ts`
- **Modificar**: `src/components/SalesTab.tsx`
- **Modificar**: `src/components/reports/RecentSalesCard.tsx`

