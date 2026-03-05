

## Plan: Simplificar resumen de cuenta corriente

### Cambios en `src/components/reports/AccountStatementPrint.tsx`

En la sección "Resumen" (líneas 322-377), eliminar:
- Total ventas
- Total pagos
- Ajustes
- Límite de crédito
- Crédito disponible

Dejar solo:
1. **Saldo anterior** — texto normal
2. **Saldo actual** — en negrita y con fuente más grande (text-2xl / font-size: 24px)

También actualizar los estilos CSS del `handlePrint` para que `.summary-row.total` tenga `font-size: 24px` y `font-weight: bold`.

### Archivo a modificar
- `src/components/reports/AccountStatementPrint.tsx` (líneas 322-377)

