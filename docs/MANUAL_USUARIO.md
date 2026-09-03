# Manual de Usuario — Gestión Comercial

Guía de uso del sistema. Cada sección describe una pestaña, qué hace y cómo usarla.

---

## 1. Inicio (Dashboard)

Para entrar: abrí la URL de tu tienda e ingresá tu email y contraseña (las cuentas las gestiona el administrador de la plataforma). Al entrar, la pestaña **Inicio** muestra un resumen rápido de tu negocio.

### Qué verás

- **Alertas de Stock Bajo:** productos que necesitan reposición
- **Resumen de actividad:** datos generales de la tienda

### Tips

- Revisá las alertas de stock bajo al inicio de cada jornada
- Si no hay alertas, todo está en orden

---

## 2. Productos

Gestión completa del inventario de tu tienda.

### Alta de Producto

1. Presioná **+ Agregar Producto**
2. Completá los campos:
   - **Nombre** (obligatorio)
   - **Categoría** (elegí de las disponibles)
   - **Proveedor** (opcional, elegí de los cargados)
   - **Stock actual** (cantidad en inventario)
   - **Stock mínimo** (para alertas de reposición)
   - **Precio de costo** (cuánto te cuesta)
   - **Precio de venta** (a cuánto lo vendés)
   - **Descripción** (opcional)
3. Presioná **Guardar**

> **Para la mayoría de los productos (stock simple):** no actives el interruptor "Producto con variantes". Cargás una sola cantidad de stock y listo.
>
> El campo **SKU** es opcional y **solo aparece** si activás el modo variantes. En el uso normal, no se necesita.

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

### Proveedores

Los proveedores son quienes te venden la mercadería. Son útiles para saber a quién comprarle cada producto.

1. Presioná el botón **Proveedores** en la parte superior (junto a Categorías)
2. Creá, editá o eliminá proveedores
   - **Nombre** (obligatorio)
   - **Contacto** (opcional: teléfono, persona, etc.)
   - **Descripción** (opcional)
3. Al cargar un producto, podés asignarle su proveedor (campo **Proveedor**)

> **Nota:** Un proveedor solo se puede eliminar si no tiene productos asignados.

### Variantes (avanzado, opcional)

> **Recomendado:** Para el uso actual (forrajería y accesorios), **no uses variantes**.
> Este modo suma complejidad y se reserva para casos donde un mismo producto tiene talles, colores, etc., con stock distinto por variante.

Si algún día activás "Producto con variantes" al crear un producto:

1. Hacé clic en el **ícono de paquete** junto al producto
2. Agregá variantes (ej: color "Rojo", talle "M", ajuste de precio +$500)
3. Cada variante tiene su propio stock y SKU

> **Nota:** Cuando un producto usa variantes, el stock se controla por variante, no a nivel producto.

---

## 3. Ventas

Registro de ventas de tu tienda.

### Dos formas de vender

Podés mezclar las dos formas en la misma venta:

1. **Vender del stock:** elegís un producto cargado y se descuenta del inventario.
2. **Vender sin stock (detalle libre):** escribís directamente lo que se vende — un servicio, algo informal, o cualquier cosa que no tengas en el inventario — con su precio y costo. No toca el stock.

### Vender sin stock (detalle libre)

Ideal para servicios o ventas informales. Por ejemplo: "corte de uñas", "cambio de collar" o un accesorio que no cargaste.

1. En **Nueva Venta**, escribí en el campo "Agregar item libre" el detalle de lo que vendés
2. Poné el **precio de venta** y el **costo** (opcional)
3. Presioná **Agregar** → queda en el detalle de la venta
4. Si además vendés productos del stock en la misma venta, los agregás igual y todo va junto al comprobante

### Registrar una Venta

1. Presioná **+ Nueva Venta**
2. Agregá los items:
   - **Del stock:** buscá el producto por nombre y elegí la cantidad
   - **Libres:** escribí el detalle, precio y costo (ver arriba)
3. Elegí el cliente (opcional para ventas al contado)
4. El sistema calcula el total automáticamente
5. Presioná **Confirmar Venta**

### Tipos de Venta

- **Contado:** pago inmediato
- **Crédito:** el cliente paga después (se registra en Cuenta Corriente)
- **Facturación electrónica:** si tenés el módulo habilitado, podés generar factura

### Comprobante

Al concretar una venta, podés imprimir un comprobante para el cliente.

### Datos Importantes

- Al vender un producto del stock, ese stock se descuenta automáticamente
- Los items libres (sin stock) no afectan el inventario
- Las ventas se pueden eliminar solo desde la pestaña de Reportes (solo admin)

---

## 4. Clientes

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

## 5. Cuenta Corriente

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

## 6. Reportes

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

## 7. Tips y Cosas a Tener en Cuenta

### Reglas del Sistema

| Regla | Detalle |
|-------|---------|
| **Costo < Venta** | El precio de costo siempre debe ser menor al de venta |
| **Stock automático** | Al vender un producto del stock, se descuenta solo; los items libres no afectan stock |
| **Historial de precios** | Todo cambio de precio queda registrado automáticamente |
| **Variantes** | Avanzado; no se usan en el flujo estándar (stock simple) |
| **Proveedores** | Opcionales; ayudan a saber de quién se compra cada producto |
| **Cta. Cte.** | Solo los administradores pueden acceder |

### Buenas Prácticas

1. **Revisá las alertas** de stock bajo al inicio de cada día
2. **Actualizá precios** cuando cambien los costos de proveedor
3. **Usá categorías y proveedores** para mantener el inventario organizado
4. **Registrá todas las ventas** (incluidas las de crédito) para tener datos precisos
5. **Imprimí reportes** periódicamente para analizar el rendimiento

### Errores Comunes

- **"No hay productos"** → Verificá que haya productos cargados en la pestaña Productos
- **No puedo vender del stock** → Checkeá que el producto tenga stock disponible; si no es un producto del stock, usá "Agregar item libre"
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

*Manual version 1.2 — Para soporte contactar al administrador de la plataforma.*
