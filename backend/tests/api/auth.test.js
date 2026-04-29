const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/app');
const User = require('../../src/models/User');

jest.setTimeout(30000);
let mongoServer;
const usingExternalMongo = Boolean(process.env.MONGO_URI);

beforeAll(async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    mongoServer = await MongoMemoryServer.create();
  }

  await mongoose.connect(mongoUri || mongoServer.getUri());
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  if (!usingExternalMongo) {
    await mongoServer?.stop();
  }
});

describe('Auth API', () => {
  it('should return health status', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      message: 'API is healthy',
    });
    expect(response.body.data).toHaveProperty('environment');
  });

  it('should register a new user and return tokens', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        passwordConfirm: 'password123',
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.user).toMatchObject({
      name: 'Test User',
      email: 'test@example.com',
    });
    expect(response.body.data.tokens).toHaveProperty('accessToken');
    expect(response.body.data.tokens).toHaveProperty('refreshToken');
  });

  it('should login an existing user', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'login@example.com',
      password: 'password123',
      passwordConfirm: 'password123',
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'password123',
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.tokens).toHaveProperty('accessToken');
    expect(response.body.data.tokens).toHaveProperty('refreshToken');
  });

  it('should refresh tokens with a valid refresh token', async () => {
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Refresh User',
        email: 'refresh@example.com',
        password: 'password123',
        passwordConfirm: 'password123',
      });

    const refreshResponse = await request(app)
      .post('/api/auth/refresh')
      .send({
        refreshToken: registerResponse.body.data.tokens.refreshToken,
      })
      .expect(200);

    expect(refreshResponse.body.success).toBe(true);
    expect(refreshResponse.body.data.tokens).toHaveProperty('accessToken');
    expect(refreshResponse.body.data.tokens).toHaveProperty('refreshToken');
    expect(refreshResponse.body.data.tokens.accessToken).not.toBe(registerResponse.body.data.tokens.accessToken);
  });
});
