import { describe, it, expect, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { protect, adminOnly } from '../../middleware/auth.js';

const SECRET = process.env.JWT_SECRET;

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json   = vi.fn().mockReturnValue(res);
  return res;
}

describe('protect middleware', () => {
  it('returns 401 when no token provided', () => {
    const req  = { headers: {} };
    const res  = mockRes();
    const next = vi.fn();

    protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 for invalid token', () => {
    const req  = { headers: { authorization: 'Bearer bad_token' } };
    const res  = mockRes();
    const next = vi.fn();

    protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next() and sets req.user for valid token', () => {
    const payload = { id: 'user123', role: 'user' };
    const token   = jwt.sign(payload, SECRET, { expiresIn: '1h' });
    const req     = { headers: { authorization: `Bearer ${token}` } };
    const res     = mockRes();
    const next    = vi.fn();

    protect(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.id).toBe('user123');
    expect(req.user.role).toBe('user');
  });
});

describe('adminOnly middleware', () => {
  it('returns 403 for non-admin user', () => {
    const req  = { user: { id: 'u1', role: 'user' } };
    const res  = mockRes();
    const next = vi.fn();

    adminOnly(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next() for admin user', () => {
    const req  = { user: { id: 'a1', role: 'admin' } };
    const res  = mockRes();
    const next = vi.fn();

    adminOnly(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
