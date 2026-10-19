const pool = require('../config/database');

// --- COTIZACIONES ---

async function crearCotizacion(idCliente, idUsuario, totalCotizacion, detalles) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const queryCot = `
            INSERT INTO Cotizacion (idCliente, idUsuario, totalCotizacion, estadoCotizacion)
            VALUES (?, ?, ?, 'Vigente')
        `;
        const [resCot] = await connection.query(queryCot, [idCliente, idUsuario, totalCotizacion]);
        const idCotizacion = resCot.insertId;

        const queryDet = `
            INSERT INTO DetalleCotizacion (idCotizacion, idProducto, cantidadCotizada, precioCotizado, subtotalCotizado)
            VALUES (?, ?, ?, ?, ?)
        `;
        for (const item of detalles) {
            await connection.query(queryDet, [
                idCotizacion,
                item.idProducto,
                item.cantidadCotizada,
                item.precioCotizado,
                item.subtotalCotizado
            ]);
        }

        await connection.commit();
        return idCotizacion;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function obtenerCotizaciones() {
    const query = `
        SELECT c.*, cl.nombreCliente, cl.nitCliente, u.nombreUsuario
        FROM Cotizacion c
        INNER JOIN Cliente cl ON c.idCliente = cl.idCliente
        INNER JOIN Usuario u ON c.idUsuario = u.idUsuario
        ORDER BY c.fechaCotizacion DESC
    `;
    const [rows] = await pool.query(query);
    return rows;
}

async function obtenerCotizacionPorId(idCotizacion) {
    const queryCot = `
        SELECT c.*, cl.nombreCliente, cl.nitCliente, u.nombreUsuario
        FROM Cotizacion c
        INNER JOIN Cliente cl ON c.idCliente = cl.idCliente
        INNER JOIN Usuario u ON c.idUsuario = u.idUsuario
        WHERE c.idCotizacion = ?
    `;
    const [cotizaciones] = await pool.query(queryCot, [idCotizacion]);
    if (cotizaciones.length === 0) return null;

    const queryDet = `
        SELECT d.*, p.nombreProducto, p.codigoProducto, m.descripcionMedida
        FROM DetalleCotizacion d
        INNER JOIN Producto p ON d.idProducto = p.idProducto
        INNER JOIN MedidaPresentacion m ON p.idMedidaPresentacion = m.idMedidaPresentacion
        WHERE d.idCotizacion = ?
    `;
    const [detalles] = await pool.query(queryDet, [idCotizacion]);

    return {
        ...cotizaciones[0],
        detalles
    };
}

// --- FACTURACIÓN CON LÓGICA FIFO ---

async function procesarFacturaFIFO(idCotizacion, idCliente, idUsuario, numeroFactura, totalFactura, detalles, pagos) {
    const connection = await pool.getConnection();
    try {
        const jsonDetalles = JSON.stringify(detalles);
        const jsonPagos = JSON.stringify(pagos);

        const query = `
            CALL sp_ProcesarFacturaFIFO(?, ?, ?, ?, ?, ?, ?, @p_idFactura);
        `;
        
        await connection.query(query, [
            idCotizacion || null,
            idCliente,
            idUsuario,
            numeroFactura,
            totalFactura,
            jsonDetalles,
            jsonPagos
        ]);

        const [resultId] = await connection.query('SELECT @p_idFactura AS idFactura');
        return resultId[0].idFactura;
    } catch (error) {
        throw error;
    } finally {
        connection.release();
    }
}

async function obtenerFacturaPorIdImpresion(idFactura) {
    const queryCabecera = `
        SELECT f.*, cl.nombreCliente, cl.nitCliente, cl.direccionCliente, u.nombreUsuario AS nombreEmpleado
        FROM Factura f
        INNER JOIN Cliente cl ON f.idCliente = cl.idCliente
        INNER JOIN Usuario u ON f.idUsuario = u.idUsuario
        WHERE f.idFactura = ? OR f.numeroFactura = ?
    `;
    const [facturas] = await pool.query(queryCabecera, [idFactura, idFactura]);
    if (facturas.length === 0) return null;

    const fact = facturas[0];

    const queryDetalles = `
        SELECT df.*, p.nombreProducto, p.codigoProducto, m.descripcionMedida
        FROM DetalleFactura df
        INNER JOIN Producto p ON df.idProducto = p.idProducto
        INNER JOIN MedidaPresentacion m ON p.idMedidaPresentacion = m.idMedidaPresentacion
        WHERE df.idFactura = ?
    `;
    const [detalles] = await pool.query(queryDetalles, [fact.idFactura]);

    const queryPagos = `
        SELECT pf.*, mp.nombreMedioPago
        FROM PagoFactura pf
        INNER JOIN MedioPago mp ON pf.idMedioPago = mp.idMedioPago
        WHERE pf.idFactura = ?
    `;
    const [pagos] = await pool.query(queryPagos, [fact.idFactura]);

    return {
        factura: fact,
        detalles,
        pagos
    };
}
module.exports = {
    crearCotizacion,
    obtenerCotizaciones,
    obtenerCotizacionPorId,
    procesarFacturaFIFO,
    obtenerFacturaPorIdImpresion
};