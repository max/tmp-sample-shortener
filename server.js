const express = require('express');
const { nanoid } = require('nanoid');
const knex = require('knex')(require('./knexfile').development);
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
    await knex('urls').insert({
      short_id: shortId,
      original_url: url
    });

    // Construct the shortened URL
    const shortenedUrl = `http://localhost:${port}/u/${shortId}`;

    res.json({ shortenedUrl });
  } catch (error) {
    console.error('Error inserting URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Redirect endpoint
app.get('/u/:shortId', async (req, res) => {
  const { shortId } = req.params;

  try {
    const url = await knex('urls').where({ short_id: shortId }).first();

    if (url) {
      res.redirect(url.original_url);
    } else {
      res.status(404).json({ error: 'URL not found' });
    }
  } catch (error) {
    console.error('Error retrieving URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`URL shortener API listening at http://localhost:${port}`);
});