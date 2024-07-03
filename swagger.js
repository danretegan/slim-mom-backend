const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "API documentation using Swagger",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./routes/api/*.js"], // Calea către fișierele cu rute
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };

/**
 * Pornește serverul și accesează documentația API la adresa:
 *  http://localhost:3000/api-docs.
 */
