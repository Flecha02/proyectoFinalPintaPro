const pool = require('../config/database');

// --- ÓRDENES DE COMPRA ---
async function crearOrdenCompra(idProveedor, idUsuario, detalles) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Validar que las cantidades solicitadas sean enteros positivos
        for (const item of detalles) {
            const cant = Number(item.cantidadSolicitada);
            if (!Number.isInteger(cant) || cant <= 0) {
                throw new Error(`La cantidad solicitada debe ser un número entero mayor a cero (recibido: ${item.cantidadSolicitada}).`);
            }
        }

        // 2. Crear cabecera de Orden de Compra
        const queryOrden = `
            INSERT INTO OrdenCompra (idProveedor, idUsuario, estadoOrdenCompra)
            VALUES (?, ?, 'Pendiente')
        `;
        const [resOrden] = await connection.query(queryOrden, [idProveedor, idUsuario]);
        const idOrdenCompra = resOrden.insertId;

        // 3. Insertar detalles de la orden
        const queryDetalle = `
            INSERT INTO DetalleOrdenCompra (idOrdenCompra, idProducto, cantidadSolicitada, precioAcordado)
            VALUES (?, ?, ?, ?)
        `;
        for (const item of detalles) {
            await connection.query(queryDetalle, [
                idOrdenCompra, 
                item.idProducto, 
                Math.round(Number(item.cantidadSolicitada)), 
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
        SELECT 
            o.*, 
            p.nombreProveedor, 
            p.nitProveedor, 
            u.nombreUsuario,
            COALESCE((
                SELECT SUM(d.cantidadSolicitada) 
                FROM DetalleOrdenCompra d 
                WHERE d.idOrdenCompra = o.idOrdenCompra
            ), 0) AS totalSolicitado,
            COALESCE((
                SELECT SUM(dib.cantidadRecibida)
                FROM IngresoBodega ib
                INNER JOIN DetalleIngresoBodega dib ON ib.idIngresoBodega = dib.idIngresoBodega
                WHERE ib.idOrdenCompra = o.idOrdenCompra
            ), 0) AS totalRecibido
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
        SELECT 
            d.*, 
            pr.nombreProducto, 
            pr.codigoProducto, 
            m.descripcionMedida,
            COALESCE((
                SELECT SUM(dib.cantidadRecibida)
                FROM IngresoBodega ib
                INNER JOIN DetalleIngresoBodega dib ON ib.idIngresoBodega = dib.idIngresoBodega
                INNER JOIN LoteInventario l ON dib.idLoteInventario = l.idLoteInventario
                WHERE ib.idOrdenCompra = d.idOrdenCompra AND l.idProducto = d.idProducto
            ), 0) AS cantidadYaRecibida,
            GREATEST(0, d.cantidadSolicitada - COALESCE((
                SELECT SUM(dib.cantidadRecibida)
                FROM IngresoBodega ib
                INNER JOIN DetalleIngresoBodega dib ON ib.idIngresoBodega = dib.idIngresoBodega
                INNER JOIN LoteInventario l ON dib.idLoteInventario = l.idLoteInventario
                WHERE ib.idOrdenCompra = d.idOrdenCompra AND l.idProducto = d.idProducto
            ), 0)) AS cantidadPendiente
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

// --- INGRESO A BODEGA (CON ENTREGAS PARCIALES Y NÚMEROS ENTEROS) ---
async function registrarIngresoBodega(idOrdenCompra, idUsuario, numeroDocumentoEntrega, lotesIngreso) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Filtrar solo los productos que se reciben en este envío (cantidad > 0)
        const lotesValidos = lotesIngreso.filter((l) => Number(l.cantidadRecibida) > 0);

        if (lotesValidos.length === 0) {
            throw new Error('Debes indicar al menos un producto con cantidad recibida mayor a cero.');
        }

        // 2. Validar que todas las cantidades sean números enteros
        for (const item of lotesValidos) {
            const cant = Number(item.cantidadRecibida);
            if (!Number.isInteger(cant) || cant <= 0) {
                throw new Error(`La cantidad recibida para el producto debe ser un número entero mayor a cero (recibido: ${item.cantidadRecibida}).`);
            }
        }

        // 3. Si viene de una orden de compra, validar que no supere la cantidad pendiente
        if (idOrdenCompra) {
            for (const item of lotesValidos) {
                const queryPendiente = `
                    SELECT 
                        d.cantidadSolicitada,
                        COALESCE((
                            SELECT SUM(dib.cantidadRecibida)
                            FROM IngresoBodega ib
                            INNER JOIN DetalleIngresoBodega dib ON ib.idIngresoBodega = dib.idIngresoBodega
                            INNER JOIN LoteInventario l ON dib.idLoteInventario = l.idLoteInventario
                            WHERE ib.idOrdenCompra = d.idOrdenCompra AND l.idProducto = d.idProducto
                        ), 0) AS cantidadYaRecibida
                    FROM DetalleOrdenCompra d
                    WHERE d.idOrdenCompra = ? AND d.idProducto = ?
                `;
                const [checkRows] = await connection.query(queryPendiente, [idOrdenCompra, item.idProducto]);
                if (checkRows.length > 0) {
                    const solicitada = Number(checkRows[0].cantidadSolicitada);
                    const yaRecibida = Number(checkRows[0].cantidadYaRecibida);
                    const pendiente = Math.max(0, solicitada - yaRecibida);
                    if (Number(item.cantidadRecibida) > pendiente) {
                        throw new Error(`La cantidad recibida (${item.cantidadRecibida}) supera la cantidad pendiente (${pendiente}) para el producto.`);
                    }
                }
            }
        }

        // 4. Insertar cabecera de Ingreso a Bodega
        const docFinal = (numeroDocumentoEntrega && String(numeroDocumentoEntrega).trim())
            ? String(numeroDocumentoEntrega).trim()
            : `ING-${idOrdenCompra ? `OC${idOrdenCompra}` : 'REC'}-${Date.now().toString().slice(-6)}`;

        const queryIngreso = `
            INSERT INTO IngresoBodega (idOrdenCompra, idUsuario, numeroDocumentoEntrega)
            VALUES (?, ?, ?)
        `;
        const [resIngreso] = await connection.query(queryIngreso, [
            idOrdenCompra || null, 
            idUsuario, 
            docFinal
        ]);
        const idIngresoBodega = resIngreso.insertId;

        // 5. Procesar cada lote recibido (Crear Lote + Actualizar Stock)
        for (const item of lotesValidos) {
            const cantRecibida = Math.round(Number(item.cantidadRecibida));

            // A. Crear registro en LoteInventario
            const queryLote = `
                INSERT INTO LoteInventario (idProducto, idUbicacionBodega, codigoLote, cantidadInicialLote, cantidadDisponibleLote, costoUnitarioLote)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const [resLote] = await connection.query(queryLote, [
                item.idProducto,
                item.idUbicacionBodega,
                item.codigoLote,
                cantRecibida,
                cantRecibida,
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
                cantRecibida,
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
                await connection.query(queryUpdateStock, [cantRecibida, existente[0].idInventarioUbicacion]);
            } else {
                const queryInsertStock = `
                    INSERT INTO InventarioUbicacion (idProducto, idUbicacionBodega, stockActual, stockMinimo)
                    VALUES (?, ?, ?, ?)
                `;
                await connection.query(queryInsertStock, [
                    item.idProducto, 
                    item.idUbicacionBodega, 
                    cantRecibida, 
                    item.stockMinimo || 5
                ]);
            }
        }

        // 6. Si viene de una Orden de Compra, actualizar su estado a 'Completada' o mantener 'Pendiente'
        if (idOrdenCompra) {
            const queryVerificarCompletada = `
                SELECT COUNT(*) AS incompletos
                FROM DetalleOrdenCompra d
                WHERE d.idOrdenCompra = ?
                  AND d.cantidadSolicitada > (
                      SELECT COALESCE(SUM(dib.cantidadRecibida), 0)
                      FROM IngresoBodega ib
                      INNER JOIN DetalleIngresoBodega dib ON ib.idIngresoBodega = dib.idIngresoBodega
                      INNER JOIN LoteInventario l ON dib.idLoteInventario = l.idLoteInventario
                      WHERE ib.idOrdenCompra = d.idOrdenCompra AND l.idProducto = d.idProducto
                  )
            `;
            const [rowsIncompletos] = await connection.query(queryVerificarCompletada, [idOrdenCompra]);
            const estaCompletada = rowsIncompletos[0].incompletos === 0;

            const nuevoEstado = estaCompletada ? 'Completada' : 'Pendiente';

            await connection.query(
                'UPDATE OrdenCompra SET estadoOrdenCompra = ? WHERE idOrdenCompra = ?',
                [nuevoEstado, idOrdenCompra]
            );
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