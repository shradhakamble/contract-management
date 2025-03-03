const request = require('supertest');
const app = require('../src/app'); 

describe('POST /api/balances/deposit/:userId', () => {

    // Profile not found
    it('should return 404 if profile is not found', async () => {
        const userId = 9; 
        const response = await request(app)
            .post(`/api/balances/deposit/${userId}`) 
            .send({ amount: 50 });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Profile not found');
    });

    // Amount is 0
    it('should return 400 if deposit amount is 0', async () => {
        const userId = 1; 
        const response = await request(app)
            .post(`/api/balances/deposit/${userId}`) 
            .send({ amount: 0 });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Amount can not be 0');
    });

    // No unpaid jobs
    it('should return 400 if there are no dues for the profile', async () => {
        const userId = 3; 
        const response = await request(app)
            .post(`/api/balances/deposit/${userId}`)
            .send({ amount: 50 });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('No unpaid jobs available. Cannot deposit money.');
    });

    // Client not found
    it('should return 404 if the profile is not a client', async () => {
        const userId = 5; 
        const response = await request(app)
            .post(`/api/balances/deposit/${userId}`)
            .send({ amount: 50 });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Client not found');
    });

    // Deposit amount exceeds 25% of total jobs due
    it('should return 400 if deposit exceeds 25% of total jobs due', async () => {
        const userId = 4; 
        const response = await request(app)
            .post(`/api/balances/deposit/${userId}`)
            .send({ amount: 1000 }); // Amount exceeds limit

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Cannot deposit more than 25% of total jobs due: 50');
    });

    // Successful deposit
    it('should return 200 and success message when deposit is successful', async () => {
        const userId = 2; 
        const response = await request(app)
            .post(`/api/balances/deposit/${userId}`) 
            .send({ amount: 5 }); 

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Deposit Successful.');
    });

});
