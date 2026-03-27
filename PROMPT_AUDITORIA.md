# Auditoría completa del proyecto majo_villama

Haz una auditoría técnica exhaustiva del proyecto en este repositorio. Revisa TODO: código, configuración, seguridad, dependencias, estructura y rendimiento. No cambies nada, solo genera un informe detallado.

## Qué revisar

### 1. Estructura del proyecto
- ¿La estructura de carpetas tiene sentido para un monorepo (Flask + Next.js)?
- ¿Hay archivos innecesarios, duplicados o huérfanos?
- ¿El .gitignore cubre todo lo que debería (.env, node_modules, __pycache__, .next, etc.)?

### 2. Seguridad (CRÍTICO)
- ¿Hay secretos, API keys, tokens o contraseñas hardcodeados en el código?
- ¿Los archivos .env están en .gitignore?
- ¿Hay algún .env o credencial commiteado en el historial de git? (revisa con `git log --all --full-history -- "*.env*"`)
- ¿Las variables de entorno sensibles se usan correctamente (server-side vs NEXT_PUBLIC_)?
- ¿La configuración de NextAuth es segura? ¿Tiene AUTH_SECRET configurado?
- ¿El middleware protege bien las rutas /admin/*?
- ¿Las dependencias tienen vulnerabilidades conocidas? (ejecuta `npm audit` en admin/)

### 3. Dependencias
- ¿Hay dependencias desactualizadas? (ejecuta `npm outdated` en admin/)
- ¿Hay dependencias que no se usan?
- ¿Las versiones son compatibles entre sí (React 19 + NextAuth v5 beta + Next 15)?
- ¿Hay conflictos de versiones en package-lock.json?

### 4. Código TypeScript/Next.js (carpeta admin/)
- ¿Hay errores de TypeScript? (ejecuta `npx tsc --noEmit`)
- ¿El build pasa sin errores? (ejecuta `npm run build`)
- ¿Hay problemas de linting? (ejecuta `npm run lint`)
- ¿Los componentes usan "use client" solo cuando es necesario?
- ¿Hay memory leaks potenciales (useEffect sin cleanup)?
- ¿Se manejan los estados de loading y error correctamente?
- ¿Los imports son correctos y no hay imports circulares?

### 5. Código Python/Flask (raíz)
- ¿El app.py y wsgi.py están bien configurados?
- ¿Las dependencias de requirements.txt están actualizadas?
- ¿Hay vulnerabilidades de seguridad en el código Flask (SQL injection, XSS, etc.)?
- ¿El Dockerfile está optimizado?

### 6. Configuración de deploy
- ¿El fly.toml está bien configurado?
- ¿La configuración de Vercel es correcta para el monorepo?
- ¿Hay configuración redundante o conflictiva?

### 7. Rendimiento
- ¿Se usan Server Components donde se debería?
- ¿Hay componentes que deberían tener lazy loading?
- ¿Las imágenes están optimizadas (next/image)?
- ¿Hay re-renders innecesarios?

### 8. Accesibilidad y UX
- ¿Los botones y links tienen atributos aria correctos?
- ¿El diseño es responsive?
- ¿Los formularios tienen validación?
- ¿Hay manejo de estados vacíos y errores en la UI?

### 9. Git e historial
- ¿Los commits siguen alguna convención?
- ¿Hay branches huérfanos?
- ¿El repo tiene README actualizado?

## Formato del informe

Genera el informe así:

```
## 🔴 CRÍTICO (arreglar ya)
- [descripción del problema] → [archivo:línea] → [cómo arreglarlo]

## 🟡 IMPORTANTE (arreglar pronto)
- [descripción] → [archivo] → [solución]

## 🟢 MEJORAS (nice to have)
- [descripción] → [sugerencia]

## ✅ LO QUE ESTÁ BIEN
- [lo que está bien hecho]

## 📊 RESUMEN
- Salud general: X/10
- Seguridad: X/10
- Calidad de código: X/10
- Mantenibilidad: X/10
```

NO hagas cambios en ningún archivo. Solo reporta.
