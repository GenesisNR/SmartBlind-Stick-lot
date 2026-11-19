"""Run against the packaged JAR, a temporary local database, and temporary credentials."""
import argparse
import html
import os
from pathlib import Path
import re
import secrets
import socket
import subprocess
import tempfile
import time
import requests


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--java', default='java')
    parser.add_argument('--runtime-parent', default=None)
    args = parser.parse_args()
    project = Path(__file__).resolve().parents[1]
    jar = project / 'target/smart-blind-stick-0.0.1-SNAPSHOT.jar'
    assert jar.is_file(), 'Build the JAR with Maven first.'
    runtime = Path(tempfile.mkdtemp(prefix='smartblind-smoke-', dir=args.runtime_parent)).resolve()
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', 0))
        port = sock.getsockname()[1]
    base = f'http://127.0.0.1:{port}'
    viewer_password, device_password = secrets.token_urlsafe(24), secrets.token_urlsafe(24)
    env = dict(os.environ, DASHBOARD_PASSWORD=viewer_password, DEVICE_PASSWORD=device_password,
               SPRING_PROFILES_ACTIVE='', PORT=str(port), SERVER_ADDRESS='127.0.0.1',
               SPRING_DATASOURCE_URL='jdbc:h2:file:' + (runtime / 'readings').as_posix() + ';DB_CLOSE_ON_EXIT=FALSE;WRITE_DELAY=0',
               SPRING_DATASOURCE_USERNAME='sa', SPRING_DATASOURCE_PASSWORD='')
    process = None
    log = (runtime / 'server.log').open('wb')
    passed = []

    def start():
        nonlocal process
        process = subprocess.Popen([args.java, '-jar', str(jar)], cwd=runtime, env=env,
                                   stdout=log, stderr=subprocess.STDOUT,
                                   creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0))
        deadline = time.monotonic() + 50
        while time.monotonic() < deadline:
            if process.poll() is not None:
                print((runtime / 'server.log').read_text(encoding='utf-8', errors='replace')[-6000:])
                raise AssertionError(f'Server stopped; inspect {runtime / "server.log"}')
            try:
                if requests.get(base + '/health', timeout=1).status_code == 200:
                    return
            except requests.RequestException:
                pass
            time.sleep(.3)
        raise AssertionError('Server startup timed out')

    def stop():
        nonlocal process
        if process and process.poll() is None:
            process.terminate()
            try:
                process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait()
        process = None

    def viewer_session():
        session = requests.Session()
        login = session.get(base + '/login', timeout=5)
        match = re.search(r'name="_csrf"[^>]*value="([^"]+)"', login.text)
        assert match, 'Login form must contain a CSRF token'
        response = session.post(base + '/login', data={
            'username': 'cuidador', 'password': viewer_password, '_csrf': html.unescape(match.group(1))
        }, allow_redirects=False, timeout=5)
        assert response.status_code == 302 and not response.headers.get('Location', '').endswith('error'), (response.status_code, response.headers.get('Location'), response.text[:300])
        return session

    try:
        start()
        for path in ('/', '/index.html', '/api/sensor/last', '/api/sensor/history'):
            response = requests.get(base + path, allow_redirects=False, timeout=5)
            assert response.status_code in (302, 401, 403), (path, response.status_code)
        passed.append('Dashboard and GPS endpoints require login')
        for path in ('/health', '/manifest.webmanifest', '/sw.js', '/offline.html', '/icons/icon-192.png', '/icons/icon-512.png'):
            assert requests.get(base + path, timeout=5).status_code == 200, path
        passed.append('Public health check and PWA assets available')
        session = viewer_session()
        assert session.get(base + '/api/sensor/last', timeout=5).status_code == 204
        assert session.get(base + '/api/sensor/history', timeout=5).json() == []
        passed.append('No fabricated initial readings')
        reading = dict(distance=55.43, obstacleDetected=True, latitude=10.474962, longitude=-85.060623)
        assert requests.post(base + '/api/sensor', json=reading, timeout=5).status_code == 401
        assert requests.post(base + '/api/sensor', json=reading, auth=('baston', 'wrong-password'), timeout=5).status_code == 401
        assert requests.post(base + '/api/sensor', json=reading, auth=('cuidador', viewer_password), timeout=5).status_code == 403
        assert session.post(base + '/api/sensor', json=reading, timeout=5).status_code == 401
        passed.append('Writes require device credentials; viewer cannot send readings')
        invalid = dict(reading, latitude=91)
        assert requests.post(base + '/api/sensor', json=invalid, auth=('baston', device_password), timeout=5).status_code == 400
        result = requests.post(base + '/api/sensor', json=reading, auth=('baston', device_password), timeout=5)
        assert result.status_code == 200, result.text
        first = result.json()
        assert first['receivedAt'] and first['id']
        assert session.get(base + '/api/sensor/last', timeout=5).json() == first
        assert session.get(base + '/api/sensor/history', timeout=5).json() == [first]
        assert 'no-store' in session.get(base + '/api/sensor/last', timeout=5).headers.get('Cache-Control', '')
        passed.append('Valid ingestion, validation, server timestamp and no-store responses')
        page = session.get(base + '/', timeout=5)
        assert page.status_code == 200 and '/manifest.webmanifest' in page.text
        passed.append('Authenticated dashboard loads with PWA manifest')
        stop()
        start()
        session = viewer_session()
        assert session.get(base + '/api/sensor/last', timeout=5).json() == first
        assert session.get(base + '/api/sensor/history', timeout=5).json() == [first]
        passed.append('Readings survive server restart on file database')
        for check in passed:
            print('PASS:', check)
        print(f'{len(passed)} integration checks passed. Temporary runtime: {runtime}')
    finally:
        stop()
        log.close()


if __name__ == '__main__':
    main()
