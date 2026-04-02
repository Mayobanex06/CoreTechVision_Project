
CREATE DATABASE IF NOT EXISTS coretech_db;
USE coretech_db;

CREATE TABLE usuarios (
    id_usuarios INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(50) NOT NULL UNIQUE, 
    password VARCHAR(255) NOT NULL,
    rol ENUM('Admin', 'User') NOT NULL,
    estado TINYINT(1) DEFAULT 1,
    ultimo_login DATETIME
);

SELECT * FROM usuarios; 

DELETE FROM usuarios
WHERE id_usuarios > 0; 

CREATE TABLE productos (
 id_producto INT AUTO_INCREMENT PRIMARY KEY,
  marca VARCHAR(100) NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  imagen VARCHAR(255) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  estado TINYINT NOT NULL DEFAULT 1
);

INSERT INTO productos (marca, nombre, precio, imagen, categoria, stock, estado) VALUES
('Samsung', 'Galaxy Z Fold7', 1299.99, 'Imagenes/fold7.png', 'Samsung', 8, 1),
('Samsung', 'Galaxy S25 Ultra', 64999.99, 'Imagenes/s25ultra.png', 'Samsung', 5, 1),
('Apple', 'iPhone 16 Pro Max', 74999.99, 'Imagenes/iphone16promax.png', 'Apple', 6, 1),
('Xiaomi', 'Xiaomi 14 Ultra', 55999.99, 'Imagenes/xiaomi14ultra.png', 'Xiaomi', 4, 1);

SELECT * FROM productos; 