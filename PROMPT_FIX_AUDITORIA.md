# Fix completo de la auditoría — majo_villama

Arregla TODOS los problemas críticos e importantes encontrados en la auditoría. Hazlo en orden.

## 1. LIMPIAR .env DEL HISTORIAL DE GIT

```bash
# Instalar BFG si no está
# Opción: usar git filter-repo
pip install git-filter-repo
git filter-repo --path-glob '*.env*' --invert-paths --force
```

Si git filter-repo da problemas, usa:
```bash
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env .env.local .env.example' --prune-empty --tag-name-filter cat -- --all
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

Después habrá que hacer `git push --force` (yo lo haré manualmente).

**IMPORTANTE**: Después de esto hay que rotar TODAS las credenciales:
- Google OAuth Client Secret (en Google Cloud Console)
- AUTH_SECRET (generar nuevo con `openssl rand -base64 32`)
- Supabase keys (si aplica)

## 2. ACTUALIZAR DEPENDENCIAS CRÍTICAS

```bash
cd admin
npm install next@latest react@latest react-dom@latest
npm install tailwindcss@latest @tailwindcss/postcss@latest
npm install -D @types/react@latest @types/react-dom@latest typescript@latest
npm audit fix --force
```

## 3. ARREGLAR ERRORES DE TYPESCRIPT

### admin/middleware.ts
El middleware usa la API incorrecta para next-auth v5. Debe ser:

```typescript
export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
```

O si necesita lógica custom:
```typescript
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth();
  if (!session && request.nextUrl.pathname.startsWith("/admin")) {
    const loginUrl = new URL("/login", request.nextUrl.origin);
    loginUrl.searchParams.append("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
```

### admin/app/admin/inscripciones/page.tsx y pagos/page.tsx
Los tipos de `estado` están demasiado estrechos. Asegúrate de que los estados acepten string en los formularios y hagan cast al guardar:
```typescript
const [formEstado, setFormEstado] = useState<string>("activa");
```

### admin/app/admin/page.tsx
Las type assertions de array a objeto están mal. Revisar las consultas de Supabase y usar `.single()` o acceder con `[0]` correctamente.

## 4. HABILITAR RLS EN SUPABASE

Ejecuta este SQL en Supabase (SQL Editor):

```sql
-- Habilitar RLS
ALTER TABLE alumnas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones ENABLE ROW LEVEL SECURITY;

-- Crear políticas que permiten todo al service_role (server-side)
-- y solo lectura al anon key
CREATE POLICY "Allow all for service_role" ON alumnas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service_role" ON pagos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service_role" ON inscripciones FOR ALL USING (true) WITH CHECK (true);
```

Y cambia el cliente Supabase para usar la `service_role` key en operaciones server-side. Crea dos clientes:

**admin/lib/supabase.ts:**
```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente público (solo lectura con RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente server-side (bypasses RLS, NUNCA exponer al browser)
export function createServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
```

Luego migra las operaciones CRUD a API routes server-side en vez de hacer CRUD directo desde componentes "use client".

Crea estas API routes:

**admin/app/api/alumnas/route.ts** — GET (listar) y POST (crear)
**admin/app/api/alumnas/[id]/route.ts** — PUT (editar) y DELETE (eliminar)
**admin/app/api/pagos/route.ts** — GET y POST
**admin/app/api/pagos/[id]/route.ts** — PUT y DELETE
**admin/app/api/inscripciones/route.ts** — GET y POST
**admin/app/api/inscripciones/[id]/route.ts** — PUT y DELETE

Cada API route debe:
- Verificar autenticación con `auth()` de NextAuth
- Usar `createServerSupabase()` para las operaciones
- Retornar NextResponse.json()

Los componentes client deben llamar a estas API routes con fetch() en vez de usar el cliente Supabase directo.

## 5. MOVER EMAILS ADMIN A VARIABLE DE ENTORNO

**admin/lib/auth.ts:**
```typescript
import NextAuth from "next-auth";
import Google from "@auth/core/providers/google";

const ALLOWED_EMAILS = (process.env.ALLOWED_ADMIN_EMAILS || "").split(",").map(e => e.trim());

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      return ALLOWED_EMAILS.includes(user.email ?? "");
    },
    async session({ session }) {
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
```

Y en Vercel añadir: `ALLOWED_ADMIN_EMAILS=majovillama@gmail.com,xavieeee@gmail.com`

## 6. ARREGLAR SessionProvider

Verificar que `admin/app/layout.tsx` usa el Providers wrapper correctamente. Ya debería tener:
```tsx
import Providers from "./providers";
// ...
<Providers>{children}</Providers>
```

Si `admin/app/providers.tsx` existe pero no se importa en layout.tsx, arreglarlo. Verificar que la cadena es: layout.tsx → Providers → SessionProvider → children.

## 7. CONFIGURAR ESLINT

```bash
cd admin
npx next lint --fix
```

Si no hay config, crear `admin/eslint.config.mjs`:
```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintcompat";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

export default [...compat.extends("next/core-web-vitals")];
```

## 8. LIMPIAR ARCHIVOS HUÉRFANOS

```bash
# Eliminar app.py de raíz (duplicado, el real está en app/app.py)
rm -f app.py

# Eliminar templates de raíz (duplicados, los reales están en app/templates/)
rm -rf templates/

# Eliminar carpeta legacy si existe
rm -rf legacy/
```

## 9. ALINEAR PROCFILE Y DOCKERFILE

**Procfile** debe ser:
```
web: gunicorn wsgi:app --bind 0.0.0.0:$PORT --timeout 120
```

(Quitar --timeout 0 que es infinito y peligroso)

## 10. AÑADIR ERROR HANDLING EN CRUD

En cada página que hace operaciones Supabase (alumnas, pagos, inscripciones), envolver las llamadas fetch en try/catch y mostrar feedback:

```typescript
try {
  const res = await fetch("/api/alumnas", { method: "POST", ... });
  if (!res.ok) throw new Error("Error al guardar");
  // refresh data
} catch (error) {
  alert(error instanceof Error ? error.message : "Error inesperado");
}
```

## 11. AÑADIR SECURITY HEADERS

**admin/next.config.ts:**
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
```

## 12. COMMIT Y PUSH

```bash
cd ..
git add -A
git commit -m "fix: resolve all critical audit findings — security, deps, TS errors, RLS, cleanup"
git push origin main
```

## RESUMEN DE VARIABLES DE ENTORNO NECESARIAS EN VERCEL

```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
AUTH_SECRET=... (nuevo, rotado)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=... (NO es NEXT_PUBLIC_)
ALLOWED_ADMIN_EMAILS=majovillama@gmail.com,xavieeee@gmail.com
```
