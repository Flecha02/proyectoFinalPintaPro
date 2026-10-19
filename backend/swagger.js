const swaggerAutogen = require('swagger-autogen')();

const doc = {
info: {
    title: 'API PintaPro Guatemala',
    description: 'Documentación interactiva de la API REST transaccional para PintaPro',
},
host: 'localhost:4000',
schemes: ['http'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./src/app.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);