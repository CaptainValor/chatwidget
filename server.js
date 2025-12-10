const express = require('express');
const path = require('path');
const app = express();

// Allow CORS for embedding
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Add cache control for widget files (short cache, always revalidate)
app.use((req, res, next) => {
  if (req.path.endsWith('.js') || req.path.endsWith('.html') || req.path.endsWith('.css')) {
    // Cache for 5 minutes but always revalidate
    res.setHeader('Cache-Control', 'public, max-age=300, must-revalidate');
  } else if (req.path.match(/\.(png|jpg|jpeg|gif|svg)$/)) {
    // Images can cache longer (1 day)
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }
  next();
});

// Serve static files
app.use(express.static('public'));

// Serve the widget embed script
app.get('/widget.js', (req, res) => {
  res.type('application/javascript');
  res.sendFile(path.join(__dirname, 'public', 'widget.js'));
});

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Chat widget server running on port ${PORT}`);
});
