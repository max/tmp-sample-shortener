const request = require('supertest');
const { app, server, db } = require('./server');

describe('URL Shortener API', () => {
  beforeEach(async () => {
    await db.migrate.latest();
  });

  afterEach(async () => {
    await db('urls').truncate();
    await db('visits').truncate();
  });

  afterAll(async () => {
    await db.destroy();
    await new Promise((resolve) => server.close(resolve));
  });

  test('GET / should return HTML with API documentation', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.type).toBe('text/html');
    expect(response.text).toContain('URL Shortener API');
  });

  test('POST /api should create a short URL', async () => {
    const response = await request(app)
      .post('/api')
      .send({ url: 'https://example.com' })
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('shortUrl');
    expect(response.body.shortUrl).toMatch(/^http:\/\/localhost:\d+\/u\/[a-zA-Z0-9]+$/);
  });

  test('GET /u/:shortId should redirect to original URL and record visit', async () => {
    // First, create a short URL
    const createResponse = await request(app)
      .post('/api')
      .send({ url: 'https://example.com' })
      .set('Accept', 'application/json');

    const shortUrl = createResponse.body.shortUrl;
    const shortId = shortUrl.split('/').pop();

    // Now, try to access the short URL
    const response = await request(app).get(`/u/${shortId}`);
    expect(response.status).toBe(302); // Expect a redirect
    expect(response.headers.location).toBe('https://example.com');

    // Check if the visit was recorded
    const analyticsResponse = await request(app).get(`/api/analytics/${shortId}`);
    expect(analyticsResponse.status).toBe(200);
    expect(analyticsResponse.body.totalVisits).toBe(1);
    expect(analyticsResponse.body.visits).toHaveLength(1);
    expect(analyticsResponse.body.visits[0]).toHaveProperty('ip_address');
    expect(analyticsResponse.body.visits[0]).toHaveProperty('user_agent');
    expect(analyticsResponse.body.visits[0]).toHaveProperty('visited_at');
  });

  test('GET /api/analytics/:shortId should return analytics data', async () => {
    // First, create a short URL
    const createResponse = await request(app)
      .post('/api')
      .send({ url: 'https://example.com' })
      .set('Accept', 'application/json');

    const shortUrl = createResponse.body.shortUrl;
    const shortId = shortUrl.split('/').pop();

    // Simulate some visits
    await request(app).get(`/u/${shortId}`);
    await request(app).get(`/u/${shortId}`);
    await request(app).get(`/u/${shortId}`);

    // Now, get the analytics
    const analyticsResponse = await request(app).get(`/api/analytics/${shortId}`);
    expect(analyticsResponse.status).toBe(200);
    expect(analyticsResponse.body).toHaveProperty('shortId', shortId);
    expect(analyticsResponse.body).toHaveProperty('originalUrl', 'https://example.com');
    expect(analyticsResponse.body).toHaveProperty('totalVisits', 3);
    expect(analyticsResponse.body.visits).toHaveLength(3);
    expect(analyticsResponse.body.visits[0]).toHaveProperty('ip_address');
    expect(analyticsResponse.body.visits[0]).toHaveProperty('user_agent');
    expect(analyticsResponse.body.visits[0]).toHaveProperty('visited_at');
  });

  test('GET /api/analytics/:shortId should return 404 for non-existent short URL', async () => {
    const response = await request(app).get('/api/analytics/nonexistent');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'URL not found');
  });
});