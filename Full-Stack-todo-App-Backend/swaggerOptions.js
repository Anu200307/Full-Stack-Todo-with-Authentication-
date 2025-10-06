const swaggerJsdoc = require('swagger-jsdoc');
require("dotenv").config();

const PORT = process.env.PORT || 4000;

const options = {
  swaggerDefinition: {
    openapi: '3.0.0', 
    info: {
      title: 'My Express API',
      version: '1.0.0',
      description: 'A sample API for demonstration purposes',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`, 
      },
    ],
  },
  apis: ['./routes/*.js'], 
};

const specs = swaggerJsdoc(options);

module.exports = specs;