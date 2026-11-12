const { crearOrdenCompra, obtenerOrdenesCompra, obtenerOrdenCompraPorId, registrarIngresoBodega} = require('../models/compra.model');

// --- ÓRDENES DE COMPRA ---
async function registrarOrden(req, res) {
    try {
        const { idProveedor, idUsuario, detalles } = req.body;
        if (!idProveedor || !idUsuario || !detalles || !Array.isArray(detalles) || detalles.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Faltan datos obligatorios para la orden de compra o el detalle está vacío.'
            });
        }
        for (const item of detalles) {
            if (!item.idProducto || item.cantidadSolicitada === undefined || item.precioAcordado === undefined) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Cada ítem de la orden debe incluir idProducto, cantidadSolicitada y precioAcordado.'
                });
            }
            const cant = Number(item.cantidadSolicitada);
            if (isNaN(cant) || !Number.isInteger(cant) || cant <= 0) {
                return res.status(400).json({
                    status: 'error',
                    message: `La cantidad solicitada para cada producto debe ser un número entero mayor a cero (recibido: ${item.cantidadSolicitada}).`
                });
            }
        }
        const idOrdenCompra = await crearOrdenCompra(idProveedor, idUsuario, detalles);
        res.status(201).json({
            status: 'success',
            message: 'Orden de compra creada correctamente.',
            data: { idOrdenCompra }
        });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
}

async function listarOrdenes(req, res) {
    try {
        const ordenes = await obtenerOrdenesCompra();
        res.json({ status: 'success', data: ordenes });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function buscarOrdenPorId(req, res) {
    try {
        const { id } = req.params;
        const orden = await obtenerOrdenCompraPorId(id);
        if (!orden) {
            return res.status(404).json({ status: 'error', message: 'Orden de compra no encontrada.' });
        }
        res.json({ status: 'success', data: orden });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

// --- INGRESO A BODEGA ---
async function recibirIngresoBodega(req, res) {
    try {
        const { idOrdenCompra, idUsuario, numeroDocumentoEntrega, lotesIngreso } = req.body;
        if (!idUsuario || !lotesIngreso || !Array.isArray(lotesIngreso) || lotesIngreso.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Faltan campos obligatorios para registrar el ingreso a bodega.'
            });
        }

        const lotesConCantidad = lotesIngreso.filter((item) => Number(item.cantidadRecibida) > 0);
        if (lotesConCantidad.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Debes indicar al menos un producto con cantidad recibida mayor a cero.'
            });
        }

        for (const item of lotesConCantidad) {
            if (!item.idProducto || !item.idUbicacionBodega || !item.codigoLote || !item.costoUnitario) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Cada lote recibido debe especificar idProducto, idUbicacionBodega, codigoLote y costoUnitario.'
                });
            }
            const cant = Number(item.cantidadRecibida);
            if (isNaN(cant) || !Number.isInteger(cant) || cant <= 0) {
                return res.status(400).json({
                    status: 'error',
                    message: `La cantidad recibida debe ser un número entero mayor a cero (recibido: ${item.cantidadRecibida}).`
                });
            }
        }

        const docEntrega = (numeroDocumentoEntrega && String(numeroDocumentoEntrega).trim())
            ? String(numeroDocumentoEntrega).trim()
            : `ING-${idOrdenCompra ? `OC${idOrdenCompra}` : 'REC'}-${Date.now().toString().slice(-6)}`;

        const idIngresoBodega = await registrarIngresoBodega(
            idOrdenCompra,
            idUsuario,
            docEntrega,
            lotesConCantidad
        );

        res.status(201).json({
            status: 'success',
            message: 'Ingreso a bodega registrado correctamente y stock de inventario actualizado.',
            data: { idIngresoBodega }
        });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
}
module.exports = {
    registrarOrden,
    listarOrdenes,
    buscarOrdenPorId,
    recibirIngresoBodega
};