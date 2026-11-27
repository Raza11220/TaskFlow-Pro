import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('mongoose', () => ({
  default: { connection: { readyState: 0 }, connect: vi.fn() },
}));

import mongoose from 'mongoose';
import connectDatabase from '../config/database.js';

describe('MongoDB connections in a Vercel function', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mongoose.connection.readyState = 0;
  });

  it('shares concurrent connection attempts and reuses connected instances', async () => {
    let resolveConnection;
    mongoose.connect.mockReturnValue(
      new Promise((resolve) => {
        resolveConnection = resolve;
      })
    );
    const first = connectDatabase();
    const second = connectDatabase();
    expect(mongoose.connect).toHaveBeenCalledOnce();
    resolveConnection(mongoose);
    await Promise.all([first, second]);
    mongoose.connection.readyState = 1;
    expect(await connectDatabase()).toBe(mongoose);
    expect(mongoose.connect).toHaveBeenCalledOnce();
  });

  it('allows a new connection attempt after a failure', async () => {
    mongoose.connect
      .mockRejectedValueOnce(new Error('Connection timed out'))
      .mockResolvedValueOnce(mongoose);
    await expect(connectDatabase()).rejects.toThrow('Connection timed out');
    await expect(connectDatabase()).resolves.toBe(mongoose);
    expect(mongoose.connect).toHaveBeenCalledTimes(2);
  });
});
