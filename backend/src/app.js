const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger-output.json');

//Traemos nuetras rutas al app
const usuarioRoutes = require('./routes/usuario.route')
const clienteRoutes = require('./routes/cliente.route')
const productoRoutes = require('./routes/producto.route')
const catalogoRoutes = require('./routes/catalogo.route')
const proveedorRoutes = require('./routes/proveedor.route')
const compraRoutes = require('./routes/compra.route')
const ventaRoutes = require('./routes/venta.routes')
const reporteRoutes = require('./routes/reporte.route')

const app = express();
// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
    res.json({ status: 'success', message: 'API PintaPro disponible' });
});

app.use('/api/usuarios', usuarioRoutes)
app.use('/api/clientes', clienteRoutes)
app.use('/api/productos', productoRoutes)
app.use('/api/catalogos', catalogoRoutes)
app.use('/api/proveedores', proveedorRoutes)
app.use('/api/compras', compraRoutes)
app.use('/api/ventas', ventaRoutes)
app.use('/api/reportes', reporteRoutes)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = app;