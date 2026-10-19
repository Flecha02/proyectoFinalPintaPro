const pool = require('../config/database');

async function reporteVentasPorMedioPago(fechaInicio, fechaFin) {
    const query = `
        SELECT 
            mp.nombreMedioPago,
            COALESCE(SUM(pf.montoPago), 0) AS totalMonto
        FROM MedioPago mp
        LEFT JOIN PagoFactura pf ON mp.idMedioPago = pf.idMedioPago
        LEFT JOIN Factura f ON pf.idFactura = f.idFactura 
            AND f.fechaFactura BETWEEN ? AND ?
            AND f.estadoFactura = 'Emitida'
        GROUP BY mp.idMedioPago, mp.nombreMedioPago
    `;
    const [rows] = await pool.query(query, [`${fechaInicio} 00:00:00`, `${fechaFin} 23:59:59`]);
    
    // Total general
    const totalGeneral = rows.reduce((acc, r) => acc + parseFloat(r.totalMonto), 0);

    return {
        totalGeneral,
        desglose: rows
    };
}

async function reporteProductosMasIngresos(fechaInicio, fechaFin) {
    const query = `
        SELECT 
            p.nombreProducto,
            SUM(df.subtotalVendido) AS totalGenerado
        FROM DetalleFactura df
        INNER JOIN Factura f ON df.idFactura = f.idFactura
        INNER JOIN Producto p ON df.idProducto = p.idProducto
        WHERE f.fechaFactura BETWEEN ? AND ? AND f.estadoFactura = 'Emitida'
        GROUP BY p.idProducto, p.nombreProducto
        ORDER BY totalGenerado DESC
    `;
    const [rows] = await pool.query(query, [`${fechaInicio} 00:00:00`, `${fechaFin} 23:59:59`]);
    return rows;
}

async function reporteProductosMasVendidos(fechaInicio, fechaFin) {
    const query = `
        SELECT 
            p.nombreProducto,
            m.descripcionMedida,
            SUM(df.cantidadVendida) AS cantidadTotalVendida
        FROM DetalleFactura df
        INNER JOIN Factura f ON df.idFactura = f.idFactura
        INNER JOIN Producto p ON df.idProducto = p.idProducto
        INNER JOIN MedidaPresentacion m ON p.idMedidaPresentacion = m.idMedidaPresentacion
        WHERE f.fechaFactura BETWEEN ? AND ? AND f.estadoFactura = 'Emitida'
        GROUP BY p.idProducto, p.nombreProducto, m.descripcionMedida
        ORDER BY cantidadTotalVendida DESC
    `;
    const [rows] = await pool.query(query, [`${fechaInicio} 00:00:00`, `${fechaFin} 23:59:59`]);
    return rows;
}

async function reporteInventarioActual() {
    const query = `
        SELECT 
            p.codigoProducto,
            p.nombreProducto,
            p.marcaProducto,
            m.descripcionMedida,
            ub.estanteUbicacion,
            ub.pasilloUbicacion,
            iu.stockActual,
            iu.stockMinimo
        FROM InventarioUbicacion iu
        INNER JOIN Producto p ON iu.idProducto = p.idProducto
        INNER JOIN MedidaPresentacion m ON p.idMedidaPresentacion = m.idMedidaPresentacion
        INNER JOIN UbicacionBodega ub ON iu.idUbicacionBodega = ub.idUbicacionBodega
        ORDER BY p.nombreProducto ASC
    `;
    const [rows] = await pool.query(query);
    return rows;
}

async function reporteProductosMenosVendidos() {
    const query = `
        SELECT 
            p.nombreProducto,
            COALESCE(SUM(df.cantidadVendida), 0) AS totalVendido
        FROM Producto p
        LEFT JOIN DetalleFactura df ON p.idProducto = df.idProducto
        GROUP BY p.idProducto, p.nombreProducto
        ORDER BY totalVendido ASC
    `;
    const [rows] = await pool.query(query);
    return rows;
}

async function reporteProductosAgotados() {
    const query = `
        SELECT 
            p.codigoProducto,
            p.nombreProducto,
            p.marcaProducto,
            COALESCE(SUM(iu.stockActual), 0) AS stockTotalActual,
            COALESCE(MIN(iu.stockMinimo), 5) AS stockMinimo
        FROM Producto p
        LEFT JOIN InventarioUbicacion iu ON p.idProducto = iu.idProducto
        GROUP BY p.idProducto, p.codigoProducto, p.nombreProducto, p.marcaProducto
        HAVING stockTotalActual <= stockMinimo
    `;
    const [rows] = await pool.query(query);
    return rows;
}

module.exports = {
    reporteVentasPorMedioPago,
    reporteProductosMasIngresos,
    reporteProductosMasVendidos,
    reporteInventarioActual,
    reporteProductosMenosVendidos,
    reporteProductosAgotados
};