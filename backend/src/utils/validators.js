// Validadores y expresiones regulares compartidas por los controladores del backend.
// Deben mantenerse alineados con frontend/lib/validators.ts

const REGEX = {
    NOMBRE_PERSONA: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,100}$/,
    CORREO_PINTAPRO: /^[a-zA-Z0-9._-]+@pintapro\.com$/,
    PASSWORD_SEGURA: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$/,
    NOMBRE_PRODUCTO: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,100}$/,
    CODIGO_PRODUCTO: /^[a-zA-Z0-9-]{3,20}$/,
    NOMBRE_CLIENTE: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.,]{2,150}$/,
    NIT: /^(CF|C\/F|[0-9]{5,12}-?[0-9kK])$/i,
    TELEFONO: /^[0-9]{4}-?[0-9]{4}$/,
    CODIGO_LOTE: /^[a-zA-Z0-9-]{2,30}$/,
    CANTIDAD_ENTERA: /^[1-9]\d*$/,
    PRECIO_DECIMAL: /^\d+(\.\d{1,2})?$/,
    FECHA_ISO: /^\d{4}-\d{2}-\d{2}$/,
    TARJETA: /^\d{15,16}$/
};

const MENSAJES = {
    NOMBRE_PERSONA: 'El nombre solo puede contener letras, tildes, ñ y espacios (entre 2 y 100 caracteres).',
    CORREO_PINTAPRO: 'El correo debe pertenecer al dominio corporativo @pintapro.com (ej. juan.perez@pintapro.com).',
    PASSWORD_SEGURA: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo (@$!%*?&.#_-).',
    NOMBRE_PRODUCTO: 'Solo se permiten letras, tildes, ñ y espacios (entre 2 y 100 caracteres).',
    CODIGO_PRODUCTO: 'El código debe tener entre 3 y 20 caracteres alfanuméricos o guiones, sin espacios ni símbolos.',
    NOMBRE_CLIENTE: 'El nombre o razón social solo puede contener letras, tildes, ñ, espacios, puntos y comas (entre 2 y 150 caracteres).',
    NIT: 'El NIT debe ser "CF", "C/F" o un formato guatemalteco válido (ej. 1234567-8 o 1234567K).',
    TELEFONO: 'El teléfono debe tener exactamente 8 dígitos, opcionalmente con guion (ej. 5555-1234).',
    CODIGO_LOTE: 'El código de lote debe tener entre 2 y 30 caracteres alfanuméricos o guiones.',
    CANTIDAD_ENTERA: 'La cantidad debe ser un número entero mayor a 0.',
    PRECIO_DECIMAL: 'El monto debe ser un número decimal mayor a 0 (máximo 2 decimales).',
    FECHA_ISO: 'La fecha debe tener el formato YYYY-MM-DD.',
    RANGO_FECHAS: 'La fecha de inicio no puede ser posterior a la fecha de fin.',
    TARJETA: 'El número de tarjeta debe contener entre 15 y 16 dígitos numéricos.'
};

function normalizarTexto(valor) {
    return typeof valor === 'string' ? valor.trim() : '';
}

function normalizarCorreo(valor) {
    return normalizarTexto(valor).toLowerCase();
}

function esNombrePersona(valor) {
    return REGEX.NOMBRE_PERSONA.test(normalizarTexto(valor));
}

function esCorreoPintapro(valor) {
    return REGEX.CORREO_PINTAPRO.test(normalizarCorreo(valor));
}

function esPasswordSegura(valor) {
    return typeof valor === 'string' && REGEX.PASSWORD_SEGURA.test(valor);
}

function esNombreProducto(valor) {
    return REGEX.NOMBRE_PRODUCTO.test(normalizarTexto(valor));
}

function esCodigoProducto(valor) {
    return REGEX.CODIGO_PRODUCTO.test(normalizarTexto(valor));
}

function esNombreCliente(valor) {
    return REGEX.NOMBRE_CLIENTE.test(normalizarTexto(valor));
}

function esNit(valor) {
    return REGEX.NIT.test(normalizarTexto(valor).toUpperCase());
}

function esTelefono(valor) {
    return REGEX.TELEFONO.test(normalizarTexto(valor));
}

function esCodigoLote(valor) {
    return REGEX.CODIGO_LOTE.test(normalizarTexto(valor));
}

function esCantidadEntera(valor) {
    const texto = typeof valor === 'number' ? String(valor) : normalizarTexto(valor);
    if (!REGEX.CANTIDAD_ENTERA.test(texto)) return false;
    const numero = Number(texto);
    return Number.isInteger(numero) && numero > 0;
}

function esPrecioDecimal(valor) {
    const texto = typeof valor === 'number' ? String(valor) : normalizarTexto(valor);
    if (!REGEX.PRECIO_DECIMAL.test(texto)) return false;
    return Number(texto) > 0;
}

function esFechaISO(valor) {
    const texto = normalizarTexto(valor);
    if (!REGEX.FECHA_ISO.test(texto)) return false;

    const [anio, mes, dia] = texto.split('-').map(Number);
    const fecha = new Date(Date.UTC(anio, mes - 1, dia));

    return (
        fecha.getUTCFullYear() === anio &&
        fecha.getUTCMonth() === mes - 1 &&
        fecha.getUTCDate() === dia
    );
}

function esRangoFechasValido(inicio, fin) {
    const fechaInicio = normalizarTexto(inicio);
    const fechaFin = normalizarTexto(fin);
    return esFechaISO(fechaInicio) && esFechaISO(fechaFin) && fechaInicio <= fechaFin;
}

module.exports = {
    REGEX,
    MENSAJES,
    normalizarTexto,
    normalizarCorreo,
    esNombrePersona,
    esCorreoPintapro,
    esPasswordSegura,
    esNombreProducto,
    esCodigoProducto,
    esNombreCliente,
    esNit,
    esTelefono,
    esCodigoLote,
    esCantidadEntera,
    esPrecioDecimal,
    esFechaISO,
    esRangoFechasValido
};
