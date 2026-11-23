// Autism awareness app API
// Run: npm install && npm start   (serves on http://localhost:3000)

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ---------- Data layer ----------
// Data lives in JavaScript modules in ./data (content.js, resources.js,
// centers.js). Restart the server after editing them.
const getTopics = () => require('./data/content').topics;
const getResources = () => require('./data/resources');
const getCenters = () => require('./data/centers');

// Count items by a key, returns [{ label, count }] sorted high to low
function countBy(items, keyFn) {
  const counts = {};
  for (const item of items) {
    const keys = [].concat(keyFn(item) || 'Unknown');
    for (const k of keys) counts[k] = (counts[k] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

// ---------- Content routes ----------
app.get('/api/topics', (req, res) => {
  let topics = getTopics();
  const { category, q } = req.query;
  if (category) topics = topics.filter((t) => t.category.toLowerCase() === category.toLowerCase());
  if (q) {
    const term = q.toLowerCase();
    topics = topics.filter((t) => `${t.title} ${t.summary}`.toLowerCase().includes(term));
  }
  res.json(topics);
});

app.get('/api/topics/:id', (req, res) => {
  const topic = getTopics().find((t) => t.id === req.params.id);
  if (!topic) return res.status(404).json({ error: 'Topic not found' });
  res.json(topic);
});

app.get('/api/resources', (req, res) => res.json(getResources()));

// ---------- Centers routes (feeds the map) ----------
app.get('/api/centers', (req, res) => {
  let centers = getCenters();
  const { city, service } = req.query;
  if (city) centers = centers.filter((c) => (c.city || '').toLowerCase() === city.toLowerCase());
  if (service) {
    centers = centers.filter((c) =>
      (c.services || []).some((s) => s.toLowerCase().includes(service.toLowerCase()))
    );
  }
  res.json(centers);
});

app.get('/api/centers/:id', (req, res) => {
  const center = getCenters().find((c) => String(c.id) === req.params.id);
  if (!center) return res.status(404).json({ error: 'Center not found' });
  res.json(center);
});

// ---------- Analytics routes (Data Analytics requirement) ----------
app.get('/api/analytics/topics-by-category', (req, res) => {
  res.json(countBy(getTopics(), (t) => t.category));
});

app.get('/api/analytics/centers-by-city', (req, res) => {
  res.json(countBy(getCenters(), (c) => c.city));
});

app.get('/api/analytics/services', (req, res) => {
  res.json(countBy(getCenters(), (c) => c.services));
});

app.get('/api/analytics/summary', (req, res) => {
  const topics = getTopics();
  const centers = getCenters();
  const resources = getResources().resources;
  const wordCount = topics.reduce(
    (sum, t) => sum + t.body.join(' ').split(/\s+/).filter(Boolean).length,
    0
  );
  res.json({
    totalTopics: topics.length,
    totalResources: resources.length,
    totalCenters: centers.length,
    categories: countBy(topics, (t) => t.category).length,
    averageWordsPerTopic: topics.length ? Math.round(wordCount / topics.length) : 0,
    topicsWithSources: topics.filter((t) => t.sources && t.sources.length > 0).length,
  });
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// 0.0.0.0 lets your phone reach the server over your Wi-Fi
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API running at http://localhost:${PORT}`);
});
