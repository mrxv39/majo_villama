# Prompt para Claude Code — Admin Backend Majo Villama

Copia y pega esto en Claude Code desde la carpeta del repo `majo_villama`:

---

## CONTEXTO

Tengo un monorepo `majo_villama` con una carpeta `admin/` que es un Next.js 15 + App Router desplegado en Vercel (https://majo-admin.vercel.app). Ya tiene autenticación con Google OAuth (NextAuth v5). Las secciones del admin (Alumnas, Inscripciones, Pagos, Contenido) son placeholder con "Próximamente". Necesito que las hagas funcionales conectándolas a Supabase.

## LO QUE NECESITO QUE HAGAS

### 1. Instalar dependencias

```bash
cd admin
npm install @supabase/supabase-js
```

### 2. Crear el archivo `admin/lib/supabase.ts`

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 3. Crear el archivo `admin/lib/types.ts`

```typescript
export interface Alumna {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string | null;
  fecha_alta: string;
  notas: string;
  activa: boolean;
  created_at: string;
}

export interface Pago {
  id: string;
  alumna_id: string;
  monto: number;
  fecha_pago: string;
  metodo_pago: string;
  concepto: string;
  estado: "pagado" | "pendiente" | "cancelado";
  created_at: string;
  alumna?: Alumna;
}

export interface Inscripcion {
  id: string;
  alumna_id: string;
  clase: string;
  dia_semana: string;
  horario: string;
  fecha_inscripcion: string;
  estado: "activa" | "pausada" | "cancelada";
  created_at: string;
  alumna?: Alumna;
}
```

### 4. Crear las tablas en Supabase

Ve al SQL Editor de Supabase (o usa la CLI) y ejecuta:

```sql
-- Tabla de alumnas
CREATE TABLE IF NOT EXISTS alumnas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  fecha_nacimiento DATE,
  fecha_alta DATE DEFAULT CURRENT_DATE,
  notas TEXT DEFAULT '',
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS pagos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alumna_id UUID REFERENCES alumnas(id) ON DELETE CASCADE,
  monto DECIMAL(10,2) NOT NULL,
  fecha_pago DATE DEFAULT CURRENT_DATE,
  metodo_pago TEXT DEFAULT 'efectivo',
  concepto TEXT DEFAULT '',
  estado TEXT DEFAULT 'pagado' CHECK (estado IN ('pagado', 'pendiente', 'cancelado')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de inscripciones
CREATE TABLE IF NOT EXISTS inscripciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alumna_id UUID REFERENCES alumnas(id) ON DELETE CASCADE,
  clase TEXT NOT NULL,
  dia_semana TEXT NOT NULL,
  horario TEXT NOT NULL,
  fecha_inscripcion DATE DEFAULT CURRENT_DATE,
  estado TEXT DEFAULT 'activa' CHECK (estado IN ('activa', 'pausada', 'cancelada')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deshabilitar RLS para simplificar (la app ya tiene auth con NextAuth)
ALTER TABLE alumnas DISABLE ROW LEVEL SECURITY;
ALTER TABLE pagos DISABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones DISABLE ROW LEVEL SECURITY;

-- Datos de ejemplo
INSERT INTO alumnas (nombre, apellido, email, telefono, notas, activa) VALUES
  ('María', 'García López', 'maria.garcia@email.com', '+34 612 345 678', 'Clase de los martes', true),
  ('Ana', 'Martínez Ruiz', 'ana.martinez@email.com', '+34 623 456 789', 'Tiene problemas de espalda', true),
  ('Laura', 'Fernández Díaz', 'laura.fdez@email.com', '+34 634 567 890', '', true),
  ('Carmen', 'López Sánchez', NULL, '+34 645 678 901', 'Clase grupal miércoles', true),
  ('Isabel', 'Rodríguez Pérez', 'isabel.rp@email.com', '+34 656 789 012', 'Sesión individual', false);
```

### 5. Reemplazar `admin/app/admin/alumnas/page.tsx` con CRUD funcional

Crea una página completa con:
- Tabla de alumnas que lee de Supabase
- Botón "Nueva Alumna" que abre un formulario modal
- Editar alumna inline o en modal
- Eliminar alumna con confirmación
- Filtro por nombre y estado (activa/inactiva)
- Los estilos deben usar las CSS variables existentes: `--color-accent: #8B7355`, `--color-bg: #FAF8F5`, `--color-bg-warm: #E8DFD3`
- Fuente serif para títulos (font-family: Georgia, serif)
- El componente debe ser "use client"

### 6. Reemplazar `admin/app/admin/pagos/page.tsx` con CRUD funcional

- Tabla de pagos con nombre de alumna (JOIN)
- Botón "Registrar Pago" con formulario modal
- Select para elegir alumna
- Campos: monto, fecha, método de pago (efectivo/transferencia/bizum), concepto, estado
- Filtros por estado y alumna
- Mismos estilos que alumnas

### 7. Reemplazar `admin/app/admin/inscripciones/page.tsx` con CRUD funcional

- Tabla de inscripciones con nombre de alumna
- Botón "Nueva Inscripción" con formulario modal
- Select para elegir alumna
- Campos: clase (ej: "Feldenkrais Grupal", "Sesión Individual"), día de la semana, horario, estado
- Mismos estilos

### 8. Actualizar `admin/app/admin/page.tsx` (Dashboard)

Reemplazar los stats hardcodeados por consultas reales a Supabase:
- Inscripciones Nuevas → COUNT de inscripciones del último mes
- Alumnas Activas → COUNT de alumnas con activa=true
- Pagos Pendientes → COUNT de pagos con estado='pendiente'
- Clases Este Mes → COUNT DISTINCT de inscripciones activas

La actividad reciente debe mostrar los últimos 5 registros reales (pagos e inscripciones más recientes).

### 9. Dejar `admin/app/admin/contenido/page.tsx` como está (placeholder por ahora)

### 10. Agregar las variables de entorno en Vercel

En el dashboard de Vercel del proyecto `majo-admin`, añade:
- `NEXT_PUBLIC_SUPABASE_URL` = (tu URL de Supabase)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (tu anon key de Supabase)

### 11. Hacer commit y push

```bash
git add -A
git commit -m "feat: connect admin panel to Supabase with full CRUD for alumnas, pagos, inscripciones"
git push origin main
```

## ESTRUCTURA DE ARCHIVOS EXISTENTE

```
admin/
├── app/
│   ├── admin/
│   │   ├── layout.tsx          # Layout con sidebar (NO TOCAR)
│   │   ├── page.tsx            # Dashboard (ACTUALIZAR con stats reales)
│   │   ├── alumnas/page.tsx    # REEMPLAZAR con CRUD
│   │   ├── inscripciones/page.tsx  # REEMPLAZAR con CRUD
│   │   ├── pagos/page.tsx      # REEMPLAZAR con CRUD
│   │   └── contenido/page.tsx  # DEJAR COMO ESTÁ
│   ├── api/auth/[...nextauth]/ # Auth routes (NO TOCAR)
│   ├── login/page.tsx          # Login page (NO TOCAR)
│   ├── globals.css             # Estilos globales (NO TOCAR)
│   ├── layout.tsx              # Root layout (NO TOCAR)
│   ├── page.tsx                # Home/landing (NO TOCAR)
│   └── providers.tsx           # SessionProvider (NO TOCAR)
├── lib/
│   ├── auth.ts                 # NextAuth config (NO TOCAR)
│   ├── supabase.ts             # CREAR - cliente Supabase
│   └── types.ts                # CREAR - tipos TypeScript
├── middleware.ts                # Auth middleware (NO TOCAR)
└── package.json                # ACTUALIZAR - añadir @supabase/supabase-js
```

## NOTAS IMPORTANTES

- La app usa Tailwind CSS v4 (importado como `@import "tailwindcss"` en globals.css)
- Los colores custom están como CSS variables, no en tailwind.config
- La app usa clases como `bg-accent`, `text-accent`, `bg-bg`, `bg-bg-warm` definidas en CSS
- NextAuth v5 beta (`next-auth@5.0.0-beta.20`)
- El proyecto está en un monorepo, la carpeta admin/ es el root del proyecto Next.js
- Vercel auto-deploya al pushear a main
- NO crear API routes separadas, usar Supabase client directamente desde los componentes client
