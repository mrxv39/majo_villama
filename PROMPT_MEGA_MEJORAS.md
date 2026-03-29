# PLAN DE MEJORAS COMPLETO — majo_villama admin

Eres un desarrollador senior trabajando en el admin panel de Majo Villafaina (profesora de Feldenkrais). El proyecto está en `admin/` y usa Next.js 16, React 19, TypeScript 6, Tailwind v4, NextAuth v5, y Supabase.

El CRUD básico (alumnas, pagos, inscripciones) ya funciona. Tu trabajo es llevarlo al siguiente nivel con todas las mejoras listadas abajo. Trabaja en orden, haz commits frecuentes, y no rompas lo que ya funciona.

---

## FASE 1: LIMPIEZA Y CALIDAD (30 min)

### 1.1 Eliminar código muerto
- Borra `admin/app/providers.tsx` (está sin usar, el SessionProvider real está en `admin/app/components/SessionProvider.tsx`)
- Verifica que no hay imports rotos después de borrarlo

### 1.2 Extraer componentes reutilizables
Las 3 páginas CRUD (alumnas, pagos, inscripciones) repiten el mismo patrón de UI. Extrae estos componentes a `admin/app/components/`:

- **`Modal.tsx`** — Modal reutilizable con overlay, close on Escape, focus trap, aria-modal, role="dialog"
- **`DataTable.tsx`** — Tabla genérica con headers configurables, filas clickeables, badges de estado con colores
- **`SearchFilter.tsx`** — Barra de búsqueda + filtros por estado (reutilizable entre las 3 secciones)
- **`ConfirmDialog.tsx`** — Diálogo de confirmación para eliminar ("¿Estás segura?")
- **`EmptyState.tsx`** — Estado vacío bonito cuando no hay datos
- **`LoadingSpinner.tsx`** — Indicador de carga consistente
- **`StatusBadge.tsx`** — Badge de estado con colores (activa=verde, pausada=amarillo, cancelada=rojo, etc.)
- **`FormField.tsx`** — Input con label, error, y estilos consistentes

Después refactoriza las 3 páginas CRUD para usar estos componentes. La UI debe verse EXACTAMENTE igual que antes.

### 1.3 Accesibilidad en modales
- Todos los modales deben: trap focus, cerrar con Escape, tener role="dialog" y aria-modal="true"
- Los botones de cerrar deben tener aria-label="Cerrar"
- Los formularios deben tener labels asociados a inputs con htmlFor

**COMMIT:** `refactor: extract reusable UI components and improve accessibility`

---

## FASE 2: FUNCIONALIDADES DE NEGOCIO (1-2 horas)

### 2.1 Historial de pagos por alumna
En la página de detalle/edición de una alumna, mostrar:
- Tabla con todos sus pagos (monto, fecha, estado, concepto)
- Total pagado acumulado
- Pagos pendientes
- Botón "Registrar Pago" que pre-selecciona la alumna

Crea una nueva ruta: `admin/app/admin/alumnas/[id]/page.tsx` que muestre:
- Datos de la alumna (nombre, email, teléfono, notas, fecha de alta)
- Sus inscripciones activas
- Historial de pagos
- Botón de editar y volver

API nueva: `GET /api/admin/alumnas/[id]` que devuelva la alumna + sus pagos + sus inscripciones (con joins).

### 2.2 Clases y horarios dinámicos
Crear tabla nueva en Supabase y gestión completa:

```sql
CREATE TABLE IF NOT EXISTS clases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT DEFAULT '',
  dia_semana TEXT NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  capacidad INTEGER DEFAULT 10,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE clases DISABLE ROW LEVEL SECURITY;

INSERT INTO clases (nombre, dia_semana, hora_inicio, hora_fin, capacidad) VALUES
  ('Feldenkrais Grupal', 'Martes', '10:00', '11:00', 12),
  ('Feldenkrais Grupal', 'Jueves', '10:00', '11:00', 12),
  ('Sesión Individual', 'Lunes', '16:00', '17:00', 1),
  ('Sesión Individual', 'Miércoles', '16:00', '17:00', 1),
  ('Taller Monográfico', 'Sábado', '10:00', '12:00', 15),
  ('Clase Online', 'Viernes', '18:00', '19:00', 20);
```

- Página nueva: `admin/app/admin/clases/page.tsx` con CRUD
- API nuevas: `GET/POST /api/admin/clases`, `PUT/DELETE /api/admin/clases/[id]`
- Añadir "Clases" al sidebar en `admin/app/admin/layout.tsx` (icono: 🗓️, entre Pagos y Contenido)
- Modificar inscripciones para que el dropdown de clases venga de la tabla `clases` en vez de estar hardcodeado
- Mostrar la capacidad vs inscritas en cada clase

