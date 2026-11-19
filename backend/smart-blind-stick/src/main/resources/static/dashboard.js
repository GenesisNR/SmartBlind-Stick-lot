'use strict';
const $ = id => document.getElementById(id);
let auto = true, timer = null, interval = 1000, lastReading = null, loading = false;
let map = null, marker = null, selectedPosition = null, historyLoading = false;

function setError(message) { $('errMsg').textContent = message; $('errMsg').hidden = !message; }
function showUnavailable(message) {
  $('obstaclePill').textContent = message;
  $('obstaclePill').className = 'status waiting';
}
function validPosition(lat, lng) {
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && !(lat === 0 && lng === 0);
}
function formatDate(value) {
  const date = new Date(value);
  return value && Number.isFinite(date.getTime()) ? date.toLocaleString('es-CR', {dateStyle:'short', timeStyle:'medium'}) : 'Fecha no disponible';
}
function showPosition(lat, lng, label, zoom = 16) {
  if (!validPosition(lat, lng)) return;
  selectedPosition = [lat, lng];
  if (!window.L) {
    $('mapEmptyTitle').textContent = 'No se pudo cargar el mapa';
    $('mapEmptyText').textContent = `Coordenadas recibidas: ${lat.toFixed(5)}, ${lng.toFixed(5)}. Revisa tu conexión para cargar el mapa.`;
    $('gpsState').textContent = 'Coordenadas recibidas';
    $('mapCaption').textContent = label;
    return;
  }
  $('map').hidden = false;
  $('mapEmpty').hidden = true;
  if (!map) {
    map = L.map('map');
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19, attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
  }
  if (!marker) marker = L.marker([lat,lng]).addTo(map);
  marker.setLatLng([lat,lng]).bindPopup(label);
  map.invalidateSize();
  map.setView([lat,lng],zoom);
  $('gpsState').textContent = 'Ubicación recibida';
  $('mapCaption').textContent = label;
  $('centerButton').disabled = false;
}
function checkFreshness() {
  if (!navigator.onLine) { showUnavailable('Sin conexión a Internet'); return; }
  if (!lastReading) return;
  const age = lastReading.receivedAt ? Date.now() - Date.parse(lastReading.receivedAt) : NaN;
  if (!Number.isFinite(age) || age > 15000) {
    showUnavailable('Lectura desactualizada');
    $('readingHint').textContent = 'La distancia corresponde a una lectura anterior. No hay datos recientes del bastón.';
  }
}
function setUI(data) {
  lastReading = data;
  $('distance').textContent = Number.isFinite(data.distance) ? new Intl.NumberFormat('es-CR',{maximumFractionDigits:1}).format(data.distance) : '—';
  $('obstaclePill').textContent = data.obstacleDetected ? 'Obstáculo detectado' : 'Sin obstáculo en la última lectura';
  $('obstaclePill').className = data.obstacleDetected ? 'status bad' : 'status ok';
  $('readingHint').textContent = data.obstacleDetected ? 'El sensor del bastón detectó un obstáculo.' : 'Estado informado por el sensor del bastón.';
  $('lastUpdate').textContent = formatDate(data.receivedAt);
  if (validPosition(data.latitude,data.longitude)) {
    showPosition(data.latitude,data.longitude,'Última ubicación recibida · ' + formatDate(data.receivedAt));
  } else {
    $('gpsState').textContent = 'Sin GPS en esta lectura';
    $('mapCaption').textContent = selectedPosition ? 'Se conserva una ubicación anterior; la última lectura no tiene GPS válido.' : 'La última lectura no incluye coordenadas GPS válidas.';
  }
  checkFreshness();
}
function requiresLogin(response) {
  if (response.redirected || response.status === 401 || response.status === 403) {
    window.location.assign('/login'); return true;
  }
  return false;
}
async function fetchLast(manual = false) {
  if (loading) return;
  loading = true;
  if (manual) { $('refreshButton').disabled = true; $('refreshButton').textContent = 'Consultando…'; }
  try {
    const response = await fetch('/api/sensor/last',{cache:'no-store',headers:{Accept:'application/json'}});
    if (requiresLogin(response)) return;
    if (response.status === 204) { showUnavailable('Esperando la primera lectura'); setError(''); return; }
    if (!response.ok) throw new Error('HTTP ' + response.status);
    setUI(await response.json());
    setError('');
  } catch (_) {
    showUnavailable(navigator.onLine ? 'Servidor no disponible' : 'Sin conexión a Internet');
    setError('No se pudieron actualizar las lecturas. Comprueba la conexión y vuelve a intentarlo.');
  } finally {
    loading = false;
    if (manual) { $('refreshButton').disabled = false; $('refreshButton').textContent = '↻ Actualizar ahora'; }
  }
}
function emptyHistory(title, description) {
  const row = document.createElement('tr'), cell = document.createElement('td');
  cell.colSpan = 5; cell.className = 'empty-cell';
  const strong = document.createElement('strong'), hint = document.createElement('span');
  strong.textContent = title; hint.textContent = description;
  cell.append(strong,hint); row.append(cell); $('historyBody').replaceChildren(row);
}
async function loadHistory() {
  if (historyLoading) return;
  historyLoading = true;
  $('historyButton').disabled = true; $('historyButton').textContent = 'Cargando…';
  try {
    const response = await fetch('/api/sensor/history',{cache:'no-store',headers:{Accept:'application/json'}});
    if (requiresLogin(response)) return;
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const readings = await response.json();
    if (!Array.isArray(readings)) throw new Error('Invalid history');
    if (!readings.length) { emptyHistory('Todavía no hay lecturas','Cuando el bastón envíe datos, podrás consultarlos aquí.'); return; }
    $('historyBody').replaceChildren();
    readings.slice(-20).reverse().forEach(item => {
      const row = document.createElement('tr');
      const values = [formatDate(item.receivedAt), Number.isFinite(item.distance) ? item.distance + ' cm' : '—', item.obstacleDetected ? 'Detectado' : 'No detectado', validPosition(item.latitude,item.longitude) ? `${item.latitude.toFixed(5)}, ${item.longitude.toFixed(5)}` : 'Sin coordenadas'];
      values.forEach((value,index) => {
        const cell = document.createElement('td');
        if (index === 2) { const badge=document.createElement('span');badge.className='history-status '+(item.obstacleDetected?'bad':'ok');badge.textContent=value;cell.append(badge); }
        else cell.textContent = value;
        row.append(cell);
      });
      const cell = document.createElement('td');
      if (validPosition(item.latitude,item.longitude)) {
        const button = document.createElement('button');button.type='button';button.className='table-button';button.textContent='Ver en mapa';
        button.setAttribute('aria-label','Ver en mapa la lectura del '+formatDate(item.receivedAt));
        button.addEventListener('click',() => {
          auto=false; syncAuto();
          showPosition(item.latitude,item.longitude,'Lectura del historial · '+formatDate(item.receivedAt),17);
          $('gpsState').textContent='Ubicación del historial';
          $('locationTitle').scrollIntoView({block:'start'});
        });cell.append(button);
      } else cell.textContent='—';
      row.append(cell);$('historyBody').append(row);
    });
  } catch (_) {
    emptyHistory('No se pudo cargar el historial','Comprueba la conexión y pulsa «Cargar historial» para volver a intentarlo.');
  } finally { historyLoading=false;$('historyButton').disabled=false;$('historyButton').textContent='Cargar historial ↻'; }
}
function syncAuto() {
  clearInterval(timer);timer=null;
  $('autoButton').setAttribute('aria-pressed',String(auto));
  $('autoState').textContent=auto?'Activada':'Pausada';
  if (auto && !document.hidden) timer=setInterval(fetchLast,interval);
}
$('themeToggle').addEventListener('click',() => { if (map) map.invalidateSize(); });
$('refreshButton').addEventListener('click',() => fetchLast(true));
$('historyButton').addEventListener('click',loadHistory);
$('autoButton').addEventListener('click',() => { auto=!auto;syncAuto();if(auto) fetchLast(); });
$('centerButton').addEventListener('click',() => { if (map && selectedPosition) map.setView(selectedPosition,16); });
$('intervalForm').addEventListener('submit',event => {
  event.preventDefault();const value=Number($('intervalMs').value);
  if (!Number.isInteger(value)||value<200||value>2147483647) { $('intervalFeedback').textContent='Introduce un intervalo válido de al menos 200 ms.';return; }
  interval=value;syncAuto();$('intervalFeedback').textContent='Frecuencia actualizada: '+value+' ms.';
});
document.addEventListener('visibilitychange',() => { syncAuto();if(!document.hidden && auto) fetchLast(); });
window.addEventListener('offline',checkFreshness);
window.addEventListener('online',() => fetchLast());
if ('serviceWorker' in navigator && window.isSecureContext) navigator.serviceWorker.register('/sw.js').catch(()=>{});
setInterval(checkFreshness,1000);
fetchLast();syncAuto();
