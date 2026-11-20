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

async function obtenerUsuarios() {
    const query = `
        SELECT
            u.idUsuario,
            u.idRol,
            u.nombreUsuario,
            u.correoUsuario,
            u.estadoUsuario,
            r.nombreRol
        FROM Usuario u
        INNER JOIN Rol r ON u.idRol = r.idRol
        ORDER BY u.idUsuario DESC
    `;
    const [rows] = await pool.query(query);
    return rows;
}

async function obtenerRoles() {
    const query = `
        SELECT idRol, nombreRol, descripcionRol
        FROM Rol
        ORDER BY idRol
    `;
    const [rows] = await pool.query(query);
    return rows;
}

async function obtenerRolPorId(idRol) {
    const [rows] = await pool.query(
        'SELECT idRol, nombreRol, descripcionRol FROM Rol WHERE idRol = ?',
        [idRol]
    );
    return rows[0] || null;
}

module.exports = {
    registrarUsuario,
    validarLoginUsuario,
    obtenerUsuarios,
    obtenerRoles,
    obtenerRolPorId
};
