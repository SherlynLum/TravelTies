jest.mock("firebase-admin", () => (
    {
        auth: () => ({
            verifyIdToken: jest.fn(async (token) => {
                if (token === 'valid_token') {
                    return {uid: 'test_uid'};
                } else {
                    throw new Error('Invalid token');
                }
            }),
        }),
        credential: {
            cert: jest.fn(() => {}) // mock cert with an empty object
        },
        initializeApp: jest.fn()
    }
));

const request = require('supertest');
const app = require('../app.js');
const admin = require('firebase-admin');
const User = require("../models/user.model.js");
const Rating = require("../models/rating.model.js");

describe('POST /api/user/sync', () => {
    it('create a new user', async () => {
        const res = await request(app).post('/api/user/sync')
            .set('Authorization', 'Bearer valid_token');
        
        expect(res.statusCode).toBe(200);
        expect(res.body.onboard).toBe(false);
        expect(res.body.data.uid).toBe('test_uid');

        // verify db
        const user = await User.findOne({uid: 'test_uid'});
        expect(user).not.toBeNull();
    })
    it('get a user who has not onboarded', async () => {
        // insert dummy user into db
        await User.create({uid: 'test_uid'});

        const res = await request(app).post('/api/user/sync')
            .set('Authorization', 'Bearer valid_token');
        
        expect(res.statusCode).toBe(200);
        expect(res.body.onboard).toBe(false);
        expect(res.body.data.uid).toBe('test_uid');
    })
    it('get a user who has onboarded', async () => {
        // insert dummy user into db
        await User.create({uid: 'test_uid', username: 'test_user'});

        const res = await request(app).post('/api/user/sync')
            .set('Authorization', 'Bearer valid_token');
        
        expect(res.statusCode).toBe(200);
        expect(res.body.onboard).toBe(true);
        expect(res.body.data.uid).toBe('test_uid');
        expect(res.body.data.username).toBe('test_user');
    })
    // test firebase auth middleware here 
    it('missing token', async () => {
        const res = await request(app).post('/api/user/sync');
        
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe("No token provided");
    })
    it('unauthorised user', async () => {
        const res = await request(app).post('/api/user/sync')
            .set('Authorization', 'Bearer invalid_token');
        
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('Unauthorized user');
    })
})

describe('POST /api/user/rate', () => {
    it('post a rating', async () => {
        const res = await request(app).post('/api/user/rate')
            .set('Authorization', 'Bearer valid_token')
            .send({rating: 5})
        
        expect(res.statusCode).toBe(201);

        // verify db
        const rate = await Rating.findOne({uid: 'test_uid', rating: 5});
        expect(rate).not.toBeNull();
    })
    it('missing rating', async () => {
        const res = await request(app).post('/api/user/rate')
            .send({})
            .set('Authorization', 'Bearer valid_token')
        
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Invalid rating");
    })
    it('rating that is not a number', async () => {
        const res = await request(app).post('/api/user/rate')
            .set('Authorization', 'Bearer valid_token')
            .send({rating: "five"})
        
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Invalid rating");
    })
    it('rating that is not an integer', async () => {
        const res = await request(app).post('/api/user/rate')
            .set('Authorization', 'Bearer valid_token')
            .send({rating: 3.3})
        
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Invalid rating");
    })
    it('rating too small', async () => {
        const res = await request(app).post('/api/user/rate')
            .set('Authorization', 'Bearer valid_token')
            .send({rating: 0})
        
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Invalid rating");
    })
    it('rating too big', async () => {
        const res = await request(app).post('/api/user/rate')
            .set('Authorization', 'Bearer valid_token')
            .send({rating: 6})
        
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Invalid rating");
    })
})

// planning to test presigned url in aws.test.js

describe('PATCH /api/user/username', () => {
    it('missing username', async () => {
        const res = await request(app).patch('/api/user/username')
            .send({})
            .set('Authorization', 'Bearer valid_token');
        
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Missing username");
    })
    it('username is not a string', async () => {
        const res = await request(app).patch('/api/user/username')
            .set('Authorization', 'Bearer valid_token')
            .send({username: 5});
        
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Username must be a string");
    })
    it('username contains space', async () => {
        const res = await request(app).patch('/api/user/username')
            .set('Authorization', 'Bearer valid_token')
            .send({username: 5});
        
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Username must be a string");
    })
    it('get a user who has not onboarded', async () => {
        // insert dummy user into db
        await User.create({uid: 'test_uid'});

        const res = await request(app).post('/api/user/sync')
            .set('Authorization', 'Bearer valid_token');
        
        expect(res.statusCode).toBe(200);
        expect(res.body.onboard).toBe(false);
        expect(res.body.data.uid).toBe('test_uid');
    })
})