### 2.3 Asistencia
Crear tabla y gestión:

```sql
CREATE TABLE IF NOT EXISTS asistencias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alumna_id UUID REFERENCES alumnas(id) ON DELETE CASCADE,
  clase_id UUID REFERENCES clases(id) ON DELETE CASCADE,
  fecha DATE DEFAULT CURRENT_DATE,
  asistio BOOLEAN DEFAULT true,
  notas TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE asistencias DISABLE ROW LEVEL SECURITY;
```

- Página: `admin/app/admin/asistencia/page.tsx`
- Vista principal: Selector de fecha + selector de clase → lista de alumnas inscritas con checkbox de asistencia
- Poder marcar asistencia rápidamente (checkboxes, guardar todas a la vez)
- Vista secundaria: Historial de asistencia filtrable por alumna o clase
- Añadir "Asistencia" al sidebar (icono: ✅)

### 2.4 Mejorar el Dashboard
Añadir al dashboard actual:
- **Gráfico de pagos mensuales** (últimos 6 meses, barras) — usa CSS puro, no librerías externas
- **Asistencia de la semana** — resumen visual de asistencias esta semana
- **Próximas clases hoy** — lista de clases del día actual con número de inscritas
- **Alumnas con pagos vencidos** — lista rápida de deudores

**COMMIT:** `feat: add student detail, dynamic classes, attendance tracking, enhanced dashboard`

---

## FASE 3: CONTENIDO Y CMS (1 hora)

### 3.1 Implementar sección Contenido
Reemplazar el placeholder con un CMS básico. Crear tabla:

```sql
CREATE TABLE IF NOT EXISTS contenido (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('ejercicio', 'video', 'documento', 'enlace')),
  descripcion TEXT DEFAULT '',
  url TEXT DEFAULT '',
  contenido_texto TEXT DEFAULT '',
  visible BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contenido DISABLE ROW LEVEL SECURITY;
```

- Página: `admin/app/admin/contenido/page.tsx` con CRUD
- Tipos de contenido: Ejercicio (texto), Video (URL de YouTube/Vimeo), Documento (URL), Enlace
- Preview de videos embedded
- Drag & drop para reordenar (o flechas arriba/abajo simples)
- Toggle de visibilidad (visible/oculto)
- API: `GET/POST /api/admin/contenido`, `PUT/DELETE /api/admin/contenido/[id]`

**COMMIT:** `feat: implement content management section`

---

## FASE 4: EXPORTACIÓN Y REPORTES (45 min)

### 4.1 Exportar a CSV
Añadir botón "Exportar CSV" en cada sección (alumnas, pagos, inscripciones):
- Genera CSV client-side con los datos filtrados actuales
- Nombre del archivo: `alumnas_YYYY-MM-DD.csv`, `pagos_YYYY-MM-DD.csv`, etc.
- Incluir encabezados en español

Crea un utility en `admin/lib/export.ts`:
```typescript
export function downloadCSV(data: Record<string, any>[], filename: string, headers: Record<string, string>) {
  // headers es un map de key → label en español
  // Genera CSV con BOM para que Excel abra bien los acentos
}
```

### 4.2 Resumen mensual
Nueva ruta: `admin/app/admin/reportes/page.tsx`
- Selector de mes/año
- Resumen: total alumnas activas, inscripciones nuevas/canceladas, total cobrado, total pendiente
- Desglose de pagos por método (efectivo/transferencia/bizum)
- Lista de alumnas con pagos pendientes
- Botón "Exportar resumen" a CSV

Añadir "Reportes" al sidebar (icono: 📊, después de Contenido)

API: `GET /api/admin/reportes?mes=3&anio=2026`

**COMMIT:** `feat: add CSV export and monthly reports`

---

## FASE 5: NOTIFICACIONES Y UX (30 min)

### 5.1 Sistema de notificaciones toast
Crear un sistema de toast notifications en vez de usar alert():
- Componente `Toast.tsx` con animación de entrada/salida
- Tipos: success (verde), error (rojo), warning (amarillo), info (azul)
- Auto-dismiss después de 4 segundos
- Context/Provider para usar desde cualquier componente: `useToast()`

Reemplazar TODOS los alert() en el proyecto por toasts.

### 5.2 Confirmación de eliminación mejorada
Reemplazar los confirm() nativos por el componente `ConfirmDialog.tsx` creado en Fase 1.

### 5.3 Loading states mejorados
- Skeleton loaders en las tablas mientras cargan (en vez de "Cargando...")
- Botones con spinner cuando se está procesando una acción

### 5.4 Breadcrumbs
Añadir breadcrumbs en el header para navegación clara:
- Panel > Alumnas
- Panel > Alumnas > María García
- Panel > Reportes

