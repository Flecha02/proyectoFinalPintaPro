const app = require('./src/app');
require('dotenv').config();
const PUERTO = process.env.PORT || 4000;
const pool = require('./src/config/database');

async function iniciarAplicacion() {
    try {
        const connection = await pool.getConnection();
        connection.release();
        
        console.log("Conexion a la base de datos establecida");
        app.listen(PUERTO, () => console.log("AHORA ESTAMOS EN PINTAPRO EN EL PUERTO: " + PUERTO));
    } catch (e) {
        console.error("Hay un error: " + e);
    }
}

iniciarAplicacion();