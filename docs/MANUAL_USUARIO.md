# Manual de Usuario — Gestión Comercial

Guía básica de uso del sistema. Cada sección describe una pestaña, qué hace y cómo usarla.

---

## 1. Primeros Pasos

### Inicio de Sesión

1. Abrí la URL de tu tienda (ej: `netlify.app/tienda/abcd`)
2. Ingresá tu email y contraseña
3. Presioná **Iniciar Sesión**

> **Nota:** Solo se permite iniciar sesión. Las cuentas de usuario las gestiona el administrador de la plataforma.

### Selección de Tienda

Si tenés acceso a más de una tienda, al ingresar elegí la tienda que querés administrar.

---

## 2. Inicio (Dashboard)

La pestaña **Inicio** muestra un resumen rápido de tu negocio.

### Qué verás

- **Alertas de Stock Bajo:** productos que necesitan reposición
- **Resumen de actividad:** datos generales de la tienda

### Tips

- Revisá las alertas de stock bajo al inicio de cada jornada
- Si no hay alertas, todo está en orden

---

## 3. Productos

Gestión completa del inventario de tu tienda.

### Alta de Producto

1. Presioná **+ Agregar Producto**
2. Completá los campos:
   - **Nombre** (obligatorio)
   - **Categoría** (elegí de las disponibles)
   - **Stock actual** (cantidad en inventario)
   - **Stock mínimo** (para alertas de reposición)
   - **SKU** (código único del producto, opcional)
   - **Precio de costo** (cuánto te cuesta)
   - **Precio de venta** (a cuánto lo vendés)
   - **Con variantes** (activar si el producto tiene talles, colores, etc.)
   - **Descripción** (opcional)
3. Presioná **Guardar**

> **Importante:** El precio de costo debe ser menor al de venta. El sistema calcula el margen de ganancia automáticamente.

### Editar Producto

1. Hacé clic en el **ícono de lápiz** junto al producto
2. Modificá los campos que necesites
3. Si cambiás precios, se registra automáticamente en el historial

### Historial de Precios

1. En el diálogo de edición, presioná **Historial**
2. Verás todos los cambios de precio con fecha y tendencia (suba ↗️ o baja ↘️)

### Categorías

1. Presioná el botón **Categorías** en la parte superior
2. Creá, editá o eliminá categorías para organizar tus productos

### Variantes

Si activaste "Con variantes" al crear un producto:

1. Hacé clic en el **ícono de paquete** junto al producto
2. Agregá variantes (ej: color "Rojo", talle "M", ajuste de precio +$500)
3. Cada variante tiene su propio stock y SKU

> **Nota:** Las variantes se gestionan por producto. El stock se controla por variante, no a nivel producto.

---

## 4. Ventas

Registro de ventas de tu tienda.

### Registrar una Venta

1. Presioná **+ Nueva Venta**
2. Seleccioná los productos (podés buscar por nombre)
3. Indicá la cantidad de cada uno
4. Elegí el cliente (opcional para ventas al contado)
5. El sistema calcula el total automáticamente
6. Presioná **Confirmar Venta**

### Tipos de Venta

- **Contado:** pago inmediato
- **Crédito:** el cliente paga después (se registra en Cuenta Corriente)
- **Facturación electrónica:** si tenés el módulo habilitado, podés generar factura

### Comprobante

Al concretar una venta, podés imprimir un comprobante para el cliente.

### Datos Importantes

- Al registrar una venta, el stock se descuenta automáticamente
- Si el producto tiene variantes, elegí la variante específica
- Las ventas se pueden eliminar solo desde la pestaña de Reportes (solo admin)

---

## 5. Clientes

Gestión de la base de datos de clientes.

### Alta de Cliente

1. Presioná **+ Agregar Cliente**
2. Completá: nombre, email, teléfono, dirección (opcional)
3. Presioná **Guardar**

### Editar Cliente

1. Hacé clic en el **ícono de lápiz** junto al cliente
2. Modificá los datos
3. Guardá los cambios

