const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'URL Shortener API',
      version: '1.0.0',
      description: 'A fast URL shortener with analytics, custom aliases, and expiry support.',
    },
    servers: [
      {
        url: process.env.BASE_URL || 'http://localhost:5000',
        description: 'Active server',
      },
    ],
  },
  apis: ['./src/routes/*.js'], // reads JSDoc comments from route files
};

module.exports = swaggerJsdoc(options);