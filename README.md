
## Data Models

### Profile

A profile can be either a `client` or a `contractor`.
clients create contracts with contractors. contractor does jobs for clients and get paid.
Each profile has a balance property.

### Contract

A contract between and client and a contractor.
Contracts have 3 statuses, `new`, `in_progress`, `terminated`. contracts are considered active only when in status `in_progress`
Contracts group jobs within them.

### Job

contractor get paid for jobs by clients under a certain contract.



## Technical Notes

- The server is running with [nodemon](https://nodemon.io/) which will automatically restart for you when you modify and save a file.

- The database provider is SQLite, which will store data in a file local to your repository called `database.sqlite3`. The ORM [Sequelize](http://docs.sequelizejs.com/) is on top of it. 


# How to Run

1. Unzip the module and navigate to the folder.
2. Run `npm install` to install all dependencies.
3. Next, run `npm run seed` to seed the local SQLite database. **Warning: This will drop the database if it exists**. The database will be stored in a local file named `database.sqlite3`.
4. Then run `npm start` to start both the server and the React client.
5. To run the unit test cases, run `npm test`.

-------------------------------------------------------------------------------------------


# Implementation Highlights


## Exception Handling

The exception handling module establishes a `centralized mechanism` for managing errors in the application, providing clarity and consistency in error responses. Key components include the AppError base class, which allows for the creation of specific error types like `NotFoundError`, `UnauthorizedError`, and `BadRequestError`, each associated with relevant HTTP status codes. The errorHandler middleware captures and processes errors, ensuring that structured responses are sent to clients while logging unhandled exceptions for debugging. 

This approach enhances maintainability, improves debugging, and provides a user-friendly experience by delivering clear and meaningful error messages.



## Validation

This validation module provides a structured approach to ensure data integrity and compliance with business rules throughout the application. The `Validator` class contains static methods that validate various aspects of user inputs, including payment conditions, deposit amounts, date ranges, and limits. 

- Key functionalities include checking 

    - if a job has already been paid or if the client has sufficient balance before processing payments 
    - ensuring the deposit amount does not exceed 25% of the total amount due for unpaid jobs, and 
    - validating date inputs to confirm they are in the correct format and logically ordered. 
    
By implementing these validation checks, the module enhances data accuracy, prevents errors, and improves overall application robustness.



## Routes

The Express application employs a modular routing structure to enhance clarity, maintainability, and organization of API endpoints. 

In `app.js`, middleware for JSON parsing and Sequelize configuration is set up, with all API routes prefixed under /api, allowing for a clear namespace. 
The `index.js` file registers specific route groups (contracts, jobs, balances, and admin) with corresponding base paths, ensuring related functionalities are easy to manage. 
Individual route files, like `contractRoutes.js`, define specific endpoints and utilize middleware (e.g., getProfile) to enforce common logic, promoting code reuse and separation of concerns. 

This structure streamlines development, making it easier to update, maintain, and extend the application while adhering to DRY principles.



## Transaction Management

Transaction management is essential for ensuring data integrity and consistency in applications that involve multiple database operations, especially in financial contexts. In this project, utilize Sequelize transactions for critical operations, such as processing job payments, to achieve atomicity, consistency, and isolation.

- `Atomicity` ensures that all operations within a transaction succeed or none are applied, preventing partial updates.
- `Consistency` maintains data validity by rolling back changes if an error occurs during the transaction.
- `Isolation` allows concurrent transactions to operate without interference, using row-level locks to prevent conflicts. 

This robust transaction management approach ensures our application can handle financial operations safely, providing users with confidence in the accuracy of their transactions.



## Unit Tests

Demonstrated unit test cases for various API endpoints, focusing on functionalities related to `contract management,` `balance deposits`, `job payments` and `admin statistics`. 
Using the `Supertest` library, tests are organized into specific describe blocks for clarity. Each test verifies expected outcomes for various scenarios, including `valid` and `invalid` input conditions, ensuring robust error handling and response validation. 

The tests cover responses for 

- the best profession and best clients APIs
- contract retrieval with proper authentication.
- job payment processes. 

Edge cases, such as invalid date formats and insufficient funds, are also addressed to ensure the integrity and reliability of the application. After executing the tests, database connections are closed to maintain a clean state, further enhancing test reliability.


## Authentication

The `getProfile` middleware is utilized in the contract routes to ensure user authentication for accessing contract-related information. 

If the `profile_id` is missing, invalid, or does not correspond to an existing profile, the middleware throws an appropriate error, which is passed to the centralized error handler. This middleware enhances security and ensures that only authenticated users can access specific routes throughout the application, such as fetching contracts or other user-specific resources. 
Additionally, comprehensive unit tests have been developed to ensure the reliability of the authentication logic implemented in this middleware.

-------------------------------------------------------------------------------------------


# API Designs and Flow

## 1. Contract by ID
The `getContractById` method retrieves a specific contract by its ID, ensuring the authenticated user is either the client or contractor associated with the contract. 
This functionality is exposed via the `GET /api/contracts/:id` endpoint.

- Flow:
    1. Extract Contract ID: The `contract` is obtained from the request parameters.
    2. Fetch User Profile: The profile of the authenticated user is retrieved from the request.
    3. Retrieve Contract: The `getContractById` service method is called, passing the `contract_id` and user `profile_id` to ensure that the contract belongs to the user.
    4. Handle Contract Not Found: If the contract does not exist or is not accessible, a `NotFoundError` is thrown.
    5. Return Contract Data: Upon successful retrieval, the contract data is returned in the response.




## 2. Active Contracts
The `getAllActiveContracts` method retrieves all active contracts associated with the authenticated user. 
This functionality is exposed via the `GET /api/contracts` endpoint.

- Flow:
    1. Fetch User Profile: The `profile` of the authenticated user is retrieved from the request.
    2. Retrieve Active Contracts: The getActiveContracts service method is called with the user `profile_id` to fetch all active contracts.
    3. Handle No Contracts Found: If no contracts are found, an empty array is returned.
    4. Return Active Contracts: Upon successful retrieval, the active contracts are returned in the response.




## 3. Fetching Unpaid Jobs 

- The `findAllUnpaidJobsByProfile` method queries jobs associated with the user where:
    - The contract status is in_progress.
    - The job is either unpaid (paid: null) or marked as unpaid (paid: false).
- This functionality is exposed via the `GET /api/jobs/unpaid` endpoint.




## 4. Paying for a Job

- The `payForJob` allows a client to pay for a specific job.
- This functionality is exposed via the `POST /api/jobs/:job_id/pay` endpoint.
- Flow:

    1. Fetch the `job`, `client`, and `contractor` details using repository methods.
    2. Validate the client type and ensure payment conditions are met using the Validator. 
       For cases like sufficient balance, job must exist and be unpaid, etc
    3. Perform the following updates within a transaction:
        - Deduct the job price from the client’s balance.
        - Add the job price to the contractor’s balance.
        - Mark the job as paid and record the payment date.
    4. `Commit` the transaction to finalize the updates.
    5. In case of failure, `rollback` the transaction.




## 5. Deposit Money

The depositMoney method allows a client to deposit funds into their account, ensuring compliance with business rules.
This functionality is exposed via the `POST /api/balances/deposit/:userId` endpoint.

- Flow:
    1. Fetch the Client Profile:
        The `findById` repository method retrieves the client profile associated with the provided userId.
        Ensures the profile exists and the user `type` is `client`.
    2. Fetch Unpaid Job Totals: 
        The `findDepositMoney`repository method calculates the total amount of all unpaid jobs for the client.
    3. Validate the deposit amount is within the allowable limit (25% of the unpaid jobs total).
    4. Update Balance:
        - Adds the deposit amount to the client's existing balance.
        - Persists the updated balance using the `updateBalance` repository method.
    5. Returns a success message "Deposit Successful." upon completing the deposit process.




## 6. Best Profession

The `getBestProfession` method identifies the profession that earned the highest total amount within a specified date range.
This functionality is exposed via the `GET /api/admin/best-profession` endpoint.

- Flow
    1. The `Validator.validateDateRange` utility ensures valid start and end dates are provided.
        - For cases like invalid date inputs.
    2. The `getProfessionEarnings` repository method aggregates job earnings grouped by profession.
    3. Only considers jobs marked as `paid`.
    4. Filters by the `paymentDate` within the provided date range.
    5. Groups by profession and sums the earnings, sorted in descending order, limit 1.
    6. Returns the best-performing profession along with its total earnings.




## 7. Best Client

The `getBestClients` method identifies the top clients who paid the most within a specified date range.
This functionality is exposed via the `GET /api/admin/best-clients endpoint`.

- Flow:
    1. The `Validator.validateDateRange` utility ensures valid start and end dates are provided. The `Validator.validateLimit` utility validates the limit parameter.
        - For cases like invalid date inputs and limits.
    2. The `getBestClients` repository method aggregates total payments made by clients.
    3. Only considers jobs marked as `paid`.
    4. Filters by the `paymentDate` within the provided date range.
    5. Groups payments by client and sums their total payments, sorted in descending order.
    6. Limits the number of results to the specified limit, limit 2 by default.
    7. Returns an array of clients with their IDs, full names, and total payments made.


All APIs in this project are designed with a clear separation of concerns, ensuring that each component is responsible for a specific functionality, which promotes easier maintenance and testing. Robust error handling mechanisms are implemented to capture and manage exceptions effectively, providing meaningful feedback to users and improving overall application stability. 

Transaction-safe operations are utilized, particularly in financial processes, to maintain data integrity and prevent inconsistencies. Additionally, adherence to SOLID principles enhances code organization, making the application more extensible and scalable for future enhancements. 