### Buscar Cliente

Usá el campo de búsqueda para filtrar por nombre o email.

---

## 6. Cuenta Corriente

Gestión de deudas y pagos de clientes. **Solo visible para administradores.**

### Registrar una Transacción

1. Presioná **+ Nueva Transacción**
2. Seleccioná el cliente
3. Elegí el tipo:
   - **Pago:** el cliente abona una deuda
   - **Venta a Crédito:** registrás una venta que el cliente pagará después
   - **Ajuste:** corrección manual del saldo
4. Ingresá el monto y notas (opcional)
5. Confirmá

### Ver Estado de Cuenta

1. En la tabla de clientes, hacé clic en el **ícono de ojo** junto al cliente
2. Verás el historial de movimientos con filtro de fechas
3. Podés generar un **Reporte PDF** para enviar al cliente

### Link Público para el Cliente

Cada cliente tiene un link único para ver su estado de cuenta sin necesidad de login:

1. Copiá el link (ícono de copiar en la tabla)
2. Compartilo con el cliente
3. El cliente puede filtrar por fecha e imprimir su estado

> **URL formato:** `netlify.app/tienda/abcd/cuenta/xxxxx`

---

## 7. Reportes

Análisis e impresión de datos de tu negocio.

### Tipos de Reporte

#### Reporte de Stock
- Inventario completo con valores de costo y venta
- Botón **Imprimir** para generar versión física

#### Reporte de Ventas
- Seleccioná el período (1, 7, 30 o 90 días)
- Verás:
  - **Ventas Totales** (monto)
  - **Ganancia Total** (solo admin)
  - **Transacciones** (cantidad de ventas)
  - **Venta Promedio** (promedio por transacción)

### Secciones del Reporte

| Sección | Qué muestra |
|---------|-------------|
| **Top Productos** | Los 5 más vendidos |
| **Más Rentables** | Los 5 con mayor ganancia (solo admin) |
| **Inventario** | Valor total del stock |
| **Alertas** | Stock bajo y márgenes menores al 20% |
| **Últimas Ventas** | Detalle de las 10 ventas más recientes |
| **Detalle por Item** | Desglose completo con filtro de fechas |

### Imprimir

1. Seleccioná el período
2. Hacé clic en **Imprimir Reporte de Stock** o **Imprimir Reporte de Ventas**
3. Se abrirá la vista de impresión del navegador

---

## 8. Tips y Cosas a Tener en Cuenta

### Reglas del Sistema

| Regla | Detalle |
|-------|---------|
| **Costo < Venta** | El precio de costo siempre debe ser menor al de venta |
| **Stock automático** | Al registrar una venta, el stock se descuenta solo |
| **Historial de precios** | Todo cambio de precio queda registrado automáticamente |
| **Variantes** | Requieren que la feature esté habilitada para la tienda |
| **Cta. Cte.** | Solo los administradores pueden acceder |

### Buenas Prácticas

1. **Revisá las alertas** de stock bajo al inicio de cada día
2. **Actualizá precios** cuando cambien los costos de proveedor
3. **Usá categorías** para mantener el inventario organizado
4. **Registrá todas las ventas** (incluidas las de crédito) para tener datos precisos
5. **Imprimí reportes** periódicamente para analizar el rendimiento

### Errores Comunes

- **"No hay productos"** → Verificá que estés en la tienda correcta
- **No puedo agregar venta** → Checkeá que haya stock disponible
- **Cta. Cte. no aparece** → Solo los administradores la ven
- **Link de cliente no funciona** → Verificá que la URL esté completa y correcta

---

## Atajos de Teclado

| Acción | Atajo |
|--------|-------|
| Buscar producto | Campo de búsqueda en Productos |
| Imprimir reporte | Botón imprimir en Reportes |
| Copiar link cliente | Ícono de copiar en Cta. Cte. |

---

*Manual version 1.0 — Para soporte contactar al administrador de la plataforma.*
