# Smart Blind Stick: versión preparada para alojamiento

Esta versión se integró en el repositorio SmartBlind-Stick-lot, rama develop, conservando el GPS y el puente Arduino.
Antes de integrarla se guardó una copia de los archivos y de los cambios pendientes fuera del repositorio.
La integración de código no implica que el servidor esté publicado: la publicación se verifica por separado en Render.

## Qué resuelve esta versión

- Servidor Java empaquetable: ya no necesita el IDE para ejecutarse.
- Dockerfile y configuración de Render para ejecutar el servidor en Internet.
- Página existente adaptada a pantallas pequeñas, con inicio de sesión.
- Base de aplicación instalable (PWA): manifiesto, iconos y aviso sin conexión.
- Lecturas guardadas en una base de datos, con fecha de recepción del servidor.
- Credenciales distintas para consultar el panel y enviar datos del bastón.
- No indica «sin obstáculo» antes de recibir una lectura ni cuando deja de recibir datos recientes.

## Lo que hará falta para tener un enlace

1. Crear o utilizar una cuenta en https://render.com y conectar el repositorio GenesisNR/SmartBlind-Stick-lot, rama develop.
2. Configurar una base PostgreSQL y sus credenciales.
3. Crear el servicio web siguiendo GUIA-PUBLICAR.md.

El servicio web y la base de datos deben permanecer disponibles para que funcione el panel.
Un plan gratuito puede suspender el servidor y tener límites o vencimiento de la base.
Para uso continuo selecciona un plan sin suspensión automática y una base persistente con copias de seguridad.
No se ha creado ningún recurso de pago.

## Probar en tu computadora sin abrir el editor

Necesitas un JDK 17 o superior y conexión a Internet para la primera compilación.
En PowerShell, dentro de esta carpeta:

```powershell
.\INICIAR-LOCAL.ps1
```

Escribe dos contraseñas diferentes de al menos 16 caracteres. Luego abre http://localhost:8080/.
Usuario del panel: `cuidador`. Contraseña: la primera que elegiste.
Guárdalas en un gestor de contraseñas: el programa no las almacena en archivos.
La base local se guarda en `data/`; no borres esa carpeta si quieres conservar el historial.
Las pruebas automáticas usan una base temporal independiente.
Para ejecutar a mano: `./mvnw.cmd verify` y `java -jar target/smart-blind-stick-0.0.1-SNAPSHOT.jar`,
definiendo antes DASHBOARD_PASSWORD y DEVICE_PASSWORD en el entorno.

## Enviar lecturas reales

El Arduino Nano del proyecto se comunica por USB. En la computadora conectada al Arduino:

```powershell
python -m pip install -r requirements.txt
.\INICIAR-PUENTE.ps1
```

Escribe la URL completa del servidor, terminada en `/api/sensor`, el puerto COM y DEVICE_PASSWORD.
La clave debe coincidir con la del servidor. Cierra el monitor serial del Arduino IDE para liberar el puerto.
El script acepta `DATA,distancia,obstaculo,latitud,longitud` a 9600 baudios y limita los envíos a uno por segundo.
ARDUINO_BAUD permite cambiar los baudios; ARDUINO_PORT cambia el puerto. No registra claves ni coordenadas en consola.
Si no hay red, descarta la lectura y continúa con lecturas nuevas; no ofrece una cola de reenvío sin conexión.

La página alojada podrá abrirse con tu computadora apagada, pero no recibirá nuevos datos de este puente USB.
Para independizar también el bastón habrá que integrar Wi-Fi, una conexión móvil u otra pasarela con Internet.
Un teléfono que consulta la página no sustituye automáticamente esa pasarela.

## Instalar como aplicación

Después de publicar con HTTPS y entrar al panel:

- Android: abre la web en Chrome y busca «Instalar aplicación» o «Añadir a pantalla de inicio» en el menú.
- iPhone/iPad: abre en Safari, pulsa Compartir y «Añadir a pantalla de inicio».
- Computadora: Chrome o Edge pueden mostrar la opción de instalar en la barra o menú.

La opción depende del navegador y del sistema. La instalación necesita verificación en los dispositivos reales.
Esto es una PWA, no un APK ni una publicación en Play Store/App Store.
Necesita Internet para leer sensores. Sin conexión muestra un aviso; no almacena coordenadas en la caché del service worker.
El mapa usa Leaflet y OpenStreetMap: necesita acceso a esos proveedores. Si el mapa no carga, el resto del panel sigue funcionando.

## Alcance del prototipo

Este servidor contempla un solo bastón y un solo usuario cuidador. No implementa cuentas por persona, alertas push,
notificaciones en segundo plano ni seguimiento continuo cuando el teléfono suspende la aplicación.
La fecha es la de recepción por el servidor, no una hora certificada del GPS. El firmware no manda estado de fijación GPS;
por compatibilidad, 0,0 se trata como ubicación desconocida. Un valor GPS que el firmware repita no garantiza una posición nueva.
El panel muestra las últimas 20 lecturas; la API devuelve hasta 100, aunque la base conserva todas. A un envío por segundo el historial crece:
define una política de retención y copias de seguridad antes de un uso prolongado.
El estado «sin datos recientes» usa un umbral de 15 segundos. No debe interpretarse como una alerta de emergencia.

## Comprobar

```powershell
.\mvnw.cmd verify
python -m unittest discover -s tests
```

Consulta VERIFICACION.md para los resultados obtenidos al preparar esta copia.
