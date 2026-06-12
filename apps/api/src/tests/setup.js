// Set env vars before any test imports
process.env.MONGO_URI   = 'mongodb://localhost:27017/ecommerce_test';
process.env.JWT_SECRET  = 'test_secret_key_for_vitest';
process.env.PORT        = '5001';
process.env.NODE_ENV    = 'test';
