-- ------------------------------
-- 1. Crear la base de datos
-- ------------------------------
CREATE DATABASE IF NOT EXISTS crm;
USE crm;

-- ------------------------------
-- 2. Roles
-- ------------------------------
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- ------------------------------
-- 3. Usuarios
-- ------------------------------
CREATE TABLE usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id BIGINT NOT NULL,
    CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES roles(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- ------------------------------
-- 4. Clientes
-- ------------------------------
CREATE TABLE Clientes (
    id_cliente BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    telefono VARCHAR(20),
    direccion VARCHAR(200),
    estado VARCHAR(20) DEFAULT 'ACTIVO',
    CONSTRAINT fk_cliente_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
        ON DELETE CASCADE
);

-- ------------------------------
-- 5. Contactos
-- ------------------------------
CREATE TABLE Contactos (
    id_contacto BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_cliente BIGINT NOT NULL,
    id_usuario BIGINT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    telefono VARCHAR(20),
    cargo VARCHAR(50),
    estado VARCHAR(20) DEFAULT 'ACTIVO',
    FOREIGN KEY (id_cliente) REFERENCES Clientes(id_cliente) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ------------------------------
-- 6. Incidencias
-- ------------------------------
CREATE TABLE Incidencias (
    id_incidencia BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_cliente BIGINT NOT NULL,
    id_contacto BIGINT,
    descripcion TEXT,
    fecha_apertura DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(50),
    prioridad VARCHAR(20),
    FOREIGN KEY (id_cliente) REFERENCES Clientes(id_cliente) ON DELETE CASCADE,
    FOREIGN KEY (id_contacto) REFERENCES Contactos(id_contacto) ON DELETE SET NULL
);

-- ------------------------------
-- 7. Usuario_Rol
-- ------------------------------
CREATE TABLE Usuario_Rol (
    id_usuario BIGINT NOT NULL,
    id_rol BIGINT NOT NULL,
    PRIMARY KEY (id_usuario, id_rol),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_rol) REFERENCES roles(id) ON DELETE CASCADE
);

-- ------------------------------
-- 8. Tareas
-- ------------------------------
CREATE TABLE Tareas (
    id_tarea BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT NOT NULL,
    id_cliente BIGINT,
    id_incidencia BIGINT,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(50) DEFAULT 'PENDIENTE',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_vencimiento DATETIME,
    prioridad VARCHAR(20),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_cliente) REFERENCES Clientes(id_cliente) ON DELETE SET NULL,
    FOREIGN KEY (id_incidencia) REFERENCES Incidencias(id_incidencia) ON DELETE SET NULL
);

-- ------------------------------
-- 9. Oportunidades
-- ------------------------------
CREATE TABLE OPORTUNIDAD (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    id_cliente BIGINT NOT NULL,
    id_usuario BIGINT NOT NULL,
    stage ENUM('PROSPECCION','CALIFICACION','PROPUESTA','NEGOCIACION','CERRADA_GANADA','CERRADA_PERDIDA') NOT NULL,
    nivel ENUM('BAJO','MEDIO','ALTO') NOT NULL,
    amount DECIMAL(19,4) NOT NULL,
    start_date DATE NOT NULL,
    close_date DATE NOT NULL,
    CONSTRAINT fk_oportunidad_cliente FOREIGN KEY (id_cliente) REFERENCES Clientes(id_cliente),
    CONSTRAINT fk_oportunidad_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);

-- ------------------------------
-- INSERTS EJEMPLO
-- ------------------------------

-- Roles
INSERT INTO roles (name) VALUES ('ADMIN');

-- Usuario
INSERT INTO usuarios (username, email, password, role_id)
VALUES ('hugo', 'hugo@gmail.com', '$2a$10$TT0MXs6nA0gWpt2bsg0eBewA4hbDqpO99c/rg99wRm2j5UqiQoW92', 1);

-- Clientes
INSERT INTO Clientes (id_usuario, nombre, email, telefono, direccion, estado) VALUES
(1, 'Tech Solutions Corp.', 'contacto@techsolutions.com', '600112233', 'C/ Innovación, 10, Madrid', 'ACTIVO'),
(1, 'Global Logistics SRL', 'info@globallogistics.com', '699887766', 'Av. Central, 45, Barcelona', 'PENDIENTE'),
(1, 'Marketing Digital Pro', 'contacto@marketingpro.com', '655443322', 'Pza. Mayor, 2, Sevilla', 'INACTIVO');

-- Contactos
INSERT INTO Contactos (id_cliente, id_usuario, nombre, email, telefono, cargo, estado) VALUES
(1, 1, 'Elena García', 'elena.garcia@techsolutions.com', '600112233', 'Jefa de IT', 'ACTIVO'),
(2, 1, 'Pedro Soto', 'pedro.soto@globallogistics.com', '699887766', 'Gerente de Operaciones', 'PENDIENTE'),
(3, 1, 'Laura Méndez', 'laura.mendez@marketingpro.com', '655443322', 'Directora de Cuentas', 'INACTIVO');

-- Oportunidades
INSERT INTO OPORTUNIDAD (id, name, id_cliente, id_usuario, stage, nivel, amount, start_date, close_date) VALUES
('OPP-001', 'Nuevo contrato Tech Solutions', 1, 1, 'PROSPECCION', 'ALTO', 50000, '2025-12-01', '2026-01-15'),
('OPP-002', 'Actualización logística Global', 2, 1, 'NEGOCIACION', 'MEDIO', 30000, '2025-12-02', '2026-01-20'),
('OPP-003', 'Campaña Marketing Digital', 3, 1, 'CERRADA_GANADA', 'BAJO', 15000, '2025-11-25', '2025-12-10'),
('OPP-004', 'Integración de módulo', 2, 1, 'CERRADA_PERDIDA', 'MEDIO', 10000, '2025-11-30', '2025-12-05'),
('OPP-005', 'Propuesta SEO Tech Solutions', 1, 1, 'CALIFICACION', 'ALTO', 20000, '2025-12-03', '2026-01-25');

INSERT INTO Incidencias (id_cliente, id_contacto, descripcion, estado, prioridad) VALUES
(1, 1, 'Error crítico en el módulo de facturación al generar informes mensuales.', 'ABIERTA', 'ALTA'),
(2, 2, 'El sistema de seguimiento de pedidos se desconecta intermitentemente.', 'EN_PROGRESO', 'MEDIA');

INSERT INTO Tareas (id_usuario, id_cliente, id_incidencia, titulo, descripcion, estado, fecha_vencimiento, prioridad) VALUES
(1, 1, 1, 'Revisar logs de facturación y trazar error', 'Analizar los archivos de registro del servidor para identificar el origen del error 500 en la generación de informes.', 'PENDIENTE', '2025-12-05 17:00:00', 'ALTA'),
(1, 2, 2, 'Verificar conectividad de la API de seguimiento', 'Comprobar la estabilidad de la conexión con el proveedor de seguimiento de terceros y revisar políticas de timeout.', 'PENDIENTE', '2025-12-06 12:00:00', 'MEDIA');


