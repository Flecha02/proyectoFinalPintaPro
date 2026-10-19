const pool = require('../config/database');
// --- ÓRDENES DE COMPRA ---
async function crearOrdenCompra(idProveedor, idUsuario, detalles) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        // 1. Crear cabecera de Orden de Compra
        const queryOrden = `
            INSERT INTO OrdenCompra (idProveedor, idUsuario, estadoOrdenCompra)
            VALUES (?, ?, 'Pendiente')
        `;
        const [resOrden] = await connection.query(queryOrden, [idProveedor, idUsuario]);
        const idOrdenCompra = resOrden.insertId;
        // 2. Insertar detalles de la orden
        const queryDetalle = `
            INSERT INTO DetalleOrdenCompra (idOrdenCompra, idProducto, cantidadSolicitada, precioAcordado)
            VALUES (?, ?, ?, ?)
        `;
        for (const item of detalles) {
            await connection.query(queryDetalle, [
                idOrdenCompra, 
                item.idProducto, 
                item.cantidadSolicitada, 
                item.precioAcordado
            ]);
        }
        await connection.commit();
        return idOrdenCompra;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}
async function obtenerOrdenesCompra() {
    const query = `
        SELECT o.*, p.nombreProveedor, p.nitProveedor, u.nombreUsuario
        FROM OrdenCompra o
        INNER JOIN Proveedor p ON o.idProveedor = p.idProveedor
        INNER JOIN Usuario u ON o.idUsuario = u.idUsuario
        ORDER BY o.fechaOrdenCompra DESC
    `;
    const [rows] = await pool.query(query);
    return rows;
}
async function obtenerOrdenCompraPorId(idOrdenCompra) {
    const queryOrden = `
        SELECT o.*, p.nombreProveedor, p.nitProveedor, u.nombreUsuario
        FROM OrdenCompra o
        INNER JOIN Proveedor p ON o.idProveedor = p.idProveedor
        INNER JOIN Usuario u ON o.idUsuario = u.idUsuario
        WHERE o.idOrdenCompra = ?
    `;
    const [ordenes] = await pool.query(queryOrden, [idOrdenCompra]);
    if (ordenes.length === 0) return null;
    const queryDetalle = `
        SELECT d.*, pr.nombreProducto, pr.codigoProducto, m.descripcionMedida
        FROM DetalleOrdenCompra d
        INNER JOIN Producto pr ON d.idProducto = pr.idProducto
        INNER JOIN MedidaPresentacion m ON pr.idMedidaPresentacion = m.idMedidaPresentacion
        WHERE d.idOrdenCompra = ?
    `;
    const [detalles] = await pool.query(queryDetalle, [idOrdenCompra]);
    return {
        ...ordenes[0],
        detalles
    };
}
// --- INGRESO A BODEGA (CON LOTES DE INVENTARIO) ---
async function registrarIngresoBodega(idOrdenCompra, idUsuario, numeroDocumentoEntrega, lotesIngreso) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        // 1. Insertar cabecera de Ingreso a Bodega
        const queryIngreso = `
            INSERT INTO IngresoBodega (idOrdenCompra, idUsuario, numeroDocumentoEntrega)
            VALUES (?, ?, ?)
        `;
        const [resIngreso] = await connection.query(queryIngreso, [
            idOrdenCompra || null, 
            idUsuario, 
            numeroDocumentoEntrega
        ]);
        const idIngresoBodega = resIngreso.insertId;
        // 2. Procesar cada producto ingresado (Crear Lote + Actualizar Stock)
        for (const item of lotesIngreso) {
            // A. Crear registro en LoteInventario
            const queryLote = `
                INSERT INTO LoteInventario (idProducto, idUbicacionBodega, codigoLote, cantidadInicialLote, cantidadDisponibleLote, costoUnitarioLote)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const [resLote] = await connection.query(queryLote, [
                item.idProducto,
                item.idUbicacionBodega,
                item.codigoLote,
                item.cantidadRecibida,
                item.cantidadRecibida, // Al inicio, disponible = recibida
                item.costoUnitario
            ]);
            const idLoteInventario = resLote.insertId;
            // B. Registrar en DetalleIngresoBodega
            const queryDetalleIngreso = `
                INSERT INTO DetalleIngresoBodega (idIngresoBodega, idLoteInventario, cantidadRecibida, costoUnitario)
                VALUES (?, ?, ?, ?)
            `;
            await connection.query(queryDetalleIngreso, [
                idIngresoBodega,
                idLoteInventario,
                item.cantidadRecibida,
                item.costoUnitario
            ]);
            // C. Actualizar o Insertar en InventarioUbicacion
            const queryStockExistente = `
                SELECT idInventarioUbicacion, stockActual 
                FROM InventarioUbicacion 
                WHERE idProducto = ? AND idUbicacionBodega = ?
            `;
            const [existente] = await connection.query(queryStockExistente, [item.idProducto, item.idUbicacionBodega]);
            if (existente.length > 0) {
                const queryUpdateStock = `
                    UPDATE InventarioUbicacion 
                    SET stockActual = stockActual + ? 
                    WHERE idInventarioUbicacion = ?
                `;
                await connection.query(queryUpdateStock, [item.cantidadRecibida, existente[0].idInventarioUbicacion]);
            } else {
                const queryInsertStock = `
                    INSERT INTO InventarioUbicacion (idProducto, idUbicacionBodega, stockActual, stockMinimo)
                    VALUES (?, ?, ?, ?)
                `;
                await connection.query(queryInsertStock, [
                    item.idProducto, 
                    item.idUbicacionBodega, 
                    item.cantidadRecibida, 
                    item.stockMinimo || 5 // Valor por defecto para stock mínimo
                ]);
            }
        }
        // 3. Si viene de una Orden de Compra, actualizar su estado
        if (idOrdenCompra) {
            const queryUpdateOrden = `
                UPDATE OrdenCompra 
                SET estadoOrdenCompra = 'Completada' 
                WHERE idOrdenCompra = ?
            `;
            await connection.query(queryUpdateOrden, [idOrdenCompra]);
        }
        await connection.commit();
        return idIngresoBodega;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}
module.exports = {
    crearOrdenCompra,
    obtenerOrdenesCompra,
    obtenerOrdenCompraPorId,
    registrarIngresoBodega
};