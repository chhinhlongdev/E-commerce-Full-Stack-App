import { describe, it, expect } from 'vitest';

describe('User schema (unit)', () => {
  it('fails validation when name is missing', async () => {
    const User = (await import('../../models/User.js')).default;
    const u = new User({ email: 'a@b.com', password: '123456' });
    const err = u.validateSync();
    expect(err?.errors?.name).toBeDefined();
  });

  it('fails validation when email is missing', async () => {
    const User = (await import('../../models/User.js')).default;
    const u = new User({ name: 'Test', password: '123456' });
    const err = u.validateSync();
    expect(err?.errors?.email).toBeDefined();
  });

  it('defaults role to user', async () => {
    const User = (await import('../../models/User.js')).default;
    const u = new User({ name: 'Test', email: 'a@b.com', password: '123456' });
    expect(u.role).toBe('user');
  });

  it('rejects invalid role enum', async () => {
    const User = (await import('../../models/User.js')).default;
    const u = new User({ name: 'Test', email: 'a@b.com', password: '123456', role: 'superuser' });
    const err = u.validateSync();
    expect(err?.errors?.role).toBeDefined();
  });

  it('comparePassword returns false for wrong password', async () => {
    const bcrypt = await import('bcryptjs');
    const User   = (await import('../../models/User.js')).default;
    const u      = new User({ name: 'T', email: 'x@x.com', password: '123456' });
    // Manually hash since pre-save hook won't run in unit test
    u.password   = await bcrypt.default.hash('correctpassword', 10);
    const result = await u.comparePassword('wrongpassword');
    expect(result).toBe(false);
  });

  it('comparePassword returns true for correct password', async () => {
    const bcrypt = await import('bcryptjs');
    const User   = (await import('../../models/User.js')).default;
    const u      = new User({ name: 'T', email: 'x@x.com', password: 'x' });
    u.password   = await bcrypt.default.hash('mypassword', 10);
    const result = await u.comparePassword('mypassword');
    expect(result).toBe(true);
  });

  it('address subdocument has correct default values', async () => {
    const User = (await import('../../models/User.js')).default;
    const u    = new User({
      name: 'Test', email: 'a@b.com', password: 'pass123',
      addresses: [{ street: '123 St', city: 'PP', country: 'Cambodia' }],
    });
    expect(u.addresses[0].isDefault).toBe(false);
    expect(u.addresses[0].label).toBe('Home');
  });
});
