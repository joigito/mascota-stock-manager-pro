

## Plan: Venta a Crédito con Cuenta Corriente

### Objetivo
Agregar un switch/checkbox "Venta a crédito" en el formulario de venta. Cuando se activa, al completar la venta se registra automáticamente una transacción de tipo `sale` en la cuenta corriente del cliente seleccionado.

### Condiciones
- Solo se habilita si el cliente seleccionado NO es "Consumidor final" (las cuentas corrientes requieren un cliente registrado)
- Solo se habilita si la organización tiene `current_account_enabled = true`
- Al completar la venta a crédito, se llama a `addTransaction(customerId, 'sale', total, 'Venta a crédito', saleId)` del hook `useCurrentAccount`

### Cambios

#### 1. Modificar `src/components/SalesTab.tsx`
- Importar `useCurrentAccount` y `Switch`
- Agregar estado `isCreditSale` (boolean, default false)
- Buscar el `customerId` del cliente seleccionado por nombre en la lista de `customers`
- Mostrar el switch "Venta a crédito" debajo del selector de cliente, visible solo cuando:
  - `isEnabled` (cuenta corriente habilitada en la org)
  - El cliente seleccionado no es "Consumidor final"
- En `completeSale`, después de registrar la venta exitosamente, si `isCreditSale` es true:
  - Obtener el `customerId` del cliente seleccionado
  - Llamar `addTransaction(customerId, 'sale', total, 'Venta a crédito #ref', saleId)`
  - Mostrar toast confirmando que se cargó a la cuenta corriente
- Resetear `isCreditSale` a false tras completar la venta

#### 2. Sin cambios en base de datos
La infraestructura de `customer_accounts` y `account_transactions` ya existe y soporta este flujo.

### Archivos a modificar
- `src/components/SalesTab.tsx`

