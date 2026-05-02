/**
 * Backend Tests: Middleware
 */
const { guestMiddleware, optionalGuest } = require('../middleware/auth');
const { sanitizeBody, sanitizeObject } = require('../middleware/sanitize');

describe('Guest Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {}, ip: '127.0.0.1' };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('guestMiddleware should block missing header', () => {
    guestMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('guestMiddleware should pass valid guest ID', () => {
    req.headers['x-guest-id'] = 'guest_123';
    guestMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.guestId).toBe('guest_123');
  });

  it('optionalGuest should attach guest if valid', () => {
    req.headers['x-guest-id'] = 'guest_456';
    optionalGuest(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.guestId).toBe('guest_456');
  });

  it('optionalGuest should default to anonymous if invalid', () => {
    optionalGuest(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.guestId).toBe('anonymous');
  });
});

describe('Sanitize Middleware', () => {
  it('sanitizeObject should remove tags', () => {
    const input = { html: '<script>alert(1)</script>hello' };
    const output = sanitizeObject(input);
    expect(output.html).toBe('hello');
  });

  it('sanitizeBody should sanitize req.body', () => {
    const req = { body: { x: '<b>hi</b>' } };
    sanitizeBody(req, {}, () => {});
    expect(req.body.x).toBe('hi');
  });
});
