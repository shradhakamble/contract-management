const request = require('supertest');
const app = require('../src/app'); 
const { sequelize } = require('../src/model');

describe('Contract API Tests with Authentication', () => {

    afterAll(async () => {
        // Clean up database connections and data after tests
        await sequelize.close();
    });


    // Test for Contract by ID
    describe('GET /api/contracts/:id', () => {
        let contractId = 1; 

        // Missing or invalid profile_id
        it('should return 400 if profile_id is missing or invalid', async () => {
            const response = await request(app)
            .get(`/api/contracts/${contractId}`)
            .send();

            expect(response.status).toBe(400); 
            expect(response.body.message).toBe('Missing or invalid profile_id in header');
        });

        // Invalid profile_id 
        it('should return 404 if profile is not found', async () => {
            const response = await request(app)
            .get(`/api/contracts/${contractId}`)
            .set('profile_id', 9) 
            .send();

            expect(response.status).toBe(401); 
            expect(response.body.message).toBe('Unauthorized: Profile not found');
        });

        // Valid client profile_id along with contractID
        it('should return 200 and contract details with valid contract and client profile ID', async () => {
            const response = await request(app)
            .get(`/api/contracts/${contractId}`)
            .set('profile_id', 1)
            .send();

            expect(response.status).toBe(200);
            expect(response.body.id).toBe(contractId);
            expect(response.body.ClientId).toBe(1);
        });

        // Valid contractor profile_id 
        it('should return 200 and contract details with valid contract and contractor profile ID', async () => {
            const response = await request(app)
                .get(`/api/contracts/${contractId}`)
                .set('profile_id', 5) 
                .send();

            expect(response.status).toBe(200);
            expect(response.body.id).toBe(contractId);
            expect(response.body.ContractorId).toBe(5);
        });

        // Invalid contract 
        it('should return 200 and contract details with valid contract and contractor profile ID', async () => {
            let contractId = 20;
            const response = await request(app)
                .get(`/api/contracts/${contractId}`)
                .set('profile_id', 5) 
                .send();

            expect(response.status).toBe(500); 
            expect(response.body.message).toBe('NotFoundError: Contract not found or not accessible');
        });
    });



    // Test for Active Contracts
    describe('GET /api/contracts', () => {

        // Missing or invalid profile_id
        it('should return 400 if profile_id is missing or invalid', async () => {
            const response = await request(app)
            .get('/api/contracts')
            .send();

            expect(response.status).toBe(400); 
            expect(response.body.message).toBe('Missing or invalid profile_id in header');
        });

        // Invalid profile_id (ensure this doesn't exist in the database)
        it('should return 401 if profile is not found', async () => {
            const response = await request(app)
            .get('/api/contracts')
            .set('profile_id', 9) 
            .send();

            expect(response.status).toBe(401); 
            expect(response.body.message).toBe('Unauthorized: Profile not found');
        });


        // Valid client profile_id 
        it('should return 200 and active contracts for client profile', async () => {
            const response = await request(app)
            .get('/api/contracts')
            .set('profile_id', 1) 
            .send();

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0); // At least 1 active contract for the client
            expect(response.body[0].ClientId).toBe(1);

        });


        // Valid contractor profile_id 
        it('should return 200 and active contracts for contractor profile', async () => {
            const response = await request(app)
            .get('/api/contracts')
            .set('profile_id', 6) 
            .send();

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0); // At least 1 active contract for the contractor
            expect(response.body[0].ContractorId).toBe(6);

        }); 

    });

});
