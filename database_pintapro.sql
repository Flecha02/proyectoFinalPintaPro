-- Creación e inicialización de la base de datos PintaPro
CREATE DATABASE IF NOT EXISTS `PintaPro` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `PintaPro`;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `rol`
--

DROP TABLE IF EXISTS `rol`;
CREATE TABLE `rol` (
  `idRol` int(11) NOT NULL AUTO_INCREMENT,
  `nombreRol` varchar(50) NOT NULL,
  `descripcionRol` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idRol`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

LOCK TABLES `rol` WRITE;
INSERT INTO `rol` VALUES 
(1,'Digitador','Encargado de alimentar el sistema, compras, inventario y actualizar stocks'),
(2,'Cajero','Encargado de cobros, cotizaciones y facturación'),
(3,'Gerente','Encargado de observar reportes y administrar usuarios');
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
CREATE TABLE `usuario` (
  `idUsuario` int(11) NOT NULL AUTO_INCREMENT,
  `idRol` int(11) NOT NULL,
  `nombreUsuario` varchar(100) NOT NULL,
  `correoUsuario` varchar(100) NOT NULL,
  `contraseniaUsuario` varbinary(64) NOT NULL,
  `estadoUsuario` tinyint(4) NOT NULL DEFAULT 1,
  PRIMARY KEY (`idUsuario`),
  UNIQUE KEY `correoUsuario` (`correoUsuario`),
  KEY `fkUsuarioRol` (`idRol`),
  CONSTRAINT `fkUsuarioRol` FOREIGN KEY (`idRol`) REFERENCES `rol` (`idRol`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

LOCK TABLES `usuario` WRITE;
INSERT INTO `usuario` VALUES 
(1,1,'Carlos Soch','carlos.soch@pintapro.com','b460b1982188f11d175f60ed670027e1afdd16558919fe47023ecd38329e0b7f',1),
(2,3,'Diego Pineda','pineda@pintapro.com','240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',1),
(3,1,'Shoniro','shoniro@pintapro.com','240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',1),
(4,2,'javier','javier@pintapro.com','240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',1);
UNLOCK TABLES;

--
-- Table structure for table `categoria`
--

DROP TABLE IF EXISTS `categoria`;
CREATE TABLE `categoria` (
  `idCategoria` int(11) NOT NULL AUTO_INCREMENT,
  `nombreCategoria` varchar(50) NOT NULL,
  PRIMARY KEY (`idCategoria`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

LOCK TABLES `categoria` WRITE;
INSERT INTO `categoria` VALUES (1,'Accesorios'),(2,'Solventes'),(3,'Pinturas'),(4,'Barnices');
UNLOCK TABLES;

--
-- Table structure for table `medidapresentacion`
--

DROP TABLE IF EXISTS `medidapresentacion`;
CREATE TABLE `medidapresentacion` (
  `idMedidaPresentacion` int(11) NOT NULL AUTO_INCREMENT,
  `descripcionMedida` varchar(50) NOT NULL,
  PRIMARY KEY (`idMedidaPresentacion`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

LOCK TABLES `medidapresentacion` WRITE;
INSERT INTO `medidapresentacion` VALUES (1,'1/32 de galón'),(2,'1/16 de galón'),(3,'1/1/8 de galón'),(4,'1/4 de galón'),(5,'1/2 de galón'),(6,'1 galón'),(7,'1 cubeta 5 galones'),(8,'Unidad');
UNLOCK TABLES;

--
-- Table structure for table `mediopago`
--

DROP TABLE IF EXISTS `mediopago`;
CREATE TABLE `mediopago` (
  `idMedioPago` int(11) NOT NULL AUTO_INCREMENT,
  `nombreMedioPago` varchar(50) NOT NULL,
  PRIMARY KEY (`idMedioPago`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

LOCK TABLES `mediopago` WRITE;
INSERT INTO `mediopago` VALUES (1,'Efectivo'),(2,'Tarjeta de Crédito / Débito'),(3,'Transferencia Bancaria');
UNLOCK TABLES;

--
-- Table structure for table `ubicacionbodega`
--

DROP TABLE IF EXISTS `ubicacionbodega`;
CREATE TABLE `ubicacionbodega` (
  `idUbicacionBodega` int(11) NOT NULL AUTO_INCREMENT,
  `estanteUbicacion` varchar(50) NOT NULL,
  `pasilloUbicacion` varchar(50) NOT NULL,
  `descripcionUbicacion` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`idUbicacionBodega`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

LOCK TABLES `ubicacionbodega` WRITE;
INSERT INTO `ubicacionbodega` VALUES (1,'Estante A','Pasillo 1','Zona de Pinturas Vinílicas y Esmaltes'),(2,'Estante B','Pasillo 2','Zona de Solventes y Barnices'),(3,'Estante C','Pasillo 3','Zona de Accesorios y Herramientas de Pintura');
UNLOCK TABLES;

--
-- Table structure for table `cliente`
--

DROP TABLE IF EXISTS `cliente`;
CREATE TABLE `cliente` (
  `idCliente` int(11) NOT NULL AUTO_INCREMENT,
  `nitCliente` varchar(20) NOT NULL,
  `nombreCliente` varchar(150) NOT NULL,
  `telefonoCliente` varchar(20) DEFAULT NULL,
  `direccionCliente` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idCliente`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

LOCK TABLES `cliente` WRITE;
INSERT INTO `cliente` VALUES 
(1,'123456-K','Carlos Soch','54219876','29 Avenidad B-23 Zona 1 Quetzaltenango'),
(2,'12428930','Cliente prueba','+502 4755 6224','Mazatenango, Zona 3'),
(4,'9876543-2','Constructora Los Cuchumatanes','+502 7761 1234','Diagonal 3, Zona 1 Quetzaltenango'),
(5,'CF','Consumidor Final',NULL,'Ciudad');
UNLOCK TABLES;

--
-- Table structure for table `proveedor`
--

DROP TABLE IF EXISTS `proveedor`;
CREATE TABLE `proveedor` (
  `idProveedor` int(11) NOT NULL AUTO_INCREMENT,
  `nitProveedor` varchar(20) NOT NULL,
  `nombreProveedor` varchar(150) NOT NULL,
  `telefonoProveedor` varchar(20) DEFAULT NULL,
  `direccionProveedor` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idProveedor`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

LOCK TABLES `proveedor` WRITE;
INSERT INTO `proveedor` VALUES 
(1,'876543-2','Distribuidora de Pinturas Celco S.A.','23456789','Zona 12, Ciudad de Guatemala'),
(2,'2345678900101','Pinceles y Brochas Indel','77612345','Quetzaltenango, Guatemala'),
(3,'543210-K','Herramientas Maria','+502 54321098','Zunil, Quetzaltenango');
UNLOCK TABLES;

--
-- Table structure for table `producto`
--

DROP TABLE IF EXISTS `producto`;
CREATE TABLE `producto` (
  `idProducto` int(11) NOT NULL AUTO_INCREMENT,
  `idCategoria` int(11) NOT NULL,
  `idMedidaPresentacion` int(11) NOT NULL,
  `codigoProducto` varchar(50) NOT NULL,
  `nombreProducto` varchar(150) NOT NULL,
  `marcaProducto` varchar(50) NOT NULL,
  `colorProducto` varchar(50) DEFAULT NULL,
  `precioVentaProducto` decimal(12,2) NOT NULL,
  PRIMARY KEY (`idProducto`),
  UNIQUE KEY `codigoProducto` (`codigoProducto`),
  KEY `fkProductoCategoria` (`idCategoria`),
  KEY `fkProductoMedida` (`idMedidaPresentacion`),
  CONSTRAINT `fkProductoCategoria` FOREIGN KEY (`idCategoria`) REFERENCES `categoria` (`idCategoria`),
  CONSTRAINT `fkProductoMedida` FOREIGN KEY (`idMedidaPresentacion`) REFERENCES `medidapresentacion` (`idMedidaPresentacion`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

LOCK TABLES `producto` WRITE;
INSERT INTO `producto` VALUES 
(1,1,8,'ACC-BRO-001','Brocha Cerda Sintética 3 Pulgadas','Truper Premium','N/A',42.00),
(2,2,6,'SOL-AGU-001','Aguarrás Mineral Desodorizado','PintaPro Lux','Transparente',85.00),
(4,1,1,'PINT-EPIX-01','Pintura Epóxica Industrial Alto Tráfico','PintaPro','Gris Industrial',200.00),
(5,1,1,'FA1\"[=','Pintura','Panita','Azul',6.00);
UNLOCK TABLES;

--
-- Table structure for table `ordencompra`
--

DROP TABLE IF EXISTS `ordencompra`;
CREATE TABLE `ordencompra` (
  `idOrdenCompra` int(11) NOT NULL AUTO_INCREMENT,
  `idProveedor` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `fechaOrdenCompra` datetime NOT NULL DEFAULT current_timestamp(),
  `estadoOrdenCompra` varchar(30) NOT NULL DEFAULT 'Pendiente',
  PRIMARY KEY (`idOrdenCompra`),
  KEY `fkOrdenProveedor` (`idProveedor`),
  KEY `fkOrdenUsuario` (`idUsuario`),
  CONSTRAINT `fkOrdenProveedor` FOREIGN KEY (`idProveedor`) REFERENCES `proveedor` (`idProveedor`),
  CONSTRAINT `fkOrdenUsuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

LOCK TABLES `ordencompra` WRITE;
INSERT INTO `ordencompra` VALUES 
(2,1,1,'2026-10-16 22:35:24','Completada'),
(3,1,1,'2026-10-18 21:08:34','Completada'),
(4,3,2,'2026-10-19 06:58:24','Completada'),
(5,3,3,'2026-11-11 22:05:39','Completada');
UNLOCK TABLES;

--
-- Table structure for table `detalleordencompra`
--

DROP TABLE IF EXISTS `detalleordencompra`;
CREATE TABLE `detalleordencompra` (
  `idDetalleOrdenCompra` int(11) NOT NULL AUTO_INCREMENT,
  `idOrdenCompra` int(11) NOT NULL,
  `idProducto` int(11) NOT NULL,
  `cantidadSolicitada` decimal(12,2) NOT NULL,
  `precioAcordado` decimal(12,2) NOT NULL,
  PRIMARY KEY (`idDetalleOrdenCompra`),
  KEY `fkDetalleOrdenOrden` (`idOrdenCompra`),
  KEY `fkDetalleOrdenProducto` (`idProducto`),
  CONSTRAINT `fkDetalleOrdenOrden` FOREIGN KEY (`idOrdenCompra`) REFERENCES `ordencompra` (`idOrdenCompra`),
  CONSTRAINT `fkDetalleOrdenProducto` FOREIGN KEY (`idProducto`) REFERENCES `producto` (`idProducto`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

LOCK TABLES `detalleordencompra` WRITE;
INSERT INTO `detalleordencompra` VALUES 
(2,2,2,50.00,380.00),
(3,3,4,100.00,120.00),
(4,4,4,20.00,39.97),
(5,5,1,5.00,9.00);
UNLOCK TABLES;

--
-- Table structure for table `ingresobodega`
--

DROP TABLE IF EXISTS `ingresobodega`;
CREATE TABLE `ingresobodega` (
  `idIngresoBodega` int(11) NOT NULL AUTO_INCREMENT,
  `idOrdenCompra` int(11) DEFAULT NULL,
  `idUsuario` int(11) NOT NULL,
  `numeroDocumentoEntrega` varchar(50) NOT NULL,
  `fechaIngresoBodega` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`idIngresoBodega`),
  KEY `fkIngresoOrden` (`idOrdenCompra`),
  KEY `fkIngresoUsuario` (`idUsuario`),
  CONSTRAINT `fkIngresoOrden` FOREIGN KEY (`idOrdenCompra`) REFERENCES `ordencompra` (`idOrdenCompra`),
  CONSTRAINT `fkIngresoUsuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

LOCK TABLES `ingresobodega` WRITE;
INSERT INTO `ingresobodega` VALUES 
(4,2,1,'FAC-PROV-98765','2026-10-16 22:45:30'),
(5,3,1,'ENVIO-PARCIAL-01','2026-10-18 21:09:25'),
(6,3,1,'ENVIO-COMPLEMENTO-02','2026-10-18 21:10:12'),
(7,4,2,'314','2026-10-19 06:58:36'),
(8,5,3,'213','2026-11-11 22:06:01');
UNLOCK TABLES;

--
-- Table structure for table `loteinventario`
--

DROP TABLE IF EXISTS `loteinventario`;
CREATE TABLE `loteinventario` (
  `idLoteInventario` int(11) NOT NULL AUTO_INCREMENT,
  `idProducto` int(11) NOT NULL,
  `idUbicacionBodega` int(11) NOT NULL,
  `codigoLote` varchar(50) NOT NULL,
  `fechaIngresoLote` datetime NOT NULL DEFAULT current_timestamp(),
  `cantidadInicialLote` decimal(12,2) NOT NULL,
  `cantidadDisponibleLote` decimal(12,2) NOT NULL,
  `costoUnitarioLote` decimal(12,2) NOT NULL,
  PRIMARY KEY (`idLoteInventario`),
  KEY `fkLoteProducto` (`idProducto`),
  KEY `fkLoteUbicacion` (`idUbicacionBodega`),
  CONSTRAINT `fkLoteProducto` FOREIGN KEY (`idProducto`) REFERENCES `producto` (`idProducto`),
  CONSTRAINT `fkLoteUbicacion` FOREIGN KEY (`idUbicacionBodega`) REFERENCES `ubicacionbodega` (`idUbicacionBodega`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

LOCK TABLES `loteinventario` WRITE;
INSERT INTO `loteinventario` VALUES 
(1,2,1,'LOT-PIN-2026-01','2026-10-16 22:45:30',50.00,47.00,380.00),
(2,4,1,'LOTE-EPIX-2026-A','2026-10-18 21:09:25',75.00,0.00,120.00),
(3,4,1,'LOTE-EPIX-2026-B','2026-10-18 21:10:12',25.00,18.00,120.00),
(4,4,1,'3','2026-10-19 06:58:36',20.00,20.00,39.97),
(5,1,2,'1','2026-11-11 22:06:01',5.00,5.00,5.00);
UNLOCK TABLES;

--
-- Table structure for table `inventarioubicacion`
--

DROP TABLE IF EXISTS `inventarioubicacion`;
CREATE TABLE `inventarioubicacion` (
  `idInventarioUbicacion` int(11) NOT NULL AUTO_INCREMENT,
  `idProducto` int(11) NOT NULL,
  `idUbicacionBodega` int(11) NOT NULL,
  `stockActual` decimal(12,2) NOT NULL DEFAULT 0.00,
  `stockMinimo` decimal(12,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`idInventarioUbicacion`),
  UNIQUE KEY `UQ_Producto_Ubicacion` (`idProducto`,`idUbicacionBodega`),
  KEY `fkInventarioUbicacion` (`idUbicacionBodega`),
  CONSTRAINT `fkInventarioProd` FOREIGN KEY (`idProducto`) REFERENCES `producto` (`idProducto`),
  CONSTRAINT `fkInventarioUbicacion` FOREIGN KEY (`idUbicacionBodega`) REFERENCES `ubicacionbodega` (`idUbicacionBodega`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

LOCK TABLES `inventarioubicacion` WRITE;
INSERT INTO `inventarioubicacion` VALUES 
(1,2,1,47.00,10.00),
(2,4,1,38.00,10.00),
(3,1,2,5.00,5.00);
UNLOCK TABLES;

--
-- Table structure for table `detalleingresobodega`
--

DROP TABLE IF EXISTS `detalleingresobodega`;
CREATE TABLE `detalleingresobodega` (
  `idDetalleIngresoBodega` int(11) NOT NULL AUTO_INCREMENT,
  `idIngresoBodega` int(11) NOT NULL,
  `idLoteInventario` int(11) NOT NULL,
  `cantidadRecibida` decimal(12,2) NOT NULL,
  `costoUnitario` decimal(12,2) NOT NULL,
  PRIMARY KEY (`idDetalleIngresoBodega`),
  KEY `fkDetalleIngresoDoc` (`idIngresoBodega`),
  KEY `fkDetalleIngresoLote` (`idLoteInventario`),
  CONSTRAINT `fkDetalleIngresoDoc` FOREIGN KEY (`idIngresoBodega`) REFERENCES `ingresobodega` (`idIngresoBodega`),
  CONSTRAINT `fkDetalleIngresoLote` FOREIGN KEY (`idLoteInventario`) REFERENCES `loteinventario` (`idLoteInventario`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

LOCK TABLES `detalleingresobodega` WRITE;
INSERT INTO `detalleingresobodega` VALUES 
(1,4,1,50.00,380.00),
(2,5,2,75.00,120.00),
(3,6,3,25.00,120.00),
(4,7,4,20.00,39.97),
(5,8,5,5.00,5.00);
UNLOCK TABLES;

--
-- Table structure for table `cotizacion`
--

DROP TABLE IF EXISTS `cotizacion`;
CREATE TABLE `cotizacion` (
  `idCotizacion` int(11) NOT NULL AUTO_INCREMENT,
  `idCliente` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `fechaCotizacion` datetime NOT NULL DEFAULT current_timestamp(),
  `totalCotizacion` decimal(12,2) NOT NULL,
  `estadoCotizacion` varchar(30) NOT NULL DEFAULT 'Vigente',
  PRIMARY KEY (`idCotizacion`),
  KEY `fkCotizacionCliente` (`idCliente`),
  KEY `fkCotizacionUsuario` (`idUsuario`),
  CONSTRAINT `fkCotizacionCliente` FOREIGN KEY (`idCliente`) REFERENCES `cliente` (`idCliente`),
  CONSTRAINT `fkCotizacionUsuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

LOCK TABLES `cotizacion` WRITE;
INSERT INTO `cotizacion` VALUES 
(1,1,1,'2026-10-18 19:58:16',355.00,'Vigente'),
(2,4,1,'2026-10-18 21:14:00',16000.00,'Facturada');
UNLOCK TABLES;

--
-- Table structure for table `detallecotizacion`
--

DROP TABLE IF EXISTS `detallecotizacion`;
CREATE TABLE `detallecotizacion` (
  `idDetalleCotizacion` int(11) NOT NULL AUTO_INCREMENT,
  `idCotizacion` int(11) NOT NULL,
  `idProducto` int(11) NOT NULL,
  `cantidadCotizada` decimal(12,2) NOT NULL,
  `precioCotizado` decimal(12,2) NOT NULL,
  `subtotalCotizado` decimal(12,2) NOT NULL,
  PRIMARY KEY (`idDetalleCotizacion`),
  KEY `fkDetalleCotizacionCot` (`idCotizacion`),
  KEY `fkDetalleCotizacionProd` (`idProducto`),
  CONSTRAINT `fkDetalleCotizacionCot` FOREIGN KEY (`idCotizacion`) REFERENCES `cotizacion` (`idCotizacion`),
  CONSTRAINT `fkDetalleCotizacionProd` FOREIGN KEY (`idProducto`) REFERENCES `producto` (`idProducto`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

LOCK TABLES `detallecotizacion` WRITE;
INSERT INTO `detallecotizacion` VALUES 
(1,1,2,2.00,125.00,250.00),
(2,1,1,3.00,35.00,105.00),
(3,2,4,80.00,200.00,16000.00);
UNLOCK TABLES;

--
-- Table structure for table `factura`
--

DROP TABLE IF EXISTS `factura`;
CREATE TABLE `factura` (
  `idFactura` int(11) NOT NULL AUTO_INCREMENT,
  `idCotizacion` int(11) DEFAULT NULL,
  `idCliente` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `numeroFactura` varchar(50) NOT NULL,
  `fechaFactura` datetime NOT NULL DEFAULT current_timestamp(),
  `totalFactura` decimal(12,2) NOT NULL,
  `estadoFactura` varchar(30) NOT NULL DEFAULT 'Emitida',
  PRIMARY KEY (`idFactura`),
  UNIQUE KEY `numeroFactura` (`numeroFactura`),
  KEY `fkFacturaCotizacion` (`idCotizacion`),
  KEY `fkFacturaCliente` (`idCliente`),
  KEY `fkFacturaUsuario` (`idUsuario`),
  CONSTRAINT `fkFacturaCliente` FOREIGN KEY (`idCliente`) REFERENCES `cliente` (`idCliente`),
  CONSTRAINT `fkFacturaCotizacion` FOREIGN KEY (`idCotizacion`) REFERENCES `cotizacion` (`idCotizacion`),
  CONSTRAINT `fkFacturaUsuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

LOCK TABLES `factura` WRITE;
INSERT INTO `factura` VALUES 
(1,NULL,1,1,'FAC-2026-001','2026-10-18 20:04:42',355.00,'Emitida'),
(2,2,4,1,'FAC-2026-1001','2026-10-18 21:15:19',16000.00,'Emitida'),
(3,NULL,5,3,'FAC-1792412530169','2026-10-19 06:22:11',200.00,'Emitida'),
(4,NULL,5,3,'FAC-1792413105624','2026-10-19 06:31:46',200.00,'Emitida'),
(5,NULL,5,2,'FAC-1792413478703','2026-10-19 06:38:02',85.00,'Emitida');
UNLOCK TABLES;

--
-- Table structure for table `detallefactura`
--

DROP TABLE IF EXISTS `detallefactura`;
CREATE TABLE `detallefactura` (
  `idDetalleFactura` int(11) NOT NULL AUTO_INCREMENT,
  `idFactura` int(11) NOT NULL,
  `idProducto` int(11) NOT NULL,
  `cantidadVendida` decimal(12,2) NOT NULL,
  `precioVendido` decimal(12,2) NOT NULL,
  `subtotalVendido` decimal(12,2) NOT NULL,
  PRIMARY KEY (`idDetalleFactura`),
  KEY `fkDetalleFacturaFact` (`idFactura`),
  KEY `fkDetalleFacturaProd` (`idProducto`),
  CONSTRAINT `fkDetalleFacturaFact` FOREIGN KEY (`idFactura`) REFERENCES `factura` (`idFactura`),
  CONSTRAINT `fkDetalleFacturaProd` FOREIGN KEY (`idProducto`) REFERENCES `producto` (`idProducto`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

LOCK TABLES `detallefactura` WRITE;
INSERT INTO `detallefactura` VALUES 
(1,1,2,2.00,125.00,250.00),
(2,2,4,80.00,200.00,16000.00),
(3,3,4,1.00,200.00,200.00),
(4,4,4,1.00,200.00,200.00),
(5,5,2,1.00,85.00,85.00);
UNLOCK TABLES;

--
-- Table structure for table `pagofactura`
--

DROP TABLE IF EXISTS `pagofactura`;
CREATE TABLE `pagofactura` (
  `idPagoFactura` int(11) NOT NULL AUTO_INCREMENT,
  `idFactura` int(11) NOT NULL,
  `idMedioPago` int(11) NOT NULL,
  `montoPago` decimal(12,2) NOT NULL,
  `referenciaPago` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`idPagoFactura`),
  KEY `fkPagoFacturaFact` (`idFactura`),
  KEY `fkPagoFacturaMedio` (`idMedioPago`),
  CONSTRAINT `fkPagoFacturaFact` FOREIGN KEY (`idFactura`) REFERENCES `factura` (`idFactura`),
  CONSTRAINT `fkPagoFacturaMedio` FOREIGN KEY (`idMedioPago`) REFERENCES `mediopago` (`idMedioPago`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

LOCK TABLES `pagofactura` WRITE;
INSERT INTO `pagofactura` VALUES 
(1,1,1,355.00,'EFECTIVO-01'),
(2,2,1,10000.00,'EFECTIVO'),
(3,2,2,6000.00,'POS-VISA-88991'),
(5,3,1,200.00,'null'),
(6,4,1,200.00,'null'),
(7,5,1,85.00,'null');
UNLOCK TABLES;

--
-- Table structure for table `salidaloteventa`
--

DROP TABLE IF EXISTS `salidaloteventa`;
CREATE TABLE `salidaloteventa` (
  `idSalidaLoteVenta` int(11) NOT NULL AUTO_INCREMENT,
  `idDetalleFactura` int(11) NOT NULL,
  `idLoteInventario` int(11) NOT NULL,
  `cantidadSalida` decimal(12,2) NOT NULL,
  `costoHistoricoLote` decimal(12,2) NOT NULL,
  PRIMARY KEY (`idSalidaLoteVenta`),
  KEY `fkSalidaDetalle` (`idDetalleFactura`),
  KEY `fkSalidaLote` (`idLoteInventario`),
  CONSTRAINT `fkSalidaDetalle` FOREIGN KEY (`idDetalleFactura`) REFERENCES `detallefactura` (`idDetalleFactura`),
  CONSTRAINT `fkSalidaLote` FOREIGN KEY (`idLoteInventario`) REFERENCES `loteinventario` (`idLoteInventario`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

LOCK TABLES `salidaloteventa` WRITE;
INSERT INTO `salidaloteventa` VALUES 
(1,1,1,2.00,380.00),
(2,2,2,75.00,120.00),
(3,2,3,5.00,120.00),
(4,3,3,1.00,120.00),
(5,4,3,1.00,120.00),
(6,5,1,1.00,380.00);
UNLOCK TABLES;

--
-- Table structure for table `devolucion`
--

DROP TABLE IF EXISTS `devolucion`;
CREATE TABLE `devolucion` (
  `idDevolucion` int(11) NOT NULL AUTO_INCREMENT,
  `idFactura` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `fechaDevolucion` datetime NOT NULL DEFAULT current_timestamp(),
  `motivoDevolucion` varchar(255) NOT NULL,
  `totalDevuelto` decimal(12,2) NOT NULL,
  PRIMARY KEY (`idDevolucion`),
  KEY `fkDevolucionFactura` (`idFactura`),
  KEY `fkDevolucionUsuario` (`idUsuario`),
  CONSTRAINT `fkDevolucionFactura` FOREIGN KEY (`idFactura`) REFERENCES `factura` (`idFactura`),
  CONSTRAINT `fkDevolucionUsuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `detalledevolucion`
--

DROP TABLE IF EXISTS `detalledevolucion`;
CREATE TABLE `detalledevolucion` (
  `idDetalleDevolucion` int(11) NOT NULL AUTO_INCREMENT,
  `idDevolucion` int(11) NOT NULL,
  `idProducto` int(11) NOT NULL,
  `idLoteInventario` int(11) NOT NULL,
  `cantidadDevuelta` decimal(12,2) NOT NULL,
  PRIMARY KEY (`idDetalleDevolucion`),
  KEY `fkDetalleDevolucionDev` (`idDevolucion`),
  KEY `fkDetalleDevolucionProd` (`idProducto`),
  KEY `fkDetalleDevolucionLote` (`idLoteInventario`),
  CONSTRAINT `fkDetalleDevolucionDev` FOREIGN KEY (`idDevolucion`) REFERENCES `devolucion` (`idDevolucion`),
  CONSTRAINT `fkDetalleDevolucionLote` FOREIGN KEY (`idLoteInventario`) REFERENCES `loteinventario` (`idLoteInventario`),
  CONSTRAINT `fkDetalleDevolucionProd` FOREIGN KEY (`idProducto`) REFERENCES `producto` (`idProducto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `auditoriaoperacion`
--

DROP TABLE IF EXISTS `auditoriaoperacion`;
CREATE TABLE `auditoriaoperacion` (
  `idAuditoriaOperacion` int(11) NOT NULL AUTO_INCREMENT,
  `idUsuario` int(11) NOT NULL,
  `tablaAfectada` varchar(100) NOT NULL,
  `operacion` varchar(20) NOT NULL,
  `fechaHora` datetime NOT NULL DEFAULT current_timestamp(),
  `datosAnteriores` text DEFAULT NULL,
  `datosNuevos` text DEFAULT NULL,
  PRIMARY KEY (`idAuditoriaOperacion`),
  KEY `fkAuditoriaUsuario` (`idUsuario`),
  CONSTRAINT `fkAuditoriaUsuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Updatable Views for PascalCase / CamelCase compatibility on Linux systems (lower_case_table_names=0)
--
CREATE OR REPLACE VIEW `Rol` AS SELECT * FROM `rol`;
CREATE OR REPLACE VIEW `Usuario` AS SELECT * FROM `usuario`;
CREATE OR REPLACE VIEW `Categoria` AS SELECT * FROM `categoria`;
CREATE OR REPLACE VIEW `MedidaPresentacion` AS SELECT * FROM `medidapresentacion`;
CREATE OR REPLACE VIEW `MedioPago` AS SELECT * FROM `mediopago`;
CREATE OR REPLACE VIEW `UbicacionBodega` AS SELECT * FROM `ubicacionbodega`;
CREATE OR REPLACE VIEW `Cliente` AS SELECT * FROM `cliente`;
CREATE OR REPLACE VIEW `Proveedor` AS SELECT * FROM `proveedor`;
CREATE OR REPLACE VIEW `Producto` AS SELECT * FROM `producto`;
CREATE OR REPLACE VIEW `OrdenCompra` AS SELECT * FROM `ordencompra`;
CREATE OR REPLACE VIEW `DetalleOrdenCompra` AS SELECT * FROM `detalleordencompra`;
CREATE OR REPLACE VIEW `IngresoBodega` AS SELECT * FROM `ingresobodega`;
CREATE OR REPLACE VIEW `LoteInventario` AS SELECT * FROM `loteinventario`;
CREATE OR REPLACE VIEW `InventarioUbicacion` AS SELECT * FROM `inventarioubicacion`;
CREATE OR REPLACE VIEW `DetalleIngresoBodega` AS SELECT * FROM `detalleingresobodega`;
CREATE OR REPLACE VIEW `Cotizacion` AS SELECT * FROM `cotizacion`;
CREATE OR REPLACE VIEW `DetalleCotizacion` AS SELECT * FROM `detallecotizacion`;
CREATE OR REPLACE VIEW `Factura` AS SELECT * FROM `factura`;
CREATE OR REPLACE VIEW `DetalleFactura` AS SELECT * FROM `detallefactura`;
CREATE OR REPLACE VIEW `PagoFactura` AS SELECT * FROM `pagofactura`;
CREATE OR REPLACE VIEW `SalidaLoteVenta` AS SELECT * FROM `salidaloteventa`;
CREATE OR REPLACE VIEW `Devolucion` AS SELECT * FROM `devolucion`;
CREATE OR REPLACE VIEW `DetalleDevolucion` AS SELECT * FROM `detalledevolucion`;
CREATE OR REPLACE VIEW `AuditoriaOperacion` AS SELECT * FROM `auditoriaoperacion`;

--
-- Stored Procedures
--

DELIMITER ;;

DROP PROCEDURE IF EXISTS `sp_ProcesarFacturaFIFO` ;;
CREATE PROCEDURE `sp_ProcesarFacturaFIFO`(
    IN p_idCotizacion INT,
    IN p_idCliente INT,
    IN p_idUsuario INT,
    IN p_numeroFactura VARCHAR(50),
    IN p_totalFactura DECIMAL(10,2),
    IN p_jsonDetalles JSON,
    IN p_jsonPagos JSON,
    OUT p_idFactura INT
)
BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE n INT DEFAULT 0;
    DECLARE v_idProducto INT;
    DECLARE v_cantidadVendida DECIMAL(10,2);
    DECLARE v_precioVendido DECIMAL(10,2);
    DECLARE v_subtotalVendido DECIMAL(10,2);
    DECLARE v_idDetalleFactura INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    INSERT INTO factura (
        idCotizacion,
        idCliente,
        idUsuario,
        numeroFactura,
        totalFactura,
        estadoFactura
    )
    VALUES (
        p_idCotizacion,
        p_idCliente,
        p_idUsuario,
        p_numeroFactura,
        p_totalFactura,
        'Emitida'
    );

    SET p_idFactura = LAST_INSERT_ID();

    SET n = JSON_LENGTH(p_jsonPagos);
    SET i = 0;

    WHILE i < n DO
        INSERT INTO pagofactura (
            idFactura,
            idMedioPago,
            montoPago,
            referenciaPago
        )
        VALUES (
            p_idFactura,
            JSON_UNQUOTE(
                JSON_EXTRACT(
                    p_jsonPagos,
                    CONCAT('$[', i, '].idMedioPago')
                )
            ),
            JSON_UNQUOTE(
                JSON_EXTRACT(
                    p_jsonPagos,
                    CONCAT('$[', i, '].montoPago')
                )
            ),
            JSON_UNQUOTE(
                JSON_EXTRACT(
                    p_jsonPagos,
                    CONCAT('$[', i, '].referenciaPago')
                )
            )
        );

        SET i = i + 1;
    END WHILE;

    SET n = JSON_LENGTH(p_jsonDetalles);
    SET i = 0;

    WHILE i < n DO
        SET v_idProducto = JSON_UNQUOTE(
            JSON_EXTRACT(
                p_jsonDetalles,
                CONCAT('$[', i, '].idProducto')
            )
        );

        SET v_cantidadVendida = JSON_UNQUOTE(
            JSON_EXTRACT(
                p_jsonDetalles,
                CONCAT('$[', i, '].cantidadVendida')
            )
        );

        SET v_precioVendido = JSON_UNQUOTE(
            JSON_EXTRACT(
                p_jsonDetalles,
                CONCAT('$[', i, '].precioVendido')
            )
        );

        SET v_subtotalVendido = JSON_UNQUOTE(
            JSON_EXTRACT(
                p_jsonDetalles,
                CONCAT('$[', i, '].subtotalVendido')
            )
        );

        INSERT INTO detallefactura (
            idFactura,
            idProducto,
            cantidadVendida,
            precioVendido,
            subtotalVendido
        )
        VALUES (
            p_idFactura,
            v_idProducto,
            v_cantidadVendida,
            v_precioVendido,
            v_subtotalVendido
        );

        SET v_idDetalleFactura = LAST_INSERT_ID();

        BEGIN
            DECLARE v_lote_done BOOLEAN DEFAULT FALSE;
            DECLARE v_idLote INT;
            DECLARE v_disponible DECIMAL(10,2);
            DECLARE v_costoLote DECIMAL(10,2);
            DECLARE v_idBodega INT;
            DECLARE v_pendiente DECIMAL(10,2);
            DECLARE v_aDescontar DECIMAL(10,2);

            DECLARE curLotes CURSOR FOR
                SELECT
                    idLoteInventario,
                    cantidadDisponibleLote,
                    costoUnitarioLote,
                    idUbicacionBodega
                FROM loteinventario
                WHERE idProducto = v_idProducto
                  AND cantidadDisponibleLote > 0
                ORDER BY fechaIngresoLote ASC;

            DECLARE CONTINUE HANDLER FOR NOT FOUND
                SET v_lote_done = TRUE;

            SET v_pendiente = v_cantidadVendida;

            OPEN curLotes;

            lote_loop: LOOP
                FETCH curLotes
                INTO v_idLote, v_disponible, v_costoLote, v_idBodega;

                IF v_lote_done OR v_pendiente <= 0 THEN
                    LEAVE lote_loop;
                END IF;

                IF v_disponible <= v_pendiente THEN
                    SET v_aDescontar = v_disponible;
                ELSE
                    SET v_aDescontar = v_pendiente;
                END IF;

                UPDATE loteinventario
                SET cantidadDisponibleLote =
                    cantidadDisponibleLote - v_aDescontar
                WHERE idLoteInventario = v_idLote;

                INSERT INTO salidaloteventa (
                    idDetalleFactura,
                    idLoteInventario,
                    cantidadSalida,
                    costoHistoricoLote
                )
                VALUES (
                    v_idDetalleFactura,
                    v_idLote,
                    v_aDescontar,
                    v_costoLote
                );

                UPDATE inventarioubicacion
                SET stockActual = stockActual - v_aDescontar
                WHERE idProducto = v_idProducto
                  AND idUbicacionBodega = v_idBodega;

                SET v_pendiente = v_pendiente - v_aDescontar;
            END LOOP;

            CLOSE curLotes;

            IF v_pendiente > 0 THEN
                SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT =
                    'Stock insuficiente en lotes para completar la venta FIFO';
            END IF;
        END;

        SET i = i + 1;
    END WHILE;

    IF p_idCotizacion IS NOT NULL THEN
        UPDATE cotizacion
        SET estadoCotizacion = 'Facturada'
        WHERE idCotizacion = p_idCotizacion;
    END IF;

    COMMIT;
END ;;

DROP PROCEDURE IF EXISTS `sp_ValidarLogin` ;;
CREATE PROCEDURE `sp_ValidarLogin`(IN p_correo VARCHAR(100), IN p_contrasenia VARCHAR(255))
SELECT u.idUsuario, u.nombreUsuario, u.correoUsuario, u.estadoUsuario, r.nombreRol
FROM usuario u
INNER JOIN rol r ON u.idRol = r.idRol
WHERE u.correoUsuario = p_correo
  AND u.estadoUsuario = 1
  AND u.contraseniaUsuario = SHA2(p_contrasenia, 256) ;;

DROP PROCEDURE IF EXISTS `sp_AnularFactura` ;;
CREATE PROCEDURE `sp_AnularFactura`(
    IN p_numeroFactura VARCHAR(50),
    IN p_idUsuario INT,
    OUT p_resultado INT,
    OUT p_mensaje VARCHAR(255)
)
BEGIN
    DECLARE v_idFactura INT;
    DECLARE v_idCotizacion INT;
    DECLARE v_estado VARCHAR(30);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_resultado = 0;
        SET p_mensaje = 'Error al anular la factura y restituir el inventario.';
    END;

    START TRANSACTION;

    SELECT idFactura, idCotizacion, estadoFactura INTO v_idFactura, v_idCotizacion, v_estado 
    FROM factura 
    WHERE numeroFactura = p_numeroFactura OR idFactura = p_numeroFactura;

    IF v_idFactura IS NULL THEN
        ROLLBACK;
        SET p_resultado = 0;
        SET p_mensaje = 'La factura especificada no existe.';
    ELSEIF v_estado = 'Anulada' THEN
        ROLLBACK;
        SET p_resultado = 0;
        SET p_mensaje = 'La factura ya se encuentra previamente anulada.';
    ELSE
        -- 1. Restituir cantidadDisponibleLote en loteinventario
        UPDATE loteinventario li
        INNER JOIN salidaloteventa slv ON li.idLoteInventario = slv.idLoteInventario
        INNER JOIN detallefactura df ON slv.idDetalleFactura = df.idDetalleFactura
        SET li.cantidadDisponibleLote = li.cantidadDisponibleLote + slv.cantidadSalida
        WHERE df.idFactura = v_idFactura;

        -- 2. Restituir stockActual en inventarioubicacion
        UPDATE inventarioubicacion iu
        INNER JOIN (
            SELECT li.idProducto, li.idUbicacionBodega, SUM(slv.cantidadSalida) AS cantRetorno
            FROM salidaloteventa slv
            INNER JOIN detallefactura df ON slv.idDetalleFactura = df.idDetalleFactura
            INNER JOIN loteinventario li ON slv.idLoteInventario = li.idLoteInventario
            WHERE df.idFactura = v_idFactura
            GROUP BY li.idProducto, li.idUbicacionBodega
        ) AS retorno ON iu.idProducto = retorno.idProducto AND iu.idUbicacionBodega = retorno.idUbicacionBodega
        SET iu.stockActual = iu.stockActual + retorno.cantRetorno;

        -- 3. Si la cotización existía, revertirla a Vigente
        IF v_idCotizacion IS NOT NULL THEN
            UPDATE cotizacion SET estadoCotizacion = 'Vigente' WHERE idCotizacion = v_idCotizacion;
        END IF;

        -- 4. Marcar factura como Anulada
        UPDATE factura SET estadoFactura = 'Anulada' WHERE idFactura = v_idFactura;

        COMMIT;
        SET p_resultado = 1;
        SET p_mensaje = 'Factura anulada exitosamente y productos restituidos al inventario.';
    END IF;
END ;;

DELIMITER ;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
