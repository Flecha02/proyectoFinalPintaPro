const pool = require('../config/database');

async function crearCliente(nitCliente, nombreCliente, telefonoCliente, direccionCliente) {
    const query = `
        INSERT INTO Cliente (nitCliente, nombreCliente, telefonoCliente, direccionCliente)
        VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [
        nitCliente, 
        nombreCliente, 
        telefonoCliente || null, 
        direccionCliente || null
    ]);
    return result.insertId;
}

// Esta función maneja ambas cosas: si no mandas criterio, trae todos; si mandas criterio, filtra.
async function obtenerClientes(criterio) {
    if (!criterio || criterio.trim() === '') {
        const [rows] = await pool.query('SELECT * FROM Cliente');
        return rows;
    }
    const patron = `%${criterio.trim()}%`;
    const query = `
        SELECT * FROM Cliente 
        WHERE nitCliente LIKE ? OR nombreCliente LIKE ?
    `;
    const [rows] = await pool.query(query, [patron, patron]);
    return rows;
}

async function obtenerClientePorId(idCliente) {
    const [rows] = await pool.query('SELECT * FROM Cliente WHERE idCliente = ?', [idCliente]);
    return rows[0];
}

async function actualizarCliente(idCliente, nitCliente, nombreCliente, telefonoCliente, direccionCliente) {
    const query = `
        UPDATE Cliente 
        SET nitCliente = ?, nombreCliente = ?, telefonoCliente = ?, direccionCliente = ?
        WHERE idCliente = ?
    `;
    const [result] = await pool.query(query, [
        nitCliente, 
        nombreCliente, 
        telefonoCliente || null, 
        direccionCliente || null, 
        idCliente
    ]);
    return result.affectedRows;
}

async function eliminarCliente(idCliente) {
    const [result] = await pool.query('DELETE FROM Cliente WHERE idCliente = ?', [idCliente]);
    return result.affectedRows;
}

module.exports = {
    crearCliente,
    obtenerClientes,
    obtenerClientePorId,
    actualizarCliente,
    eliminarCliente
};