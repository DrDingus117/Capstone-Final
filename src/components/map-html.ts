// Builds a small Leaflet + OpenStreetMap page. It is shown in an <iframe> on
// web and in a WebView on phones, so the same map works everywhere with no API key.

export type Center = {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zip?: string;
  lat: number;
  lng: number;
  phone?: string;
  website?: string;
  services?: string[];
  notes?: string;
};

export function buildMapHtml(centers: Center[]): string {
  // "<" is escaped so the data can never close the <script> tag early.
  const data = JSON.stringify(centers).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css" />
<style>
  html, body, #map { height: 100%; margin: 0; }
  .popup-title { font-weight: 700; margin-bottom: 4px; }
  .popup-line { margin: 2px 0; }
</style>
</head>
<body>
<div id="map"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"></script>
<script>
  var centers = ${data};

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var map = L.map('map').setView([47.4, -121.5], 7);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  var points = [];
  centers.forEach(function (c) {
    var html =
      '<div class="popup-title">' + esc(c.name) + '</div>' +
      '<div class="popup-line">' + esc(c.address) + ', ' + esc(c.city) + ', ' + esc(c.state) + '</div>' +
      (c.phone ? '<div class="popup-line">' + esc(c.phone) + '</div>' : '') +
      (c.services && c.services.length
        ? '<div class="popup-line">' + esc(c.services.join(', ')) + '</div>'
        : '');
    L.marker([c.lat, c.lng]).addTo(map).bindPopup(html);
    points.push([c.lat, c.lng]);
  });

  if (points.length > 1) {
    map.fitBounds(points, { padding: [30, 30] });
  } else if (points.length === 1) {
    map.setView(points[0], 12);
  }
</script>
</body>
</html>`;
}