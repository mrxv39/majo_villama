# Panel de Administración - Majo Villafaina Feldenkrais

Admin dashboard para la práctica de Feldenkrais de Majo Villafaina.

## Características

- Next.js 15 con App Router
- TypeScript
- Autenticación con NextAuth v5 y Google OAuth
- Acceso restringido a majovillama@gmail.com
- Dashboard con navegación lateral
- Diseño responsivo con Tailwind CSS
- Paleta de colores cálida y natural

## Configuración Rápida

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia `.env.example` a `.env.local` y completa los valores:

```bash
cp .env.example .env.local
```

Necesitarás:
- `AUTH_SECRET`: Genera uno con `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`: Obtén de Google Cloud Console
- `NEXTAUTH_URL`: URL de tu aplicación (ej: http://localhost:3000)

### 3. Ejecutar el servidor de desarrollo

```bash
npm run dev
```

Accede a `http://localhost:3000`

## Estructura del Proyecto

```
admin/
├── app/
│   ├── admin/                 # Rutas protegidas del panel
│   │   ├── layout.tsx        # Layout del admin con sidebar
│   │   ├── page.tsx          # Dashboard principal
│   │   ├── inscripciones/    # Sección inscripciones
│   │   ├── alumnas/          # Sección alumnas
│   │   ├── pagos/            # Sección pagos
│   │   └── contenido/        # Sección contenido
│   ├── api/
│   │   └── auth/[...nextauth]/ # Rutas de autenticación
│   ├── login/                 # Página de login
│   ├── components/            # Componentes reutilizables
│   ├── globals.css           # Estilos globales
│   ├── layout.tsx            # Layout raíz
│   └── page.tsx              # Página inicio
├── lib/
│   └── auth.ts               # Configuración NextAuth
├── middleware.ts             # Middleware de protección de rutas
├── tailwind.config.ts        # Configuración Tailwind
├── next.config.ts            # Configuración Next.js
└── tsconfig.json             # Configuración TypeScript
```

## Seguridad

- Solo usuarios con email `majovillama@gmail.com` pueden acceder
- Las rutas `/admin/*` están protegidas por middleware
- SessionProvider envuelve la aplicación para manejo de sesiones

## Colores

- Accent (marrón): `#8B7355`
- Accent Dark: `#6B5740`
- Background: `#FAF8F5`
- Warm: `#E8DFD3`
- Green: `#7A8B6F`

## Scripts

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build para producción
- `npm run start` - Ejecutar servidor de producción
- `npm run lint` - Verificar linting

## Próximos Pasos

1. Configurar credenciales de Google OAuth
2. Personalizar las secciones placeholder (Inscripciones, Alumnas, Pagos, Contenido)
3. Integrar con base de datos
4. Agregar formularios y funcionalidades específicas

## Notas Técnicas

- Tailwind CSS v4 para estilos
- NextAuth v5 para autenticación
- Middleware para protección de rutas
- Componentes Server y Client según necesidad
