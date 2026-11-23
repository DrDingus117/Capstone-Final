// Phone version (iOS / Android): shows the map in a WebView.
// Needs:  npx expo install react-native-webview
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
// Install with `npx expo install react-native-webview` if this import is unresolved.
// @ts-ignore -- the package may not be installed in every target environment.
import { WebView } from 'react-native-webview';


type Center = {
  name?: string;
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
};

function buildMapHtml(centers: Center[]) {
  const points = centers
    .map((center) => ({
      name: center.name ?? 'Center',
      lat: center.latitude ?? center.lat,
      lng: center.longitude ?? center.lng,
    }))
    .filter(
      (point): point is { name: string; lat: number; lng: number } =>
        Number.isFinite(point.lat) && Number.isFinite(point.lng),
    );
  const pointsJson = JSON.stringify(points).replace(/</g, '\\u003c');

  return `<!doctype html>
<html><head><meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<style>html,body,#map{height:100%;margin:0}</style></head>
<body><div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
const points = ${pointsJson};
const map = L.map('map');
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
points.forEach(point => L.marker([point.lat, point.lng]).addTo(map).bindPopup(point.name));
if (points.length) map.fitBounds(points.map(point => [point.lat, point.lng]), { padding: [24, 24] });
else map.setView([0, 0], 2);
</script></body></html>`;
}

export default function CentersMap({ centers }: { centers: Center[] }) {
  const html = useMemo(() => buildMapHtml(centers), [centers]);

  return (
    <View style={styles.box}>
      <WebView originWhitelist={['*']} source={{ html }} style={styles.web} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { width: '100%', height: 420, borderRadius: 12, overflow: 'hidden' },
  web: { flex: 1 },
});