# Merge, RLS y Deploy final — majo_villama

Ejecuta estos pasos en orden. Algunos son comandos, otros requieren que me digas datos que yo no puedo obtener solo.

## PASO 1: Obtener la service_role key de Supabase

Necesito la service_role key de tu proyecto Supabase. Búscala así:

1. Ve a https://supabase.com/dashboard/project/hyydkyhvgcekvtkrnspf/settings/api
2. Busca "service_role key" (dice "This key has the ability to bypass Row Level Security")
3. Cópiala

Cuando la tengas, dámela y la configuro en Vercel.

Si ya la tienes en tu .env.local, léela de ahí:
```bash
cat admin/.env.local | grep SUPABASE_SERVICE_ROLE_KEY
```

## PASO 2: Ejecutar SQL de RLS en Supabase

Ejecuta esto usando la CLI de Supabase o el SQL Editor del dashboard:

```bash
# Opción A: Con Supabase CLI (si está instalada)
npx supabase db execute --project-ref hyydkyhvgcekvtkrnspf "
ALTER TABLE alumnas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones ENABLE ROW LEVEL SECURITY;

-- Política: permitir todo para peticiones autenticadas con service_role
CREATE POLICY IF NOT EXISTS \"service_role_all\" ON alumnas FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS \"service_role_all\" ON pagos FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS \"service_role_all\" ON inscripciones FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Política: bloquear todo para anon (el browser)
CREATE POLICY IF NOT EXISTS \"anon_deny\" ON alumnas FOR ALL TO anon USING (false);
CREATE POLICY IF NOT EXISTS \"anon_deny\" ON pagos FOR ALL TO anon USING (false);
CREATE POLICY IF NOT EXISTS \"anon_deny\" ON inscripciones FOR ALL TO anon USING (false);
"
```

```bash
# Opción B: Si no tienes la CLI, simplemente copia el SQL y pégalo en:
# https://supabase.com/dashboard/project/hyydkyhvgcekvtkrnspf/sql/new
```

## PASO 3: Merge del branch a main

```bash
git checkout main
git pull origin main
git merge fix/audit-critical-findings
git push origin main
```

## PASO 4: Configurar variables de entorno en Vercel

```bash
# Instalar Vercel CLI si no la tienes
npm i -g vercel

# Loguearte (si no lo estás)
vercel login

# Linkar al proyecto (ejecutar desde admin/)
cd admin
vercel link

# Añadir las variables nuevas
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# (te pedirá el valor — pega la service_role key del paso 1)

vercel env add ALLOWED_ADMIN_EMAILS production
# (pega: majovillama@gmail.com,xavieeee@gmail.com)

# Verificar que todas las env vars están configuradas
vercel env ls
```

Deberías ver estas variables configuradas:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `AUTH_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` ← nueva
- `ALLOWED_ADMIN_EMAILS` ← nueva

## PASO 5: Redeploy en Vercel

Después del push a main, Vercel debería auto-deployar. Si no, fuerza un redeploy:

```bash
vercel --prod
```

## PASO 6: Verificar

1. Abre https://majo-admin.vercel.app
2. Haz login con xavieeee@gmail.com
3. Ve a Alumnas — deberías ver las 5 alumnas de ejemplo
4. Prueba crear, editar y eliminar una alumna
5. Ve a Pagos e Inscripciones — deberían funcionar también
6. El Dashboard debería mostrar las stats reales

Si algo falla, revisa los logs:
```bash
vercel logs majo-admin --follow
```
