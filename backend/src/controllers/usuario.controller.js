const { registrarUsuario, validarLoginUsuario } = require('../models/usuario.model');

async function registrar(req, res) {
    try {
        const { idRol, nombreUsuario, correoUsuario, contraseniaUsuario } = req.body;
        const idUsuario = await registrarUsuario(idRol, nombreUsuario, correoUsuario, contraseniaUsuario);
        res.status(201).json({
            status: 'success',
            message: 'Usuario registrado exitosamente',
            data: { idUsuario }
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function login(req, res) {
    try {
        const { correoUsuario, contraseniaUsuario } = req.body;
        // Llamamos al modelo que ejecuta el SP
        const resultado = await validarLoginUsuario(correoUsuario, contraseniaUsuario);
        if (!resultado || resultado.length === 0) {
            return res.status(401).json({ 
                status: 'error', 
                message: 'Correo o contraseña incorrectos, o usuario inactivo' 
            });
        }
        const usuarioEncontrado = resultado[0];
        // Retornamos los datos y el rol para que React se encargue de redirigir según corresponda:
        // - DIGITADOR: CRUDs, entregas, actualización de stocks
        // - GERENTE: Reportes, CRUD de usuarios
        // - CAJERO: Cobros, cotizaciones
        res.json({
            status: 'success',
            message: 'Login exitoso',
            data: {
                idUsuario: usuarioEncontrado.idUsuario,
                nombreUsuario: usuarioEncontrado.nombreUsuario,
                correoUsuario: usuarioEncontrado.correoUsuario,
                rol: usuarioEncontrado.nombreRol.toUpperCase() // DIGITADOR, CAJERO o GERENTE
            }
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

module.exports = {
    registrar,
    login
};