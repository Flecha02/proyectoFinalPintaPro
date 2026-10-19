const pool = require('../config/database');

async function registrarUsuario(idRol, nombreUsuario, correoUsuario, contraseniaUsuario) {
    // La contraseña se hashea directamente en la base de datos usando SHA2
    const query = `
        INSERT INTO Usuario (idRol, nombreUsuario, correoUsuario, contraseniaUsuario, estadoUsuario)
        VALUES (?, ?, ?, SHA2(?, 256), 1)
    `;
    const [result] = await pool.query(query, [idRol, nombreUsuario, correoUsuario, contraseniaUsuario]);
    return result.insertId;
}

async function validarLoginUsuario(correoUsuario, contraseniaUsuario) {
    // Ejecutamos el procedimiento almacenado que validará las credenciales
    const [rows] = await pool.query('CALL sp_ValidarLogin(?, ?)', [correoUsuario, contraseniaUsuario]);
    // MySQL devuelve los resultados del SP en la primera posición del array
    return rows[0]; 
}

module.exports = {
    registrarUsuario,
    validarLoginUsuario
};