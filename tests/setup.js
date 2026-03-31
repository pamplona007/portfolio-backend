import { beforeAll, afterEach, afterAll } from 'vitest';

// Import the app factory to avoid shared state between tests
let server;
let baseUrl;

beforeAll(async () => {
  const { createApp } = await import('../src/index.js');
  const app = createApp();
  server = app.listen(3006);
  baseUrl = 'http://localhost:3006';
});

afterEach(async () => {
  // Reset in-memory data between tests
  const { resetData } = await import('../src/data/store.js');
  resetData();
});

afterAll(() => {
  server.close();
});

export { baseUrl };
