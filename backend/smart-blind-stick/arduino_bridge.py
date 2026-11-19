"""USB-to-HTTPS bridge. Configure via environment; keep passwords out of source code."""
import math
import os
import time
from urllib.parse import urlparse
import requests
import serial

def parse_reading(line):
    parts = line.strip().split(",")
    if len(parts) != 5 or parts[0] != "DATA" or parts[2] not in ("0", "1"):
        raise ValueError("Formato DATA inválido")
    distance, latitude, longitude = float(parts[1]), float(parts[3]), float(parts[4])
    if not all(math.isfinite(v) for v in (distance, latitude, longitude)):
        raise ValueError("Lectura no finita")
    if distance < 0 or abs(latitude) > 90 or abs(longitude) > 180:
        raise ValueError("Lectura fuera de rango")
    return dict(distance=distance, obstacleDetected=parts[2] == "1", latitude=latitude, longitude=longitude)

def main():
    url = os.environ.get("SMARTBLIND_API_URL", "http://localhost:8080/api/sensor")
    parsed = urlparse(url)
    if parsed.username or parsed.password or parsed.query or parsed.fragment:
        raise SystemExit("La URL no debe contener credenciales, parámetros ni fragmentos.")
    if parsed.path != "/api/sensor" or not parsed.hostname:
        raise SystemExit("La URL debe terminar en /api/sensor")
    if parsed.scheme != "https" and not (parsed.scheme == "http" and parsed.hostname in ("localhost", "127.0.0.1", "::1")):
        raise SystemExit("Usa HTTPS para enviar datos fuera de esta computadora.")
    password = os.environ.get("DEVICE_PASSWORD")
    if not password:
        raise SystemExit("Falta DEVICE_PASSWORD. Debe coincidir con la del servidor.")
    port = os.environ.get("ARDUINO_PORT", "COM5")
    baud = int(os.environ.get("ARDUINO_BAUD", "9600"))
    with requests.Session() as session:
        session.auth = ("baston", password)
        try:
            while True:
                try:
                    with serial.Serial(port, baud, timeout=1) as arduino:
                        print("Arduino conectado. Esperando lecturas...")
                        time.sleep(2)
                        arduino.reset_input_buffer()
                        last_sent = 0.0
                        while True:
                            line = arduino.readline().decode("utf-8", errors="ignore").strip()
                            if not line.startswith("DATA,"):
                                continue
                            try:
                                data = parse_reading(line)
                            except ValueError:
                                print("Lectura descartada: formato o rango inválido.")
                                continue
                            # At most one reading per second, to limit requests and storage growth.
                            if time.monotonic() - last_sent < 1:
                                continue
                            last_sent = time.monotonic()
                            try:
                                response = session.post(url, json=data, timeout=(5, 20), allow_redirects=False)
                                if response.status_code in (401, 403):
                                    raise SystemExit("Acceso rechazado: revisa DEVICE_PASSWORD en ambos equipos.")
                                if response.status_code != 200:
                                    print("El servidor rechazó la lectura. HTTP", response.status_code)
                                    time.sleep(5)
                            except requests.RequestException:
                                print("Servidor no disponible; esta lectura no se guardó. Reintentando con lecturas nuevas.")
                                time.sleep(5)
                            finally:
                                # Discard serial backlog accumulated while the HTTP request was waiting.
                                arduino.reset_input_buffer()
                except (serial.SerialException, OSError):
                    print("Arduino no disponible en el puerto configurado. Reintentando en 5 segundos...")
                    time.sleep(5)
        except KeyboardInterrupt:
            print("Puente detenido.")

if __name__ == "__main__":
    main()
