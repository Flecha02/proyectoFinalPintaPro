const pool = require('../config/database');

async function listarCategorias(req, res) {
    try {
        const [rows] = await pool.query('SELECT * FROM Categoria');
        res.json({ status: 'success', data: rows });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function listarMedidas(req, res) {
    try {
        const [rows] = await pool.query('SELECT * FROM MedidaPresentacion');
        res.json({ status: 'success', data: rows });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

module.exports = {
    listarCategorias,
    listarMedidas
};