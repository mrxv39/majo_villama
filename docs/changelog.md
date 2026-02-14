# Changelog — majo_villama

## 2026-02-14 — init: estructura del proyecto
ANTES:
- Proyecto sin estructura estándar.

AHORA:
- Archivos base y documentación viva inicializados.

IMPACTO:
- Se reduce pérdida de contexto y “bugs fantasma”.

## 2026-02-14 — docs: documentación v1.0 (formalizada)
AHORA:
- Wiki técnica y wiki de usuario alineadas con el scaffold actual (Flask + SQLite + Fly.io).
- Hoja de ruta con entregables claros y ordenados.
- Ideas separadas como backlog (sin mezclar con la hoja de ruta).

IMPACTO:
- Cualquier persona puede arrancar local, desplegar y mantener sin depender de “memoria oral”.

## 2026-02-14 — fix: deploy estable en Fly.io (puerto 8080)

ANTES:
- Error 502 tras deploy.
- Gunicorn no estaba correctamente vinculado al puerto 8080.
- Duplicación/confusión en app.run().

AHORA:
- Procfile limpio: gunicorn bind 0.0.0.0:8080
- app.py sin duplicaciones.
- Deploy coherente con internal_port=8080.

IMPACTO:
- App lista para deploy estable en Fly.io sin 502.


## 2026-02-14 — fix: deploy estable en Fly.io (puerto 8080)

ANTES:
- Error 502 tras deploy.
- Gunicorn no estaba correctamente vinculado al puerto 8080.
- Duplicación/confusión en app.run().

AHORA:
- Procfile limpio: gunicorn bind 0.0.0.0:8080
- app.py sin duplicaciones.
- Deploy coherente con internal_port=8080.

IMPACTO:
- App lista para deploy estable en Fly.io sin 502.
