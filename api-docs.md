# URL Shortener API

This API allows you to create shortened URLs and redirect to the original URLs using the shortened versions.

## Endpoints

### 1. Shorten URL

**Endpoint:** `/api`

**Method:** POST

**Description:** Shortens the provided URL and returns a shortened URL.

**Request Body:**

```json
{
  "url": "https://example.com"
}
```

**Response:**

```json
{
  "shortenedUrl": "http://localhost:3000/u/abc12"
}
```

**Example Usage:**

```sh
curl -X POST \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/"}' \
  http://localhost:3000/api
```

### 2. Redirect to Original URL

**Endpoint:** `/u/:shortId`

**Method:** GET

**Description:** Redirects to the original URL associated with the short ID.

**Example Usage:**

Visit `http://localhost:3000/u/abc12` in your browser, and you will be redirected to the original URL.

## Notes

- The server runs on port 3000 by default.
- You can specify a custom port using the `--port` argument when starting the server:

  ```sh
  node server.js --port=3001
  ```

- The shortened URLs use a combination of lowercase letters, uppercase letters, and numbers (a-zA-Z0-9) for the short ID.
- The API uses SQLite to store the mappings between short IDs and original URLs.