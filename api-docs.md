# URL Shortener API

This API allows you to create shortened URLs, redirect to the original URLs using the shortened versions, and retrieve analytics for the shortened URLs.

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
  "shortUrl": "http://localhost:3000/u/abc12"
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

**Description:** Redirects to the original URL associated with the short ID and records analytics data for the visit.

**Example Usage:**

Visit `http://localhost:3000/u/abc12` in your browser, and you will be redirected to the original URL.

### 3. Retrieve URL Analytics

**Endpoint:** `/api/analytics/:shortId`

**Method:** GET

**Description:** Retrieves analytics data for a given short URL.

**Response:**

```json
{
  "shortId": "abc12",
  "originalUrl": "https://example.com",
  "totalVisits": 42,
  "visits": [
    {
      "ip_address": "127.0.0.1",
      "user_agent": "Mozilla/5.0 ...",
      "referrer": "https://google.com",
      "visited_at": "2023-06-20T12:34:56.789Z"
    },
    ...
  ]
}
```

**Example Usage:**

```sh
curl -X GET \
  -H "Accept: application/json" \
  http://localhost:3000/api/analytics/abc12
```

## Notes

- The server runs on port 3000 by default.
- You can specify a custom port using the `--port` argument when starting the server:

  ```sh
  node server.js --port=3001
  ```

- The shortened URLs use a combination of lowercase letters, uppercase letters, and numbers (a-zA-Z0-9) for the short ID.
- The API uses SQLite to store the mappings between short IDs and original URLs, as well as visit analytics.
- Analytics data includes IP address, user agent, referrer (if available), and timestamp for each visit.