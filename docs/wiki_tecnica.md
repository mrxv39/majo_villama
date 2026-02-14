# Wiki técnica — majo_villama

## Objetivo del proyecto
Web sencilla y “chula” para el proyecto de Feldenkrais de Majo Villafaina, con:
- Páginas públicas (presentación, servicios, bio, agenda/talleres, contacto).
- Formulario de contacto que guarda mensajes en SQLite.
- Despliegue en Fly.io (y ejecución local fácil).

## Stack
- Python + Flask
- SQLite (mensajes de contacto)
- Fly.io (deploy)

## Estructura recomendada del repo
(ajusta nombres si tu scaffold difiere)
- pp.py / wsgi.py: entrada de la app
- 	emplates/: HTML (Jinja)
- static/: CSS/JS/imagenes
- db/ o data/: SQLite y helpers
- docs/: documentación (esta carpeta)

## Variables de entorno
- SECRET_KEY: sesión/seguridad básica de Flask
- (opcional) APP_PIN: si proteges zonas privadas (solo si lo implementas)

En Windows PowerShell:
- $env:SECRET_KEY="..."

## Ejecutar en local (Windows)
1) Crear/activar venv:
- python -m venv .venv
- .\.venv\Scripts\Activate.ps1

2) Instalar dependencias:
- pip install -r requirements.txt

3) Run:
- python app.py
o si usas flask:
- $env:FLASK_APP="app.py"
- lask run

## Base de datos (SQLite)
Objetivo mínimo: tabla contact_messages (o similar) con:
- id (PK)
- 
ame, mail, message
- created_at (timestamp)

Buenas prácticas:
- No commitear la DB de producción.
- Mantener migración/creación en un script o función idempotente.

## Deploy Fly.io (resumen)
(ajusta a tu setup)
- lyctl launch (si no existe app)
- lyctl secrets set SECRET_KEY="..."
- lyctl deploy

## Convenciones de commits
- docs: cambios de documentación
- eat: nueva funcionalidad
- ix: correcciones

## Próximo paso técnico recomendado
- Confirmar rutas/páginas públicas finales (Home, Bio, Feldenkrais, Talleres, Contacto).
- Dejar el formulario de contacto robusto (validación + anti-spam básico).
- Mejorar estilo (CSS simple + responsive) antes de meter extras.
