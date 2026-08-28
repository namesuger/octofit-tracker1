import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createServer } from 'node:http';

import { app, getApiBaseUrl } from './index.js';

test('API exposes required resource routes', async () => {
  const server = createServer(app);
  server.listen(0);
  await once(server, 'listening');

  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const port = address.port;

  const routes = [
    '/api/users/',
    '/api/teams/',
    '/api/activities/',
    '/api/leaderboard/',
    '/api/workouts/'
  ];

  for (const route of routes) {
    const response = await fetch(`http://127.0.0.1:${port}${route}`);
    assert.ok(response.ok, `${route} should return ok but got ${response.status}`);
  }

  server.close();
});

test('Codespaces base URL is built from CODESPACE_NAME when present', () => {
  process.env.CODESPACE_NAME = 'octofit-demo';
  assert.equal(getApiBaseUrl(), 'https://octofit-demo-8000.app.github.dev');
  delete process.env.CODESPACE_NAME;
});
