
CREATE DATABASE IF NOT EXISTS tienda_celulares;
USE tienda_celulares;

CREATE TABLE usuarios (
    id_usuarios INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol ENUM('Admin') NOT NULL,
    estado TINYINT(1) DEFAULT 1,
    ultimo_login DATETIME
);
CREATE TABLE inventario_celulares (
    id_celulares INT AUTO_INCREMENT PRIMARY KEY,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    imei VARCHAR(20) NOT NULL UNIQUE,
    color VARCHAR(30),
    precio_venta DECIMAL(10, 2) NOT NULL,
    estado_stock ENUM('Disponible', 'Vendido', 'Garantia') DEFAULT 'Disponible'
);

CREATE TABLE ventas (
    id_venta INT AUTO_INCREMENT PRIMARY KEY,
    id_celulares INT NOT NULL,
    id_usuarios INT NOT NULL,
    nombre_cliente VARCHAR(100),
    precio_final DECIMAL(10, 2),
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_usuarios) REFERENCES usuarios(id_usuarios),
    FOREIGN KEY (id_celulares) REFERENCES inventario_celulares(id_celulares)
);
(DELIMITER //
CREATE TRIGGER actualizar_stock_venta
AFTER INSERT ON ventas
FOR EACH ROW
BEGIN
UPDATE invetario_celulares
SET estado_stock = 'vendido'
WHERE id_celuares = NEW.id_celulares;
END //
DELIMITER //)

CREATE VIEW reporte_diario AS
SELECT
DATE(fecha_venta) as fecha,
COUNT(id_ventas) as Equipos_Vendidos,
SUM(precio_final) as Total_caja
FROM ventas
GROUP BY DATE (fecha_venta);
