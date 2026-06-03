## Estado de cuenta público por link único

Permitir que un cliente acceda a su estado de cuenta sin iniciar sesión, mediante un link único que el comercio le comparte. Reutiliza el reporte existente (`AccountStatementPrint`) con filtro por rango de fechas y saldo anterior.

### Flujo

1. El admin/super admin abre la ficha de un cliente en **Cuenta Corriente** y obtiene un botón **"Copiar link público"** que genera/copia una URL del tipo:

   ```
   /tienda/{slug}/cuenta/{token}
   ```

2. El cliente abre la URL y ve:
   - Encabezado con nombre de la organización + nombre del cliente.
   - Selector de **Fecha Desde / Hasta** (Hasta por defecto = hoy, mismo patrón que en `CurrentAccountTab`).
   - Botón **Ver estado de cuenta** y **Imprimir/PDF** (reusa la estrategia de impresión por HTML estático ya establecida).
   - Listado de movimientos con **Saldo anterior** como primer ítem (mismo cálculo ya implementado en `AccountStatementPrint`).
   - Saldo actual destacado.

3. Si el token no existe o el cliente fue desvinculado, mostrar mensaje "Link inválido o expirado".

### Cambios técnicos

**Base de datos**
- Agregar columna `public_token uuid unique` a `customer_accounts` (default `gen_random_uuid()`), nullable para registros existentes; backfill con `gen_random_uuid()`.
- Función `SECURITY DEFINER public.get_public_account_statement(_slug text, _token uuid)` que devuelve:
  - Datos del cliente (nombre) y organización (nombre).
  - Lista completa de `account_transactions` de esa cuenta (el filtrado por fechas y el cálculo de saldo anterior se hace en el cliente, igual que el flujo interno).
  - Devuelve vacío/null si no hay match `(organization.slug, customer_accounts.public_token)`.
- `GRANT EXECUTE ... TO anon, authenticated` sobre esa función.
- **No** habilitar RLS pública en `customer_accounts` ni en `account_transactions`; todo el acceso anónimo pasa por la función `SECURITY DEFINER` para acotar a los campos necesarios.

**Frontend**
- Nueva ruta pública en `src/App.tsx`: `/tienda/:slug/cuenta/:token` → nuevo componente `src/pages/PublicAccountStatement.tsx`.
- `PublicAccountStatement.tsx`:
  - Llama a `supabase.rpc('get_public_account_statement', { _slug, _token })` con el cliente anónimo.
  - Reutiliza `DateRangeSelector` y la lógica de "Saldo anterior" extrayéndola a un helper compartido (de `AccountStatementPrint` / `CurrentAccountTab`) para evitar duplicación.
  - Reutiliza `AccountStatementPrint` para la vista impresa.
- En `src/components/CurrentAccountTab.tsx`: junto a cada cuenta, botón **"Copiar link público"** que arma `${window.location.origin}/tienda/{slug}/cuenta/{public_token}` y lo copia al portapapeles (sólo visible para admin/super admin, consistente con RBAC actual).

### Notas

- Privacidad: el token UUID es la única protección. Quien tenga el link ve el estado de cuenta completo del cliente. El usuario confirmó que esto es aceptable por ahora.
- Si en el futuro se quiere reforzar: agregar verificación adicional (último 4 del DNI, fecha de expiración del token, regeneración manual del token).
- No se tocan reglas de RLS existentes ni el flujo interno de Cuenta Corriente.
