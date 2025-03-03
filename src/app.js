const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('./model')
const apiRoutes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

// User API routes
app.use('/api', apiRoutes);

// Global error handler
app.use(errorHandler);

module.exports = app;
