# Publicar el servidor Java en Render

Todavía no se ha creado cuenta, servicio, base ni URL pública. La configuración se entrega preparada.
Documentación consultada el 18 de noviembre de 2026. Revisa los planes y sus condiciones al contratar.

## 1. Usar el repositorio existente

Repositorio: `GenesisNR/SmartBlind-Stick-lot`. Rama de despliegue: `develop`.
El código del servidor y de la página está en `backend/smart-blind-stick`.
Conserva esa estructura; no subas el ZIP ni la carpeta target como código fuente.
Las claves van en las variables privadas del alojamiento.

## 2. Preparar la base PostgreSQL

En Render crea una base PostgreSQL en la misma región que el servicio web.
Anota el hostname interno, puerto, nombre de la base, usuario y contraseña.
La modalidad gratuita puede tener límites o vencimiento: para conservar el historial elige una base persistente apropiada.
La URL JDBC que usará Java tiene este formato:

```text
jdbc:postgresql://HOST_INTERNO:5432/NOMBRE_BASE
```

No pegues directamente una URL `postgres://usuario:clave@...`: no es una URL JDBC.
Las credenciales van por separado en las variables del servidor.
Si usas otro proveedor, aplica los parámetros TLS que indique ese proveedor (por ejemplo `?sslmode=require`).

## 3. Crear el servicio web

En Render selecciona New > Web Service y conecta GenesisNR/SmartBlind-Stick-lot.
Branch: `develop`. Root Directory: `backend/smart-blind-stick`. Lenguaje/runtime: Docker.
Dockerfile Path: `./Dockerfile`. El Dockerfile compila, ejecuta las pruebas y arranca el JAR automáticamente.
Health Check Path: `/health`. No se necesita configurar un Build Command ni un Start Command personalizados.

Añade estas variables de entorno en el panel del proveedor:

| Variable | Valor |
| --- | --- |
| SPRING_PROFILES_ACTIVE | prod |
| DASHBOARD_PASSWORD | Clave privada del cuidador, de al menos 16 caracteres |
| DEVICE_PASSWORD | Otra clave privada, diferente, de al menos 16 caracteres |
| DATABASE_URL | URL JDBC descrita arriba |
| DATABASE_USERNAME | Usuario PostgreSQL |
| DATABASE_PASSWORD | Contraseña PostgreSQL |

El usuario del panel es `cuidador`. El dispositivo usa `baston`.
Render establece PORT; la aplicación lo utiliza automáticamente y escucha en 0.0.0.0.
Las claves se guardan en las variables del proveedor, nunca dentro del código ni del enlace.
El `render.yaml` de la raíz del repositorio permite crear el mismo servicio como Blueprint, pero las variables marcadas `sync: false` se deben completar.
La base se configura por separado; el archivo no crea una base de pago.

Selecciona el plan que quieras. Free sirve para pruebas y se suspende tras 15 minutos sin tráfico;
la primera visita posterior puede tardar mientras arranca. Para evitar suspensión por inactividad, elige un plan de pago
sin esa suspensión. Esto no garantiza disponibilidad absoluta: siguen existiendo reinicios y mantenimiento.

## 4. Desplegar y verificar

Pulsa Create Web Service y espera al estado Live. Render entregará la URL HTTPS real.
Abre esa URL desde el teléfono con datos móviles (sin depender del Wi-Fi de la computadora).
Inicia sesión como `cuidador`. Sin el bastón conectado debe decir «Esperando la primera lectura».
Desde la computadora con USB ejecuta INICIAR-PUENTE.ps1 con `https://TU-URL-REAL/api/sensor`.
Verifica que aparecen distancia y fecha, y que al detener el puente se indica falta de datos recientes.
Reinicia el servicio y comprueba que el historial sigue presente en PostgreSQL.
Nunca configures la base H2 local como almacenamiento de producción sobre el disco efímero del servicio.

## 5. Instalar en el teléfono

Con HTTPS funcionando, sigue los pasos PWA de LEEME-PRIMERO.md.
No hay una app de tienda todavía. Con el puente USB apagado no hay nuevas lecturas,
aunque la página y el historial alojados sigan disponibles.

## Fuentes oficiales

- Docker y Java en Render: https://render.com/docs/docker
- Puerto, URL y variables: https://render.com/docs/web-services
- Límites gratuitos: https://render.com/docs/free
- Bases PostgreSQL: https://render.com/docs/postgresql-creating-connecting
- PWA e instalación: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