**COMMIT:** `feat: add toast notifications, improved UX, loading skeletons, breadcrumbs`

---

## FASE 6: TESTS (45 min)

### 6.1 Instalar testing
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
```

Crear `admin/vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
```

### 6.2 Tests unitarios
Crea `admin/tests/` con:

- **`setup.ts`** — Setup de testing-library
- **`lib/export.test.ts`** — Tests para la función downloadCSV
- **`components/Modal.test.tsx`** — Test que el modal se abre, cierra con Escape, trap focus
- **`components/StatusBadge.test.tsx`** — Test que renderiza colores correctos
- **`components/SearchFilter.test.tsx`** — Test que filtra correctamente

### 6.3 Tests de API
- **`api/alumnas.test.ts`** — Mock de Supabase, test GET retorna array, POST crea y retorna
- **`api/auth.test.ts`** — Test que usuarios no autorizados reciben 401

Añadir script en package.json: `"test": "vitest run"`

**COMMIT:** `test: add unit tests for components and API routes`

---

## FASE 7: OPTIMIZACIÓN FINAL (30 min)

### 7.1 Performance
- Añadir `useMemo` para las listas filtradas en alumnas, pagos, inscripciones
- Añadir `useCallback` para los handlers de formulario
- Lazy load las páginas de admin con `dynamic(() => import(...))`

### 7.2 SEO y metadata
- Añadir metadata específica por página con `generateMetadata` de Next.js
- Títulos: "Alumnas | Panel Admin", "Pagos | Panel Admin", etc.

### 7.3 Cleanup final
- Eliminar console.log si hay alguno
- Verificar que no hay imports sin usar
- Ejecutar `npm run build` y verificar 0 warnings
- Ejecutar `npm run lint` y corregir todo
- Ejecutar `npm test` y verificar todo pasa

**COMMIT:** `perf: optimize rendering, add metadata, final cleanup`

---

## NOTAS TÉCNICAS IMPORTANTES

### Estilos
- USA las CSS variables existentes: `--color-accent: #8B7355`, `--color-bg: #FAF8F5`, `--color-bg-warm: #E8DFD3`, `--color-accent-green: #7A8B6F`
- Fuente serif (Georgia) para títulos
- Fuente sans (system-ui) para texto
- Clases Tailwind custom: `bg-accent`, `text-accent`, `bg-bg`, `bg-bg-warm`

### Estructura de API routes
- Todas las API van en `admin/app/api/admin/` (protegidas por middleware)
- Cada route verifica sesión con `auth()` de `@/lib/auth`
- Usa `createServerSupabase()` de `@/lib/supabase` (service_role key, nunca anon)
- Retorna `NextResponse.json()`

### Supabase
- Project ref: `hyydkyhvgcekvtkrnspf`
- URL: `https://hyydkyhvgcekvtkrnspf.supabase.co`
- RLS está habilitado, las API routes usan service_role que bypasea RLS
- Para nuevas tablas: crear con `ALTER TABLE x DISABLE ROW LEVEL SECURITY;` (o habilitar RLS sin políticas, ya que usamos service_role)

### Sidebar navigation (en layout.tsx)
```typescript
const navigationItems = [
  { href: "/admin", label: "Panel", icon: "📊" },
  { href: "/admin/inscripciones", label: "Inscripciones", icon: "📝" },
  { href: "/admin/alumnas", label: "Alumnas", icon: "👥" },
  { href: "/admin/pagos", label: "Pagos", icon: "💳" },
  { href: "/admin/clases", label: "Clases", icon: "🗓️" },          // NUEVO
  { href: "/admin/asistencia", label: "Asistencia", icon: "✅" },    // NUEVO
  { href: "/admin/contenido", label: "Contenido", icon: "📄" },
  { href: "/admin/reportes", label: "Reportes", icon: "📊" },       // NUEVO
];
```

### Commits
Sigue la convención: `tipo(scope): descripción`
- `feat:` nueva funcionalidad
- `fix:` corrección
- `refactor:` reestructuración sin cambio funcional
- `test:` tests
- `perf:` optimización
- `chore:` limpieza

### SQL para tablas nuevas
IMPORTANTE: Después de escribir el SQL para las tablas nuevas (clases, asistencias, contenido), añádelo al archivo `admin/supabase-setup.sql` para documentación. TAMBIÉN imprímelo en la consola para que yo pueda ejecutarlo en Supabase manualmente.

### NO tocar
- `admin/lib/auth.ts` — funciona perfecto
- `admin/app/api/auth/[...nextauth]/route.ts` — no cambiar
- Archivos Flask (`app/`, `wsgi.py`, `Dockerfile`, `fly.toml`, `requirements.txt`) — no son parte de esta mejora
