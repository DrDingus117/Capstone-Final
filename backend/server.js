
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Load educational content
const contentPath = path.join(__dirname, '..', 'content.json');
const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

// Topics endpoint
app.get('/api/topics', (req, res) => {
  res.json(content.topics);
});

// Resources endpoint
app.get('/api/resources', (req, res) => {
  res.json(content.resources);
});


// Load map locations
const locationsPath = path.join(__dirname, '..', 'locations.json');
const locationsData = JSON.parse(fs.readFileSync(locationsPath, 'utf8'));

// Locations endpoint
app.get('/api/locations', (req, res) => {
  res.json(locationsData.locations);
});


// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on port ${PORT}`);
});
