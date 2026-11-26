// Autism awareness app API (Express 5 + SQLite)
//   npm run seed   (once, imports the old JS data into the database)
//   npm start      (http://localhost:3000)
const express = require('express');
const cors = require('cors');
const config = require('./config');
const store = require('./store');

const app = express();
app.use(cors());
app.use(express.json());

const { ApiError } = store;

function idParam(req, name = 'id') {
  const n = Number(req.params[name]);
  if (!Number.isInteger(n) || n < 1) throw new ApiError(400, 'Invalid id');
  return n;
}

// ---------- Topics (Glossary) ----------
app.get('/api/topics', (req, res) => res.json(store.listTopics(req.query)));
app.get('/api/topics/:id', (req, res) => res.json(store.getTopic(idParam(req))));
app.post('/api/topics', (req, res) => res.status(201).json(store.createTopic(req.body)));
app.put('/api/topics/:id', (req, res) => res.json(store.updateTopic(idParam(req), req.body)));
app.delete('/api/topics/:id', (req, res) => { store.deleteTopic(idParam(req)); res.status(204).end(); });

// ---------- Comments ----------
app.get('/api/topics/:id/comments', (req, res) => res.json(store.listComments(idParam(req))));
app.post('/api/topics/:id/comments', (req, res) => res.status(201).json(store.createComment(idParam(req), req.body)));
app.get('/api/comments/:id', (req, res) => res.json(store.getComment(idParam(req))));
app.put('/api/comments/:id', (req, res) => res.json(store.updateComment(idParam(req), req.body)));
app.delete('/api/comments/:id', (req, res) => { store.deleteComment(idParam(req)); res.status(204).end(); });

// ---------- Resources ----------
// The list keeps the shape the Resources screen already expects.
app.get('/api/resources', (req, res) => res.json({ resources: store.listResources(), disclaimer: store.getDisclaimer() }));
app.get('/api/resources/:id', (req, res) => res.json(store.getResource(idParam(req))));
app.post('/api/resources', (req, res) => res.status(201).json(store.createResource(req.body)));
app.put('/api/resources/:id', (req, res) => res.json(store.updateResource(idParam(req), req.body)));
app.delete('/api/resources/:id', (req, res) => { store.deleteResource(idParam(req)); res.status(204).end(); });

// ---------- Centers (map) ----------
app.get('/api/centers', (req, res) => res.json(store.listCenters(req.query)));
app.get('/api/centers/:id', (req, res) => res.json(store.getCenter(idParam(req))));
app.post('/api/centers', (req, res) => res.status(201).json(store.createCenter(req.body)));
app.put('/api/centers/:id', (req, res) => res.json(store.updateCenter(idParam(req), req.body)));
app.delete('/api/centers/:id', (req, res) => { store.deleteCenter(idParam(req)); res.status(204).end(); });

// ---------- Analytics (SQL queries) ----------
app.get('/api/analytics/summary', (req, res) => res.json(store.analyticsSummary()));
app.get('/api/analytics/topics-by-category', (req, res) => res.json(store.topicsByCategory()));
app.get('/api/analytics/centers-by-city', (req, res) => res.json(store.centersByCity()));
app.get('/api/analytics/services', (req, res) => res.json(store.servicesCount()));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ---------- Errors ----------
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? 'Server error' : err.message });
});

app.listen(config.server.port, config.server.host, () => {
  console.log(`API running at http://localhost:${config.server.port}`);
  console.log(`Database: ${config.database.file}`);
});
