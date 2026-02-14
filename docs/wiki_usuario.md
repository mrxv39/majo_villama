# Wiki de usuario — majo_villama

## Qué es esta web
Una web simple para presentar el trabajo de Majo (Feldenkrais + movimiento), con información clara y un contacto rápido.

## Secciones previstas (mínimo)
- Inicio: quién es + propuesta + CTA a contacto
- Sobre Majo: bio breve + foto
- Feldenkrais: explicación simple para público general
- Talleres / sesiones: info práctica (dónde, cuándo, cómo reservar)
- Contacto: formulario (nombre, email, mensaje)

## Cómo editar textos
Los textos viven en plantillas dentro de 	emplates/.
Normalmente editarás:
- Títulos y párrafos en HTML
- Enlaces a redes / email
- Imágenes en static/

## Qué pasa cuando alguien usa el formulario de contacto
- La web guarda el mensaje en una base de datos (SQLite).
- Luego se pueden revisar los mensajes desde una página interna (si se implementa) o accediendo a la DB.

## Publicación
Cuando la web se despliega, estará accesible por URL.
Para cambios:
- se hace un commit en Git
- se despliega de nuevo (Fly.io)

## Recomendación de contenido
- 1 foto buena + 1 párrafo potente + 1 botón “Contactar”
- El resto puede crecer después.
