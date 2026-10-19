const pool = require('../config/database');

async function crearProveedor(nitProveedor, nombreProveedor, telefonoProveedor, direccionProveedor) {
    const query = `
        INSERT INTO Proveedor (nitProveedor, nombreProveedor, telefonoProveedor, direccionProveedor)
        VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [
        nitProveedor, 
        nombreProveedor, 
        telefonoProveedor, 
        direccionProveedor || null
    ]);
    return result.insertId;
}
async function obtenerProveedores() {
    const [rows] = await pool.query('SELECT * FROM Proveedor');
    return rows;
}
async function obtenerProveedorPorId(idProveedor) {
    const [rows] = await pool.query('SELECT * FROM Proveedor WHERE idProveedor = ?', [idProveedor]);
    return rows[0];
}
async function actualizarProveedor(idProveedor, nitProveedor, nombreProveedor, telefonoProveedor, direccionProveedor) {
    const query = `
        UPDATE Proveedor 
        SET nitProveedor = ?, nombreProveedor = ?, telefonoProveedor = ?, direccionProveedor = ? WHERE idProveedor = ?`;
    const [result] = await pool.query(query, [
        nitProveedor, 
        nombreProveedor, 
        telefonoProveedor, 
        direccionProveedor || null,
        idProveedor
    ]);
    return result.affectedRows;
}
async function eliminarProveedor(idProveedor) {
    const [result] = await pool.query('DELETE FROM Proveedor WHERE idProveedor = ?', [idProveedor]);
    return result.affectedRows;
}
module.exports = {
    crearProveedor,
    obtenerProveedores,
    obtenerProveedorPorId,
    actualizarProveedor,
    eliminarProveedor
};