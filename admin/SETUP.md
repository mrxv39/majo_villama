# Setup Instructions - Panel de Administración

## Paso 1: Obtener Credenciales de Google OAuth

1. Ve a https://console.cloud.google.com/
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita Google+ API
4. Ve a "Credenciales" → "Crear Credenciales" → "ID de OAuth 2.0"
5. Selecciona "Aplicación web"
6. Agrega URIs autorizados:
   - Orígenes autorizados: `http://localhost:3000` (desarrollo)
   - URIs de redirección autorizados:
     - `http://localhost:3000/api/auth/callback/google`
     - `http://localhost:3000/api/auth/callback` (producción)
7. Copia el ID de cliente y secreto de cliente

## Paso 2: Configurar Variables de Entorno

1. Copia `.env.example` a `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edita `.env.local` y completa:
   ```
   AUTH_SECRET=<genera con: openssl rand -base64 32>
   GOOGLE_CLIENT_ID=<tu_client_id_de_google>
   GOOGLE_CLIENT_SECRET=<tu_client_secret_de_google>
   NEXTAUTH_URL=http://localhost:3000
   ```

## Paso 3: Instalar Dependencias

```bash
npm install
```

## Paso 4: Ejecutar en Desarrollo

```bash
npm run dev
```

Accede a http://localhost:3000

## Paso 5: Testing de Autenticación

1. Intenta iniciar sesión con majovillama@gmail.com - debe funcionar
2. Intenta con otro email - debe rechazarse

## Despliegue a Producción

### Con Vercel (Recomendado)

1. Sube el proyecto a GitHub
2. Importa en Vercel
3. Configura variables de entorno en Vercel
4. Actualiza GOOGLE_CLIENT_ID con URLs de producción
5. Deploy

### Variables para Producción

```
NEXTAUTH_URL=https://tudominio.com
AUTH_SECRET=<genera nuevo: openssl rand -base64 32>
GOOGLE_CLIENT_ID=<client_id_produccion>
GOOGLE_CLIENT_SECRET=<client_secret_produccion>
```

## Solución de Problemas

### Error: "GOOGLE_CLIENT_ID is not defined"
- Verifica que `.env.local` existe y tiene los valores
- Reinicia el servidor de desarrollo

### Error: "Invalid callback URL"
- Asegúrate que las URIs en Google Cloud Console coinciden con tu NEXTAUTH_URL
- Para desarrollo: debe ser `http://localhost:3000`

### Error: "Email not authorized"
- Solo majovillama@gmail.com puede acceder
- Verifica el email en tu cuenta de Google

## Customización

### Cambiar Email Autorizado
Edita en `/lib/auth.ts`:
```typescript
const ALLOWED_EMAIL = "nuevo@email.com";
```

### Cambiar Colores
Edita `tailwind.config.ts` y `app/globals.css` para ajustar la paleta de colores.

### Agregar Nuevas Secciones del Admin
1. Crea carpeta en `/app/admin/nueva-seccion/`
2. Agrega `page.tsx`
3. Actualiza navegación en `/app/admin/layout.tsx`

## Documentación Útil

- [Next.js 15 Docs](https://nextjs.org/docs)
- [NextAuth.js Docs](https://next-auth.js.org/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
