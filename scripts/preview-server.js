const express = require('express');
const path = require('path');
const fs = require('fs');

const PORT = 4173;

const app = express();

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, '../dist')));

// Serve index.html for all routes (SPA)
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../dist/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Build not found. Please run "npm run build" first.');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Preview server running at http://localhost:${PORT}`);
  console.log('📁 Serving files from dist/ directory');
});
