const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');

let mongoServer;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test_secret';
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('POST /api/auth/register', () => {
  const credentials = { email: 'test@example.com', password: 'password123' };

  it('cree un compte avec succes (201)', async () => {
    const res = await request(app).post('/api/auth/register').send(credentials);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(credentials.email);
  });

  it('renvoie une erreur 400 si l\'email existe deja', async () => {
    const res = await request(app).post('/api/auth/register').send(credentials);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
});
