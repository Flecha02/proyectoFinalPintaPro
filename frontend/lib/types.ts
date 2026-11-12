// Tipos e interfaces globales para PintaPro

export type RolUsuario = 'DIGITADOR' | 'CAJERO' | 'GERENTE' | 'ADMIN' | 'ADMINISTRADOR';

export interface UsuarioSesion {
  idUsuario: number;
  nombreUsuario: string;
  correoUsuario: string;
  rol: RolUsuario | string;
}

export interface Categoria {
  idCategoria: number;
  nombreCategoria: string;
}

export interface MedidaPresentacion {
  idMedidaPresentacion: number;
  descripcionMedida: string;
}

export interface UbicacionBodega {
  idUbicacionBodega: number;
  estanteUbicacion: string;
  pasilloUbicacion: string;
  descripcionUbicacion?: string;
}

export interface Producto {
  idProducto: number;
  codigoProducto: string;
  nombreProducto: string;
  nombreCategoria: string;
  marcaProducto: string;
  colorProducto: string | null;
  descripcionMedida: string;
  precioVentaProducto: number;
  idCategoria?: number;
  idMedidaPresentacion?: number;
}

export interface Cliente {
  idCliente: number;
  nitCliente: string;
  nombreCliente: string;
  telefonoCliente: string | null;
  direccionCliente: string | null;
}

export interface ItemCarrito extends Producto {
  cantidad: number;
}

export interface DetalleCotizacion {
  idDetalleCotizacion?: number;
  idCotizacion?: number;
  idProducto: number;
  codigoProducto?: string;
  nombreProducto?: string;
  descripcionMedida?: string;
  cantidadCotizada: number;
  precioCotizado: number;
  subtotalCotizado: number;
}

export interface Cotizacion {
  idCotizacion: number;
  idCliente: number;
  idUsuario: number;
  nombreCliente?: string;
  nitCliente?: string;
  nombreUsuario?: string;
  fechaCotizacion: string;
  totalCotizacion: number;
  estadoCotizacion: string;
  detalles?: DetalleCotizacion[];
}

export interface MedioPago {
  idMedioPago: number;
  nombreMedioPago: string;
}

export interface DetalleFactura {
  idDetalleFactura?: number;
  idFactura?: number;
  idProducto: number;
  codigoProducto?: string;
  nombreProducto?: string;
  descripcionMedida?: string;
  cantidadVendida: number;
  precioVendido: number;
  subtotalVendido: number;
}

export interface PagoFactura {
  idPagoFactura?: number;
  idFactura?: number;
  idMedioPago: number;
  nombreMedioPago?: string;
  montoPago: number;
  referenciaPago?: string | null;
}

export interface Factura {
  idFactura: number;
  idCotizacion?: number | null;
  idCliente: number;
  idUsuario: number;
  numeroFactura: string;
  fechaFactura: string;
  totalFactura: number;
  estadoFactura: 'Emitida' | 'Anulada' | string;
  nombreCliente?: string;
  nitCliente?: string;
  direccionCliente?: string;
  nombreEmpleado?: string;
  detalles?: DetalleFactura[];
  pagos?: PagoFactura[];
}

export interface Proveedor {
  idProveedor: number;
  nitProveedor: string;
  nombreProveedor: string;
  telefonoProveedor: string | null;
  direccionProveedor: string | null;
}

export interface DetalleOrdenCompra {
  idDetalleOrdenCompra?: number;
  idOrdenCompra?: number;
  idProducto: number;
  nombreProducto?: string;
  codigoProducto?: string;
  cantidadSolicitada: number;
  precioAcordado: number;
  cantidadYaRecibida?: number;
  cantidadPendiente?: number;
}

export interface OrdenCompra {
  idOrdenCompra: number;
  idProveedor: number;
  nombreProveedor?: string;
  nitProveedor?: string;
  idUsuario?: number;
  nombreUsuario?: string;
  fechaOrdenCompra: string;
  estadoOrdenCompra: 'Pendiente' | 'Completada' | string;
  totalSolicitado?: number;
  totalRecibido?: number;
  detalles?: DetalleOrdenCompra[];
}

export interface LoteIngreso {
  idProducto: number;
  idUbicacionBodega: number;
  codigoLote: string;
  cantidadRecibida: number;
  costoUnitario: number;
}
