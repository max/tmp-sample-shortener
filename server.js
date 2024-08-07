const express = require('express');
const { nanoid } = require('nanoid');
const knex = require('knex');
const path = require('path');
const fs = require('fs');
const marked = require('marked');

const app = express();

// Parse command line arguments
const args = process.argv.slice(2);
const portArg = args.find(arg => arg.startsWith('--port='));
const port = portArg ? parseInt(portArg.split('=')[1], 10) : 3000;

app.use(express.json());
app.use(express.static('public'));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Database setup
let db;
if (process.env.NODE_ENV === 'test') {
  db = knex(require('./knexfile').test);
} else {
  db = knex(require('./knexfile').development);
}

// API root view
app.get('/', (req, res) => {
  const docPath = path.join(__dirname, 'api-docs.md');
  fs.readFile(docPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading API documentation:', err);
      return res.status(500).send('Internal server error');
    }
    const htmlContent = marked.parse(data);
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>URL Shortener API Documentation</title>
        <link href="/output.css" rel="stylesheet">
      </head>
      <body class="bg-gray-100 text-gray-900 p-4">
        <div class="container mx-auto max-w-3xl">
          <h1 class="text-3xl font-bold mb-4">URL Shortener API Documentation</h1>
          <div class="bg-white rounded-lg shadow-md p-6">
            ${htmlContent}
          </div>
        </div>
      </body>
      </html>
    `;
    res.send(html);
  });
});

// API endpoint to accept a new URL
app.post('/api', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Generate a short ID using nanoid
  const shortId = nanoid(5);

  try {
    // Store the mapping in the database
    await db('urls').insert({
      short_id: shortId,
      original_url: url
    });

    // Construct the shortened URL
    const shortUrl = `http://localhost:${port}/u/${shortId}`;

    res.json({ shortUrl });
  } catch (error) {
    console.error('Error inserting URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Redirect endpoint with analytics
app.get('/u/:shortId', async (req, res) => {
  const { shortId } = req.params;

  try {
    const url = await db('urls').where({ short_id: shortId }).first();

    if (url) {
      // Record visit analytics
      await db('visits').insert({
        url_id: url.id,
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        referrer: req.get('Referrer') || null
      });

      res.redirect(url.original_url);
    } else {
      res.status(404).json({ error: 'URL not found' });
    }
  } catch (error) {
    console.error('Error retrieving URL or recording visit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// New endpoint to get analytics for a URL
app.get('/api/analytics/:shortId', async (req, res) => {
  const { shortId } = req.params;

  try {
    const url = await db('urls').where({ short_id: shortId }).first();

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    const visits = await db('visits')
      .where({ url_id: url.id })
      .select('ip_address', 'user_agent', 'referrer', 'visited_at');

    res.json({
      shortId,
      originalUrl: url.original_url,
      totalVisits: visits.length,
      visits
    });
  } catch (error) {
    console.error('Error retrieving analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const server = app.listen(port, () => {
  console.log(`URL shortener API listening at http://localhost:${port}`);
});

module.exports = { app, server, db };