# SmartBlind Stick

Proyecto del bastón inteligente: servidor Spring Boot, panel con mapa GPS y puente USB desde Arduino.

El servidor y la página se encuentran en `backend/smart-blind-stick`.
El panel conserva distancia, detección de obstáculos, coordenadas e historial con fecha de recepción.

## Publicar la rama develop en Render

Conecta este repositorio, selecciona la rama `develop` y configura:

- Runtime: Docker.
- Root Directory: `backend/smart-blind-stick`.
- Dockerfile Path: `./Dockerfile`.
- Health Check Path: `/health`.

El `render.yaml` de la raíz contiene esa configuración para un Blueprint.
Configura una base PostgreSQL y las variables privadas antes de desplegar:
`SPRING_PROFILES_ACTIVE=prod`, `DASHBOARD_PASSWORD`, `DEVICE_PASSWORD`,
`DATABASE_URL` (formato JDBC), `DATABASE_USERNAME` y `DATABASE_PASSWORD`.

Usuario del panel: `cuidador`. Usuario del puente: `baston`.
Las contraseñas deben ser diferentes y tener al menos 16 caracteres. No se incluyen claves reales en este repositorio.

Consulta [la guía de publicación](backend/smart-blind-stick/GUIA-PUBLICAR.md) y
[las instrucciones de ejecución y GPS](backend/smart-blind-stick/LEEME-PRIMERO.md).

El plan gratuito de Render es para pruebas y puede suspenderse; su base gratuita tiene vencimiento.
La web alojada puede consultarse con la computadora apagada, pero el Arduino USB necesita que
el puente Python continúe activo para enviar lecturas nuevas. No hay conexión directa del bastón a Internet todavía.
