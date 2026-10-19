const pool = require('../config/database');

async function crearProducto(idCategoria, idMedidaPresentacion, codigoProducto, nombreProducto, marcaProducto, colorProducto, precioVentaProducto) {
    const query = `
        INSERT INTO Producto (idCategoria, idMedidaPresentacion, codigoProducto, nombreProducto, marcaProducto, colorProducto, precioVentaProducto)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [
        idCategoria, 
        idMedidaPresentacion, 
        codigoProducto, 
        nombreProducto, 
        marcaProducto, 
        colorProducto || null, 
        precioVentaProducto
    ]);
    return result.insertId;
}

async function obtenerProductos() {
    const query = `
        SELECT p.*, c.nombreCategoria, m.descripcionMedida
        FROM Producto p
        INNER JOIN Categoria c ON p.idCategoria = c.idCategoria
        INNER JOIN MedidaPresentacion m ON p.idMedidaPresentacion = m.idMedidaPresentacion
    `;
    const [rows] = await pool.query(query);
    return rows;
}

async function obtenerProductoPorId(idProducto) {
    const query = `
        SELECT p.*, c.nombreCategoria, m.descripcionMedida
        FROM Producto p
        INNER JOIN Categoria c ON p.idCategoria = c.idCategoria
        INNER JOIN MedidaPresentacion m ON p.idMedidaPresentacion = m.idMedidaPresentacion
        WHERE p.idProducto = ?
    `;
    const [rows] = await pool.query(query, [idProducto]);
    return rows[0];
}

async function actualizarProducto(idProducto, idCategoria, idMedidaPresentacion, codigoProducto, nombreProducto, marcaProducto, colorProducto, precioVentaProducto) {
    const query = `
        UPDATE Producto 
        SET idCategoria = ?, idMedidaPresentacion = ?, codigoProducto = ?, nombreProducto = ?, marcaProducto = ?, colorProducto = ?, precioVentaProducto = ?
        WHERE idProducto = ?
    `;
    const [result] = await pool.query(query, [
        idCategoria, 
        idMedidaPresentacion, 
        codigoProducto, 
        nombreProducto, 
        marcaProducto, 
        colorProducto || null, 
        precioVentaProducto, 
        idProducto
    ]);
    return result.affectedRows;
}

async function eliminarProducto(idProducto) {
    const [result] = await pool.query('DELETE FROM Producto WHERE idProducto = ?', [idProducto]);
    return result.affectedRows;
}

module.exports = {
    crearProducto,
    obtenerProductos,
    obtenerProductoPorId,
    actualizarProducto,
    eliminarProducto
};