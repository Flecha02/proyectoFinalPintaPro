// Validadores y expresiones regulares compartidas por los formularios del frontend.
// Deben mantenerse alineados con backend/src/utils/validators.js

export const REGEX = {
  NOMBRE_PERSONA: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,100}$/,
  CORREO_PINTAPRO: /^[a-zA-Z0-9._-]+@pintapro\.com$/,
  PASSWORD_SEGURA:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$/,
  NOMBRE_PRODUCTO: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,100}$/,
  CODIGO_PRODUCTO: /^[a-zA-Z0-9-]{3,20}$/,
  NOMBRE_CLIENTE: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.,]{2,150}$/,
  NIT: /^(CF|C\/F|[0-9]{5,12}-?[0-9kK])$/i,
  TELEFONO: /^[0-9]{4}-?[0-9]{4}$/,
  CODIGO_LOTE: /^[a-zA-Z0-9-]{2,30}$/,
  CANTIDAD_ENTERA: /^[1-9]\d*$/,
  PRECIO_DECIMAL: /^\d+(\.\d{1,2})?$/,
  FECHA_ISO: /^\d{4}-\d{2}-\d{2}$/,
  TARJETA: /^\d{15,16}$/,
} as const;

export const MENSAJES = {
  NOMBRE_PERSONA:
    'El nombre solo puede contener letras, tildes, ñ y espacios (entre 2 y 100 caracteres).',
  CORREO_PINTAPRO:
    'El correo debe pertenecer al dominio corporativo @pintapro.com (ej. juan.perez@pintapro.com).',
  PASSWORD_SEGURA:
    'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo (@$!%*?&.#_-).',
  NOMBRE_PRODUCTO:
    'Solo se permiten letras, tildes, ñ y espacios (entre 2 y 100 caracteres).',
  CODIGO_PRODUCTO:
    'El código debe tener entre 3 y 20 caracteres alfanuméricos o guiones, sin espacios ni símbolos.',
  NOMBRE_CLIENTE:
    'El nombre o razón social solo puede contener letras, tildes, ñ, espacios, puntos y comas (entre 2 y 150 caracteres).',
  NIT: 'El NIT debe ser "CF", "C/F" o un formato guatemalteco válido (ej. 1234567-8 o 1234567K).',
  TELEFONO: 'El teléfono debe tener exactamente 8 dígitos, opcionalmente con guion (ej. 5555-1234).',
  CODIGO_LOTE: 'El código de lote debe tener entre 2 y 30 caracteres alfanuméricos o guiones.',
  CANTIDAD_ENTERA: 'La cantidad debe ser un número entero mayor a 0.',
  PRECIO_DECIMAL: 'El monto debe ser un número decimal mayor a 0 (máximo 2 decimales).',
  FECHA_ISO: 'La fecha debe tener el formato YYYY-MM-DD.',
  RANGO_FECHAS: 'La fecha de inicio no puede ser posterior a la fecha de fin.',
  TARJETA: 'El número de tarjeta debe contener entre 15 y 16 dígitos numéricos.',
} as const;

export function normalizarTexto(valor: unknown): string {
  return typeof valor === 'string' ? valor.trim() : '';
}

export function normalizarCorreo(valor: unknown): string {
  return normalizarTexto(valor).toLowerCase();
}

export function esNombrePersona(valor: unknown): boolean {
  const texto = normalizarTexto(valor);
  return REGEX.NOMBRE_PERSONA.test(texto);
}

export function esCorreoPintapro(valor: unknown): boolean {
  const correo = normalizarCorreo(valor);
  return REGEX.CORREO_PINTAPRO.test(correo);
}

export function esPasswordSegura(valor: unknown): boolean {
  return typeof valor === 'string' && REGEX.PASSWORD_SEGURA.test(valor);
}

export function esNombreProducto(valor: unknown): boolean {
  const texto = normalizarTexto(valor);
  return REGEX.NOMBRE_PRODUCTO.test(texto);
}

export function esCodigoProducto(valor: unknown): boolean {
  const texto = normalizarTexto(valor);
  return REGEX.CODIGO_PRODUCTO.test(texto);
}

export function esNombreCliente(valor: unknown): boolean {
  const texto = normalizarTexto(valor);
  return REGEX.NOMBRE_CLIENTE.test(texto);
}

export function esNit(valor: unknown): boolean {
  const texto = normalizarTexto(valor).toUpperCase();
  return REGEX.NIT.test(texto);
}

export function esTelefono(valor: unknown): boolean {
  const texto = normalizarTexto(valor);
  return REGEX.TELEFONO.test(texto);
}

export function esCodigoLote(valor: unknown): boolean {
  const texto = normalizarTexto(valor);
  return REGEX.CODIGO_LOTE.test(texto);
}

export function esCantidadEntera(valor: unknown): boolean {
  const texto = typeof valor === 'number' ? String(valor) : normalizarTexto(valor);
  if (!REGEX.CANTIDAD_ENTERA.test(texto)) return false;
  const numero = Number(texto);
  return Number.isInteger(numero) && numero > 0;
}

export function esPrecioDecimal(valor: unknown): boolean {
  const texto = typeof valor === 'number' ? String(valor) : normalizarTexto(valor);
  if (!REGEX.PRECIO_DECIMAL.test(texto)) return false;
  return Number(texto) > 0;
}

export function esFechaISO(valor: unknown): boolean {
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

export function esRangoFechasValido(inicio: unknown, fin: unknown): boolean {
  const fechaInicio = normalizarTexto(inicio);
  const fechaFin = normalizarTexto(fin);
  return esFechaISO(fechaInicio) && esFechaISO(fechaFin) && fechaInicio <= fechaFin;
}

export function esTarjetaValida(valor: unknown): boolean {
  const soloNumeros = normalizarTexto(valor).replace(/\s|-/g, '');
  return REGEX.TARJETA.test(soloNumeros);
}
