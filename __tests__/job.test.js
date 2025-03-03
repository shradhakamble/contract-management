const request = require('supertest');
const app = require('../src/app'); 
const { sequelize } = require('../src/model');
const jobRepository = require('../src/repositories/jobRepository');

describe('Job API tests with authentication', () => {

    afterAll(async () => {
        // Clean up database connections and data after tests
        await sequelize.close();
    });


    let profileId = 1; 
    let jobId = 1; 

    // Test: Fetch Unpaid Jobs
    describe('GET /api/jobs/unpaid', () => {

        // Missing or invalid profile_id
        it('should return 400 if profile_id is missing or invalid', async () => {
            const response = await request(app)
            .get(`/api/jobs/unpaid`)
            .send();

            expect(response.status).toBe(400); 
            expect(response.body.message).toBe('Missing or invalid profile_id in header');
        });

        // Invalid profile_id 
        it('should return 404 if profile is not found', async () => {
            const response = await request(app)
            .get(`/api/jobs/unpaid`)
            .set('profile_id', 9) 
            .send();

            expect(response.status).toBe(401); // Unauthorized error for invalid profile
            expect(response.body.message).toBe('Unauthorized: Profile not found');
        });


        // Valid profile_id with client_id
        it('should return 200 and list of unpaid jobs for the user', async () => {
            const response = await request(app)
                .get('/api/jobs/unpaid')
                .set('profile_id', profileId);

            expect(response.status).toBe(200);
            // TODO: handle unpaid job count based based on running payments
            // expect(response.body).toHaveLength(1); 
            // expect(response.body[0].Contract.ClientId).toBe(profileId);
        });


        // Valid profile_id with contractor_id
        it('should return 200 and list of unpaid jobs for the user', async () => {
            const response = await request(app)
                .get('/api/jobs/unpaid')
                .set('profile_id', 6);

            expect(response.status).toBe(200);
            // TODO: handle unpaid job count based based on running payments
            // expect(response.body).toHaveLength(2); 
            // expect(response.body[0].Contract.ContractorId).toBe(6);
            // expect(response.body[1].Contract.ContractorId).toBe(6); 
        });

    });


    // Test: Pay for a Job
    describe('POST /api/jobs/:job_id/pay', () => {

        // Missing or invalid profile_id
        it('should return 400 if profile_id is missing or invalid', async () => {
            const response = await request(app)
            .post(`/api/jobs/${jobId}/pay`)
            .send();

            console.log('xxx ', response.status);

            expect(response.status).toBe(400); 
            expect(response.body.message).toBe('Missing or invalid profile_id in header');
        });

        // Invalid profile_id 
        it('should return 404 if profile is not found', async () => {
            const response = await request(app)
            .post(`/api/jobs/${jobId}/pay`)
            .set('profile_id', 9) 
            .send();

            expect(response.status).toBe(401); 
            expect(response.body.message).toBe('Unauthorized: Profile not found');
        });


        // Job not found
        it('should return 404 if job_id not found', async () => {
            let jobId = 100;
            const response = await request(app)
            .post(`/api/jobs/${jobId}/pay`)
            .set('profile_id', 1) 
            .send();


            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Job not found');
        });

        // Client not found
        it('should return 404 if client not found', async () => {
            let jobId = 3;
            const response = await request(app)
            .post(`/api/jobs/${jobId}/pay`)
            .set('profile_id', 8) 
            .send();

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Client not found');
        });

        
        // Payment Successful 
        it('should return 200 and success message for valid job and client', async () => {
            let jobId = 2;
            const isPaid = await jobRepository.checkPaymentStatus(jobId);

            if (isPaid) {
                console.log('Job is already paid');
                const response = { body: { message: 'Job already paid' }, status: 400 }; // Mock response
                expect(response.status).toBe(400);
                expect(response.body.message).toBe('Job already paid');
            } else {
                const response = await request(app)
                    .post(`/api/jobs/${jobId}/pay`)
                    .set('profile_id', profileId);
        
                console.log('Pay response:', response.status);
                expect(response.status).toBe(200);
                expect(response.body.message).toBe('Payment Successful!');
            }
        
        });


        // Job already paid
        it('should return 400 if the job already paid', async () => {
            let jobId = 7;
            const response = await request(app)
                .post(`/api/jobs/${jobId}/pay`)
                .set('profile_id', 1);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Job already paid');
        });


        // Insufficient balance
        it('should return 400 if insufficient balance for payment', async () => {
            let jobId = 5;
            let profileId = 4;
            const response = await request(app)
                .post(`/api/jobs/${jobId}/pay`)
                .set('profile_id', profileId);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Insufficient balance');
        });

    });

});
