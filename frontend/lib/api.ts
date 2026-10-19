const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      body && typeof body.message === 'string'
        ? body.message
        : `La solicitud falló (${response.status})`;
    throw new Error(message);
  }

  return body as T;
}

export interface LoginResponse {
  status: string;
  message: string;
  data: {
    idUsuario: number;
    nombreUsuario: string;
    correoUsuario: string;
    rol: string;
  };
}

export function iniciarSesion(
  correoUsuario: string,
  contraseniaUsuario: string,
) {
  return apiRequest<LoginResponse>('/usuarios/login', {
    method: 'POST',
    body: JSON.stringify({ correoUsuario, contraseniaUsuario }),
  });
}

export interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

export interface ClienteApi {
  idCliente: number;
  nitCliente: string;
  nombreCliente: string;
  telefonoCliente: string | null;
  direccionCliente: string | null;
}

export interface ProductoApi {
  idProducto: number;
  codigoProducto: string;
  nombreProducto: string;
  nombreCategoria: string;
  marcaProducto: string;
  colorProducto: string | null;
  descripcionMedida: string;
  precioVentaProducto: number | string;
}

export function listarProductos() {
  return apiRequest<ApiResponse<ProductoApi[]>>('/productos');
}

export function buscarClientes(busqueda: string) {
  return apiRequest<ApiResponse<ClienteApi[]>>(
    `/clientes?busqueda=${encodeURIComponent(busqueda)}`,
  );
}

export function registrarCliente(cliente: {
  nitCliente: string;
  nombreCliente: string;
  telefonoCliente: string;
  direccionCliente: string;
}) {
  return apiRequest<ApiResponse<{ idCliente: number }>>('/clientes', {
    method: 'POST',
    body: JSON.stringify(cliente),
  });
}

export function registrarCotizacion(cotizacion: {
  idCliente: number;
  idUsuario: number;
  totalCotizacion: number;
  detalles: Array<{
    idProducto: number;
    cantidadCotizada: number;
    precioCotizado: number;
    subtotalCotizado: number;
  }>;
}) {
  return apiRequest<ApiResponse<{ idCotizacion: number }>>('/ventas/cotizaciones', {
    method: 'POST',
    body: JSON.stringify(cotizacion),
  });
}

export function emitirFactura(factura: {
  idCotizacion?: number;
  idCliente: number;
  idUsuario: number;
  numeroFactura: string;
  totalFactura: number;
  detalles: Array<{
    idProducto: number;
    cantidadVendida: number;
    precioVendido: number;
    subtotalVendido: number;
  }>;
  pagos: Array<{
    idMedioPago: number;
    montoPago: number;
    referenciaPago?: string | null;
  }>;
}) {
  return apiRequest<ApiResponse<{ idFactura: number }>>('/ventas/facturas', {
    method: 'POST',
    body: JSON.stringify(factura),
  });
}

export interface FacturaImpresion {
  factura: Record<string, unknown>;
  detalles: Array<Record<string, unknown>>;
  pagos: Array<Record<string, unknown>>;
}

export function obtenerFacturaParaImpresion(idFactura: number) {
  return apiRequest<ApiResponse<FacturaImpresion>>(`/ventas/facturas/${idFactura}/impresion`);
}

export interface ProveedorApi {
  idProveedor: number;
  nitProveedor: string;
  nombreProveedor: string;
  telefonoProveedor: string | null;
  direccionProveedor: string | null;
}

export interface OrdenCompraApi {
  idOrdenCompra: number;
  idProveedor: number;
  estadoOrdenCompra: string;
  fechaOrdenCompra: string;
  nombreProveedor: string;
  detalles?: DetalleOrdenCompraApi[];
}

export interface DetalleOrdenCompraApi {
  idDetalleOrdenCompra: number;
  idProducto: number;
  cantidadSolicitada: number;
  precioAcordado: number | string;
  nombreProducto: string;
  codigoProducto: string;
  descripcionMedida: string;
}

export interface UbicacionApi {
  idUbicacionBodega: number;
  estanteUbicacion: string;
  pasilloUbicacion: string;
}

export function listarProveedores() {
  return apiRequest<ApiResponse<ProveedorApi[]>>('/proveedores');
}

export function registrarProveedor(proveedor: {
  nitProveedor: string;
  nombreProveedor: string;
  telefonoProveedor: string;
  direccionProveedor: string;
}) {
  return apiRequest<ApiResponse<{ idProveedor: number }>>('/proveedores', {
    method: 'POST',
    body: JSON.stringify(proveedor),
  });
}

export function registrarOrdenCompra(orden: {
  idProveedor: number;
  idUsuario: number;
  detalles: Array<{
    idProducto: number;
    cantidadSolicitada: number;
    precioAcordado: number;
  }>;
}) {
  return apiRequest<ApiResponse<{ idOrdenCompra: number }>>('/compras/ordenes', {
    method: 'POST',
    body: JSON.stringify(orden),
  });
}

export function listarOrdenesCompra() {
  return apiRequest<ApiResponse<OrdenCompraApi[]>>('/compras/ordenes');
}

export function obtenerOrdenCompra(idOrdenCompra: number) {
  return apiRequest<ApiResponse<OrdenCompraApi>>(`/compras/ordenes/${idOrdenCompra}`);
}

export function registrarIngresoBodega(ingreso: {
  idOrdenCompra: number;
  idUsuario: number;
  numeroDocumentoEntrega: string;
  lotesIngreso: Array<{
    idProducto: number;
    idUbicacionBodega: number;
    codigoLote: string;
    cantidadRecibida: number;
    costoUnitario: number;
  }>;
}) {
  return apiRequest<ApiResponse<{ idIngresoBodega: number }>>('/compras/ingresos-bodega', {
    method: 'POST',
    body: JSON.stringify(ingreso),
  });
}

export function listarUbicacionesBodega() {
  return apiRequest<ApiResponse<UbicacionApi[]>>('/catalogos/ubicaciones-bodega');
}
