const request = require('supertest');
const app = require('../src/app'); 


describe('Admin Best Profession and Best Client API Test', () => {

    // Test for `/api/admin/best-profession`
    describe('GET /api/admin/best-profession', () => {

        // Best profession
        it('should return 200 and the best profession within the date range', async () => {
            const response = await request(app)
                .get('/api/admin/best-profession')
                .query({ start: '2020-01-01', end: '2026-12-31' });
        
            console.log('payload : ', response.body);
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('bestProfession');
            expect(response.body.bestProfession).toBeInstanceOf(Array);
            expect(response.body.bestProfession.length).toBe(1);  
            
            expect(response.body.bestProfession[0]).toMatchObject({
                profession: "Programmer"
            });
        });
        

        // Invalid date
        it('should return 400 if date range is invalid', async () => {
            const response = await request(app)
                .get('/api/admin/best-profession')
                .query({ start: '2024-12-31', end: '2023-12-31' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Start date must be earlier than or equal to the end date.');
        });


        // Invalid date
        it('should return 400 if date range is invalid', async () => {
            const response = await request(app)
                .get('/api/admin/best-profession')
                .query({ start: '2024-12-XX', end: '2023-12-31' });

            console.log('admin ', response.status);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Invalid date format. Use YYYY-MM-DD.');
        });

    });


    // Test for `/api/admin/best-clients`
    describe('GET /api/admin/best-clients', () => {

        // Best Client, limit 3
        it('should return 200 and the best clients within the date range', async () => {
            const response = await request(app)
                .get('/api/admin/best-clients')
                .query({ start: '2020-01-01', end: '2026-12-31', limit: 3 });
        
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('bestClients');
            expect(response.body.bestClients).toBeInstanceOf(Array);
        
            // Ensure the array length matches the limit
            expect(response.body.bestClients.length).toBe(3);
    
        });


        // Best Client, default limit 2
        it('should return 200 and the best clients within the date range', async () => {
            const response = await request(app)
                .get('/api/admin/best-clients')
                .query({ start: '2020-01-01', end: '2026-12-31' });
        
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('bestClients');
            expect(response.body.bestClients).toBeInstanceOf(Array);
        
            // Ensure the array length matches to the default limit 2
            expect(response.body.bestClients.length).toBe(2);
    
        });
                    

        // Invalid date range
        it('should return 400 if date range is invalid', async () => {
            const response = await request(app)
            .get('/api/admin/best-clients')
            .query({ start: '2024-12-31', end: '2023-12-31' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Start date must be earlier than or equal to the end date.');
        });


        // Invalid date format
        it('should return 400 if date range is invalid', async () => {
            const response = await request(app)
            .get('/api/admin/best-clients')
            .query({ start: '2024-12-XX', end: '2023-12-31' });

            console.log('admin ', response.status);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Invalid date format. Use YYYY-MM-DD.');
        });


        // Invalid limit
        it('should return 400 if limit is invalid', async () => {
            const response = await request(app)
                .get('/api/admin/best-clients')
                .query({ start: '2023-01-01', end: '2023-12-31', limit: -1 });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Limit must be a positive integer.');
        });

    });

});
