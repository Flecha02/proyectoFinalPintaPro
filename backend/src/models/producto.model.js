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
    // 1. Validar que no tenga facturas emitidas (integridad contable y fiscal)
    const [facturas] = await pool.query('SELECT COUNT(*) AS c FROM DetalleFactura WHERE idProducto = ?', [idProducto]);
    if (facturas[0].c > 0) {
        throw new Error('No es posible eliminar el producto porque ya cuenta con facturas de venta emitidas en su historial contable.');
    }

    // 2. Validar que no tenga lotes de inventario o stock
    const [lotes] = await pool.query('SELECT COUNT(*) AS c FROM LoteInventario WHERE idProducto = ?', [idProducto]);
    if (lotes[0].c > 0) {
        throw new Error('No es posible eliminar el producto porque tiene lotes o inventario registrado en bodega.');
    }

    // 3. Validar que no tenga órdenes de compra a proveedores
    const [compras] = await pool.query('SELECT COUNT(*) AS c FROM DetalleOrdenCompra WHERE idProducto = ?', [idProducto]);
    if (compras[0].c > 0) {
        throw new Error('No es posible eliminar el producto porque está vinculado a órdenes de compra a proveedores.');
    }

    // 4. Si solo tiene cotizaciones temporales (presupuestos), limpiar esas líneas para permitir la eliminación
    await pool.query('DELETE FROM DetalleCotizacion WHERE idProducto = ?', [idProducto]);

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