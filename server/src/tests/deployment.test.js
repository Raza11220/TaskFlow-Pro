import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';

vi.mock('../config/database.js', () => ({ default: vi.fn() }));
vi.mock('../jobs/index.js', () => ({ runDailyJobs: vi.fn() }));

import connectDatabase from '../config/database.js';
import { runDailyJobs } from '../jobs/index.js';
import env from '../config/env.js';
import server from '../../api/index.js';

describe('Vercel entry point', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    env.CRON_SECRET = 'test-cron-secret';
  });

  it('exports an HTTP server without opening a listener and serves liveness without MongoDB', async () => {
    expect(server.listening).toBe(false);
    const response = await request(server).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
    expect(connectDatabase).not.toHaveBeenCalled();
  });

  it('returns 503 for readiness and API requests when MongoDB cannot connect', async () => {
    connectDatabase.mockRejectedValue(new Error('Database offline'));
    expect((await request(server).get('/api/ready')).status).toBe(503);
    const response = await request(server).get('/api/v1/auth/me');
    expect(response.status).toBe(503);
    expect(response.body.code).toBe('DATABASE_UNAVAILABLE');
  });

  it('connects before reporting database readiness', async () => {
    const state = vi
      .spyOn(mongoose.connection, 'readyState', 'get')
      .mockReturnValue(1);
    try {
      expect((await request(server).get('/api/ready')).status).toBe(200);
      expect(connectDatabase).toHaveBeenCalledOnce();
    } finally {
      state.mockRestore();
    }
  });

  it('rejects unauthorized cron requests before touching the database', async () => {
    expect((await request(server).get('/api/jobs/daily')).status).toBe(401);
    expect(
      (
        await request(server)
          .get('/api/jobs/daily')
          .set('Authorization', 'Bearer wrong')
      ).status
    ).toBe(401);
    env.CRON_SECRET = '';
    expect(
      (
        await request(server)
          .get('/api/jobs/daily')
          .set('Authorization', 'Bearer ')
      ).status
    ).toBe(401);
    expect(connectDatabase).not.toHaveBeenCalled();
    expect(runDailyJobs).not.toHaveBeenCalled();
  });

  it('runs authorized daily jobs after connecting to MongoDB', async () => {
    const response = await request(server)
      .get('/api/jobs/daily')
      .set('Authorization', 'Bearer test-cron-secret');
    expect(response.status).toBe(200);
    expect(connectDatabase).toHaveBeenCalledOnce();
    expect(runDailyJobs).toHaveBeenCalledOnce();
    expect(connectDatabase.mock.invocationCallOrder[0]).toBeLessThan(
      runDailyJobs.mock.invocationCallOrder[0]
    );
  });

  it('returns failure when a daily job fails', async () => {
    runDailyJobs.mockRejectedValue(new Error('Job failed'));
    expect(
      (
        await request(server)
          .get('/api/jobs/daily')
          .set('Authorization', 'Bearer test-cron-secret')
      ).status
    ).toBe(500);
  });
});
