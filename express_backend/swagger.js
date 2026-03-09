const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Team Task Management API',
      version: '1.0.0',
      description:
        'REST API for team task management: JWT auth, user profiles, project/task CRUD, membership, dashboard aggregation, and search/filter.',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Use: Authorization: Bearer <accessToken>',
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/routes/**/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
