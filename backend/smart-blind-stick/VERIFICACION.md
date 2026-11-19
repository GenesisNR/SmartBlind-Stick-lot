# Verificación de esta entrega

Fecha: 18 de noviembre de 2026.

- Maven `verify`: correcto. Compilación para Java 17, ejecutada con el JDK 25.0.2 instalado. Prueba de carga de Spring: 1, sin fallos.
- Pruebas Python del formato de lectura: 2, sin fallos; incluyen rechazo de NaN, infinito y coordenadas fuera de rango.
- Prueba HTTP sobre el JAR real: 7 grupos de comprobaciones correctos:
  1. Panel y rutas GPS requieren iniciar sesión.
  2. Health check, manifiesto, iconos y recursos de instalación accesibles.
  3. Sin lecturas iniciales ficticias: último dato devuelve 204 e historial vacío.
  4. Sin contraseña o con contraseña incorrecta se rechaza el envío; el cuidador tampoco puede escribir datos.
  5. Ingesta válida, rechazo de coordenadas inválidas, fecha asignada por servidor y respuestas sin caché.
  6. Panel autenticado con enlace al manifiesto PWA.
  7. Lectura e historial conservados después de detener y volver a iniciar el servidor con una base H2 de archivos.
- JavaScript del panel y service worker: comprobación de sintaxis correcta con Node.
- Navegador integrado: inicio de sesión y carga del historial vacío verificados; revisión a 390 × 844 y ancho de escritorio. Sin errores de consola observados en la revisión final.

Las pruebas usaron credenciales temporales y lecturas de prueba locales. La captura móvil muestra el estado sin lecturas.
No se conectó ni modificó el Arduino real. El puente USB requiere una prueba con el hardware.
No se ejecutó una imagen Docker: Docker no está instalado en este entorno.
No se creó ni probó una base PostgreSQL real; la configuración de producción queda preparada para comprobar durante el despliegue.
No se verificó la instalación PWA en teléfonos físicos ni se publicó una app en tiendas.
Todavía no hay un servidor público: el usuario indicó que aún no tiene cuenta de alojamiento.

Para repetir la prueba HTTP después de compilar:

```powershell
python tests/integration_smoke.py
```

Opcionalmente usa `--java RUTA_AL_JAVA_EXE` y `--runtime-parent CARPETA_DE_PRUEBAS`.
La prueba crea una base temporal independiente y detiene sus procesos al finalizar.
Conserva la carpeta temporal de diagnóstico; no toca la base local `data/` ni la base de producción.

## Integracion en el repositorio — 19 de noviembre de 2026

Integrado en SmartBlind-Stick-lot, rama develop. Se conservo el GPS y se respaldo el estado anterior fuera del repositorio.
Maven verify: correcto. Prueba HTTP del JAR integrado: 7 comprobaciones correctas, incluido reinicio con H2 en archivos y WRITE_DELAY=0 para evitar perder la ultima escritura ante un cierre abrupto.
Python: 2 pruebas correctas. JavaScript del panel y del service worker: sintaxis correcta. git diff --check: correcto.
La configuracion Render de la raiz usa rootDir backend/smart-blind-stick y branch develop. El despliegue PostgreSQL, la instalacion en telefonos fisicos y el hardware siguen pendientes de verificacion.
