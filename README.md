# URL Shortener

This is a URL shortener API written in Node.js. It provides functionality to shorten long URLs, redirect users to the original URLs, and track analytics for URL visits.

## Features

- Shorten long URLs to compact, easy-to-share links
- Redirect users from shortened URLs to original URLs
- Track analytics for URL visits, including visitor IP addresses and other metadata
- Retrieve analytics for a given short URL
- API documentation available at the root endpoint

## Technology Stack

- Node.js
- Express.js
- SQLite (with Knex.js for migrations and query building)
- Jest for testing
- TailwindCSS for styling the API documentation page

## Local Development

### Prerequisites

- Node.js (versions 14.x, 16.x, or 18.x)
- npm

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/url-shortener.git
   cd url-shortener
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run database migrations:
   ```
   npx knex migrate:latest
   ```

4. Build the CSS:
   ```
   npm run build:css
   ```

5. Start the server:
   ```
   npm start
   ```
   Or, to specify a custom port:
   ```
   node server.js --port=3001
   ```

The server will start, and you can access the API documentation at `http://localhost:3000` (or your specified port).

### Running Tests

To run the test suite:

```
npm test
```

To run tests with an in-memory SQLite database:

```
NODE_ENV=test npm test
```

## API Usage

### Shorten a URL

```sh
curl -X POST \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/"}' \
  http://localhost:3000/api
```

### Retrieve Analytics

```sh
curl -X GET http://localhost:3000/api/analytics/:shortId
```

Replace `:shortId` with the ID of the shortened URL.

## CI/CD

This project uses GitHub Actions for continuous integration. The CI pipeline runs on pushes to the main branch and on pull requests, testing the project on Node.js versions 14.x, 16.x, and 18.x.

## License

[MIT License](LICENSE)