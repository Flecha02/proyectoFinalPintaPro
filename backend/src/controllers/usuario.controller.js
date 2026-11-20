const {
    registrarUsuario,
    validarLoginUsuario,
    obtenerUsuarios,
    obtenerRoles,
    obtenerRolPorId
} = require('../models/usuario.model');
const {
    MENSAJES,
    normalizarTexto,
    normalizarCorreo,
    esNombrePersona,
    esCorreoPintapro,
    esPasswordSegura
} = require('../utils/validators');

async function registrar(req, res) {
    try {
        const idRol = Number(req.body.idRol);
        const nombreUsuario = normalizarTexto(req.body.nombreUsuario);
        const correoUsuario = normalizarCorreo(req.body.correoUsuario);
        const contraseniaUsuario = req.body.contraseniaUsuario;

        if (!idRol || !Number.isInteger(idRol) || idRol <= 0) {
            return res.status(400).json({ status: 'error', message: 'Debes seleccionar un rol válido para el usuario.' });
        }

        if (!esNombrePersona(nombreUsuario)) {
            return res.status(400).json({ status: 'error', message: MENSAJES.NOMBRE_PERSONA });
        }

        if (!esCorreoPintapro(correoUsuario)) {
            return res.status(400).json({ status: 'error', message: MENSAJES.CORREO_PINTAPRO });
        }

        if (!esPasswordSegura(contraseniaUsuario)) {
            return res.status(400).json({ status: 'error', message: MENSAJES.PASSWORD_SEGURA });
        }

        const rol = await obtenerRolPorId(idRol);
        if (!rol) {
            return res.status(400).json({ status: 'error', message: 'El rol seleccionado no existe.' });
        }

        const idUsuario = await registrarUsuario(idRol, nombreUsuario, correoUsuario, contraseniaUsuario);
        res.status(201).json({
            status: 'success',
            message: 'Usuario registrado exitosamente',
            data: {
                idUsuario,
                idRol,
                nombreUsuario,
                correoUsuario,
                nombreRol: rol.nombreRol
            }
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                status: 'error',
                message: 'Ya existe un usuario registrado con este correo corporativo.'
            });
        }
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function login(req, res) {
    try {
        const correoUsuario = normalizarCorreo(req.body.correoUsuario);
        const contraseniaUsuario = req.body.contraseniaUsuario;

        if (!esCorreoPintapro(correoUsuario) || typeof contraseniaUsuario !== 'string' || contraseniaUsuario.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Debes ingresar un correo corporativo @pintapro.com y una contraseña.'
            });
        }

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

async function listar(req, res) {
    try {
        const usuarios = await obtenerUsuarios();
        res.json({ status: 'success', data: usuarios });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function listarRoles(req, res) {
    try {
        const roles = await obtenerRoles();
        res.json({ status: 'success', data: roles });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

module.exports = {
    registrar,
    login,
    listar,
    listarRoles
};
