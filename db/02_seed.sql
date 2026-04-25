-- =============================================
-- SEED DATA: Tienda de Tecnología
-- DBMS: PostgreSQL
-- Archivo: 02_seed.sql
-- Descripción: Datos de prueba realistas.
--              Ejecutar DESPUÉS de 01_schema.sql
-- =============================================

-- ─────────────────────────────────────────────
-- CATEGORIAS (8 registros)
-- ─────────────────────────────────────────────
INSERT INTO categorias (nombre, descripcion) VALUES
('Laptops',        'Computadoras portátiles para uso personal y profesional'),
('Monitores',      'Pantallas y monitores de escritorio'),
('Teclados',       'Teclados mecánicos y de membrana'),
('Audífonos',      'Audífonos y headsets para gaming y uso general'),
('Almacenamiento', 'Discos duros, SSD y memorias USB'),
('Mouses',         'Ratones ópticos y gaming'),
('Cámaras Web',    'Webcams para videoconferencia y streaming'),
('Accesorios',     'Cables, hubs, adaptadores y periféricos varios');

-- ─────────────────────────────────────────────
-- PROVEEDORES (25 registros)
-- ─────────────────────────────────────────────
INSERT INTO proveedores (nombre, telefono, email, direccion) VALUES
('Dell Technologies',    '5550-1001', 'ventas@dell.com',        'Austin, Texas, USA'),
('Logitech',             '5550-1002', 'ventas@logitech.com',    'Lausana, Suiza'),
('Samsung Electronics',  '5550-1003', 'ventas@samsung.com',     'Seúl, Corea del Sur'),
('Kingston Technology',  '5550-1004', 'ventas@kingston.com',    'Fountain Valley, CA, USA'),
('LG Electronics',       '5550-1005', 'ventas@lg.com',          'Seúl, Corea del Sur'),
('HP Inc.',              '5550-1006', 'ventas@hp.com',          'Palo Alto, CA, USA'),
('Lenovo',               '5550-1007', 'ventas@lenovo.com',      'Pekín, China'),
('Razer Inc.',           '5550-1008', 'ventas@razer.com',       'San Francisco, CA, USA'),
('Corsair',              '5550-1009', 'ventas@corsair.com',     'Fremont, CA, USA'),
('ASUS',                 '5550-1010', 'ventas@asus.com',        'Taipéi, Taiwán'),
('Acer',                 '5550-1011', 'ventas@acer.com',        'Taipéi, Taiwán'),
('MSI',                  '5550-1012', 'ventas@msi.com',         'Taipéi, Taiwán'),
('Western Digital',      '5550-1013', 'ventas@wdc.com',         'San José, CA, USA'),
('Seagate',              '5550-1014', 'ventas@seagate.com',     'Fremont, CA, USA'),
('BenQ',                 '5550-1015', 'ventas@benq.com',        'Taipéi, Taiwán'),
('HyperX',               '5550-1016', 'ventas@hyperx.com',      'Fountain Valley, CA, USA'),
('SteelSeries',          '5550-1017', 'ventas@steelseries.com', 'Copenhague, Dinamarca'),
('Anker',                '5550-1018', 'ventas@anker.com',       'Shenzhen, China'),
('TP-Link',              '5550-1019', 'ventas@tp-link.com',     'Shenzhen, China'),
('Sony',                 '5550-1020', 'ventas@sony.com',        'Tokio, Japón'),
('Apple',                '5550-1021', 'ventas@apple.com',       'Cupertino, CA, USA'),
('Microsoft',            '5550-1022', 'ventas@microsoft.com',   'Redmond, WA, USA'),
('Gigabyte',             '5550-1023', 'ventas@gigabyte.com',    'Taipéi, Taiwán'),
('NZXT',                 '5550-1024', 'ventas@nzxt.com',        'Los Angeles, CA, USA'),
('Elgato',               '5550-1025', 'ventas@elgato.com',      'Múnich, Alemania');

-- ─────────────────────────────────────────────
-- CLIENTES (25 registros)
-- ─────────────────────────────────────────────
INSERT INTO clientes (nombre, telefono, email, direccion) VALUES
('Juan Pérez',        '5555-0001', 'juan.perez@mail.com',    'Zona 10, Guatemala'),
('María López',       '5555-0002', 'maria.lopez@mail.com',   'Zona 14, Guatemala'),
('Carlos Rodríguez',  '5555-0003', 'carlos.rod@mail.com',    'Zona 1, Guatemala'),
('Ana García',        '5555-0004', 'ana.garcia@mail.com',    'Mixco, Guatemala'),
('Roberto Martínez',  '5555-0005', 'roberto.m@mail.com',     'Villa Nueva, Guatemala'),
('Lucía Hernández',   '5555-0006', 'lucia.h@mail.com',       'Zona 7, Guatemala'),
('Fernando Díaz',     '5555-0007', 'fernando.d@mail.com',    'Zona 11, Guatemala'),
('Patricia Morales',  '5555-0008', 'patricia.m@mail.com',    'Petapa, Guatemala'),
('Diego Ramírez',     '5555-0009', 'diego.r@mail.com',       'Zona 15, Guatemala'),
('Valentina Torres',  '5555-0010', 'valentina.t@mail.com',   'Zona 4, Guatemala'),
('Andrés Castillo',   '5555-0011', 'andres.c@mail.com',      'San Cristóbal, Guatemala'),
('Gabriela Flores',   '5555-0012', 'gabriela.f@mail.com',    'Zona 5, Guatemala'),
('Miguel Vargas',     '5555-0013', 'miguel.v@mail.com',      'Zona 12, Guatemala'),
('Sofía Mendoza',     '5555-0014', 'sofia.m@mail.com',       'Zona 16, Guatemala'),
('Alejandro Ruiz',    '5555-0015', 'alejandro.r@mail.com',   'Zona 2, Guatemala'),
('Camila Ortega',     '5555-0016', 'camila.o@mail.com',      'San Lucas, Guatemala'),
('David Aguilar',     '5555-0017', 'david.a@mail.com',       'Zona 9, Guatemala'),
('Isabella Reyes',    '5555-0018', 'isabella.r@mail.com',    'Zona 13, Guatemala'),
('Sebastián Cruz',    '5555-0019', 'sebastian.c@mail.com',   'Zona 6, Guatemala'),
('Daniela Rivas',     '5555-0020', 'daniela.r@mail.com',     'Villa Canales, Guatemala'),
('Emilio Soto',       '5555-0021', 'emilio.s@mail.com',      'Zona 3, Guatemala'),
('Natalia Paredes',   '5555-0022', 'natalia.p@mail.com',     'Zona 8, Guatemala'),
('Ricardo Monzón',    '5555-0023', 'ricardo.m@mail.com',     'Amatitlán, Guatemala'),
('Mariana Solís',     '5555-0024', 'mariana.s@mail.com',     'Santa Catarina Pinula, Guatemala'),
('Jorge Figueroa',    '5555-0025', 'jorge.f@mail.com',       'Fraijanes, Guatemala');

-- ─────────────────────────────────────────────
-- EMPLEADOS (25 registros)
-- ─────────────────────────────────────────────
INSERT INTO empleados (nombre, telefono, email, puesto) VALUES
('Laura Jiménez',    '5560-0001', 'laura.j@tienda.com',    'Gerente'),
('Pedro Álvarez',    '5560-0002', 'pedro.a@tienda.com',    'Vendedor'),
('Carmen Vega',      '5560-0003', 'carmen.v@tienda.com',   'Vendedor'),
('José Pineda',      '5560-0004', 'jose.p@tienda.com',     'Cajero'),
('Sandra Mejía',     '5560-0005', 'sandra.m@tienda.com',   'Vendedor'),
('Luis Barrios',     '5560-0006', 'luis.b@tienda.com',     'Bodeguero'),
('Rosa Campos',      '5560-0007', 'rosa.c@tienda.com',     'Cajero'),
('Marco Estrada',    '5560-0008', 'marco.e@tienda.com',    'Vendedor'),
('Gloria Peña',      '5560-0009', 'gloria.p@tienda.com',   'Vendedor'),
('Tomás Arriaga',    '5560-0010', 'tomas.a@tienda.com',    'Bodeguero'),
('Elena Fuentes',    '5560-0011', 'elena.f@tienda.com',    'Vendedor'),
('Hugo Sandoval',    '5560-0012', 'hugo.s@tienda.com',     'Vendedor'),
('Andrea Ponce',     '5560-0013', 'andrea.p@tienda.com',   'Cajero'),
('Óscar Lemus',      '5560-0014', 'oscar.l@tienda.com',    'Vendedor'),
('Claudia Nájera',   '5560-0015', 'claudia.n@tienda.com',  'Vendedor'),
('Raúl Quezada',     '5560-0016', 'raul.q@tienda.com',     'Bodeguero'),
('Beatriz Tobar',    '5560-0017', 'beatriz.t@tienda.com',  'Vendedor'),
('Sergio Godoy',     '5560-0018', 'sergio.g@tienda.com',   'Gerente'),
('Mónica Arévalo',   '5560-0019', 'monica.a@tienda.com',   'Cajero'),
('Pablo Cáceres',    '5560-0020', 'pablo.c@tienda.com',    'Vendedor'),
('Cristina Dávila',  '5560-0021', 'cristina.d@tienda.com', 'Vendedor'),
('Alfredo Villatoro','5560-0022', 'alfredo.v@tienda.com',  'Bodeguero'),
('Diana Escobar',    '5560-0023', 'diana.e@tienda.com',    'Vendedor'),
('Enrique Morán',    '5560-0024', 'enrique.m@tienda.com',  'Cajero'),
('Verónica Paz',     '5560-0025', 'veronica.p@tienda.com', 'Vendedor');

-- ─────────────────────────────────────────────
-- PRODUCTOS (30 registros)
-- categoria_id: 1=Laptops 2=Monitores 3=Teclados
--               4=Audífonos 5=Almacenamiento
--               6=Mouses 7=Cámaras Web 8=Accesorios
-- ─────────────────────────────────────────────
INSERT INTO productos (nombre, descripcion, precio, stock, categoria_id, proveedor_id) VALUES
('Laptop Dell Inspiron 15',      'Laptop 15.6" i5, 8GB RAM, 256GB SSD',       8500.00, 15, 1,  1),
('Laptop HP Pavilion 14',        'Laptop 14" i7, 16GB RAM, 512GB SSD',        12500.00, 10, 1,  6),
('Laptop Lenovo IdeaPad 3',      'Laptop 15.6" Ryzen 5, 8GB RAM, 256GB SSD',  7200.00, 20, 1,  7),
('Laptop ASUS VivoBook 14',      'Laptop 14" i5, 8GB RAM, 512GB SSD',          9800.00, 12, 1, 10),
('Laptop Acer Aspire 5',         'Laptop 15.6" i5, 12GB RAM, 512GB SSD',       8900.00,  8, 1, 11),
('Monitor Samsung 27" 4K',       'Monitor UHD IPS 27 pulgadas',                4500.00, 18, 2,  3),
('Monitor LG UltraWide 34"',     'Monitor ultrawide 34" QHD',                  6200.00,  7, 2,  5),
('Monitor BenQ 24" FHD',         'Monitor Full HD IPS 24 pulgadas',             2800.00, 25, 2, 15),
('Monitor ASUS ProArt 27"',      'Monitor profesional 4K para diseño',          7500.00,  5, 2, 10),
('Monitor MSI Optix 27" 144Hz',  'Monitor gaming 27" FHD 144Hz',                3800.00, 14, 2, 12),
('Teclado Logitech MX Keys',     'Teclado inalámbrico retroiluminado',           1200.00, 30, 3,  2),
('Teclado Razer BlackWidow V3',  'Teclado mecánico RGB gaming',                 1800.00, 22, 3,  8),
('Teclado Corsair K70 RGB',      'Teclado mecánico Cherry MX Red',              1650.00, 18, 3,  9),
('Teclado HyperX Alloy Core',    'Teclado mecánico compacto gaming',             950.00, 35, 3, 16),
('Audífonos Sony WH-1000XM5',   'Audífonos inalámbricos noise cancelling',     3500.00, 12, 4, 20),
('Audífonos Razer Kraken',       'Headset gaming con micrófono',                 850.00, 28, 4,  8),
('Audífonos SteelSeries Arctis 7','Headset inalámbrico gaming',                 1800.00, 15, 4, 17),
('Audífonos Logitech G Pro X',   'Headset profesional gaming',                  1500.00, 20, 4,  2),
('SSD Kingston A2000 1TB',       'SSD NVMe M.2 1TB',                            1100.00, 40, 5,  4),
('SSD Samsung 870 EVO 500GB',    'SSD SATA 2.5" 500GB',                          750.00, 35, 5,  3),
('HDD Seagate Barracuda 2TB',    'Disco duro interno 3.5" 2TB',                  850.00, 25, 5, 14),
('HDD WD Elements 1TB',          'Disco duro externo USB 3.0 1TB',               650.00, 30, 5, 13),
('Mouse Logitech MX Master 3',   'Mouse inalámbrico ergonómico',                1100.00, 25, 6,  2),
('Mouse Razer DeathAdder V3',    'Mouse gaming óptico',                           850.00, 30, 6,  8),
('Mouse Corsair Dark Core RGB',  'Mouse inalámbrico gaming RGB',                  950.00, 18, 6,  9),
('Webcam Logitech C920',         'Cámara web Full HD 1080p',                      750.00, 20, 7,  2),
('Webcam Elgato Facecam',        'Cámara web profesional 1080p60',               2200.00,  8, 7, 25),
('Hub USB-C Anker 7-en-1',       'Adaptador USB-C multipuerto',                   450.00, 40, 8, 18),
('Cable HDMI 2.1 2m',            'Cable HDMI 8K alta velocidad 2 metros',         180.00, 60, 8, 18),
('Mouse Pad Corsair MM700 RGB',  'Mouse pad RGB extendido XL',                    550.00, 22, 8,  9);

-- ─────────────────────────────────────────────
-- VENTAS (25 registros)
-- ─────────────────────────────────────────────
INSERT INTO ventas (fecha, cliente_id, empleado_id, total) VALUES
('2026-01-05',  1,  2,  9700.00),
('2026-01-08',  2,  3, 12500.00),
('2026-01-12',  3,  5,  2980.00),
('2026-01-15',  4,  2,  8500.00),
('2026-01-20',  5,  8,  4500.00),
('2026-01-25',  6,  3,  1200.00),
('2026-02-01',  7,  2,  7200.00),
('2026-02-05',  8,  5,  3500.00),
('2026-02-10',  9,  8,  1800.00),
('2026-02-14', 10,  3, 11480.00),
('2026-02-18', 11,  2,   850.00),
('2026-02-22', 12,  5,  9800.00),
('2026-03-01', 13,  8,  2130.00),
('2026-03-05', 14,  3,  6200.00),
('2026-03-08', 15,  2,  1650.00),
('2026-03-12', 16,  5,  8900.00),
('2026-03-15', 17,  8,   750.00),
('2026-03-18', 18,  3,  5480.00),
('2026-03-22', 19,  2,  3800.00),
('2026-03-25', 20,  5,  1100.00),
('2026-03-28', 21,  8,  2800.00),
('2026-04-01', 22,  3,  4500.00),
('2026-04-05', 23,  2,   950.00),
('2026-04-08', 24,  5,  7500.00),
('2026-04-10', 25,  8,  1930.00);

-- ─────────────────────────────────────────────
-- DETALLE_VENTA (35 registros)
-- ─────────────────────────────────────────────
INSERT INTO detalle_venta (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
-- Venta 1: Laptop Dell + Teclado Logitech
(1,  1,  1, 8500.00, 8500.00),
(1, 11,  1, 1200.00, 1200.00),
-- Venta 2: Laptop HP
(2,  2,  1, 12500.00, 12500.00),
-- Venta 3: Monitor BenQ + Cable HDMI x2
(3,  8,  1, 2800.00, 2800.00),
(3, 29,  2,  180.00,  360.00),
-- Venta 4: Laptop Dell
(4,  1,  1, 8500.00, 8500.00),
-- Venta 5: Monitor Samsung 4K
(5,  6,  1, 4500.00, 4500.00),
-- Venta 6: Teclado Logitech
(6, 11,  1, 1200.00, 1200.00),
-- Venta 7: Laptop Lenovo
(7,  3,  1, 7200.00, 7200.00),
-- Venta 8: Audífonos Sony
(8, 15,  1, 3500.00, 3500.00),
-- Venta 9: Teclado Razer
(9, 12,  1, 1800.00, 1800.00),
-- Venta 10: Laptop ASUS + Audífonos Logitech + Cable HDMI
(10,  4,  1, 9800.00, 9800.00),
(10, 18,  1, 1500.00, 1500.00),
(10, 29,  1,  180.00,  180.00),
-- Venta 11: Audífonos Razer
(11, 16,  1,  850.00,  850.00),
-- Venta 12: Laptop ASUS
(12,  4,  1, 9800.00, 9800.00),
-- Venta 13: SSD Kingston + Mouse Razer + Cable HDMI
(13, 19,  1, 1100.00, 1100.00),
(13, 24,  1,  850.00,  850.00),
(13, 29,  1,  180.00,  180.00),
-- Venta 14: Monitor LG UltraWide
(14,  7,  1, 6200.00, 6200.00),
-- Venta 15: Teclado Corsair
(15, 13,  1, 1650.00, 1650.00),
-- Venta 16: Laptop Acer
(16,  5,  1, 8900.00, 8900.00),
-- Venta 17: Webcam Logitech
(17, 26,  1,  750.00,  750.00),
-- Venta 18: Audífonos Sony + Teclado Razer
(18, 15,  1, 3500.00, 3500.00),
(18, 12,  1, 1800.00, 1800.00),
(18, 29,  1,  180.00,  180.00),
-- Venta 19: Monitor MSI 144Hz
(19, 10,  1, 3800.00, 3800.00),
-- Venta 20: SSD Kingston
(20, 19,  1, 1100.00, 1100.00),
-- Venta 21: Monitor BenQ
(21,  8,  1, 2800.00, 2800.00),
-- Venta 22: Monitor Samsung
(22,  6,  1, 4500.00, 4500.00),
-- Venta 23: Mouse Corsair
(23, 25,  1,  950.00,  950.00),
-- Venta 24: Monitor ASUS ProArt
(24,  9,  1, 7500.00, 7500.00),
-- Venta 25: Hub USB-C + Cable HDMI x2 + SSD Kingston
(25, 28,  1,  450.00,  450.00),
(25, 29,  2,  180.00,  360.00),
(25, 19,  1, 1100.00, 1100.00);

-- ─────────────────────────────────────────────
-- USUARIOS (25 registros)
-- Nota: los password_hash son bcrypt simulados.
--       En producción se generan con bcrypt desde el backend.
-- ─────────────────────────────────────────────
INSERT INTO usuarios (username, password_hash, rol) VALUES
('admin',        '$2b$10$xJHk5Fv9AbPqB3rKZgVzOeYkzV1RYa5FQ1B7yT6J8ZqR', 'admin'),
('laura.j',      '$2b$10$A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2', 'gerente'),
('pedro.a',      '$2b$10$B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3', 'vendedor'),
('carmen.v',     '$2b$10$C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4', 'vendedor'),
('jose.p',       '$2b$10$D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5', 'cajero'),
('sandra.m',     '$2b$10$E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6', 'vendedor'),
('luis.b',       '$2b$10$F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7', 'bodeguero'),
('rosa.c',       '$2b$10$G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8', 'cajero'),
('marco.e',      '$2b$10$H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9', 'vendedor'),
('gloria.p',     '$2b$10$I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0', 'vendedor'),
('tomas.a',      '$2b$10$J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1', 'bodeguero'),
('elena.f',      '$2b$10$K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2', 'vendedor'),
('hugo.s',       '$2b$10$L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3', 'vendedor'),
('andrea.p',     '$2b$10$M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4', 'cajero'),
('oscar.l',      '$2b$10$N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5', 'vendedor'),
('claudia.n',    '$2b$10$O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6', 'vendedor'),
('raul.q',       '$2b$10$P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7', 'bodeguero'),
('beatriz.t',    '$2b$10$Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8', 'vendedor'),
('sergio.g',     '$2b$10$R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9', 'gerente'),
('monica.a',     '$2b$10$S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0', 'cajero'),
('pablo.c',      '$2b$10$T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O1', 'vendedor'),
('cristina.d',   '$2b$10$U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O1P2', 'vendedor'),
('alfredo.v',    '$2b$10$V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O1P2Q3', 'bodeguero'),
('diana.e',      '$2b$10$W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O1P2Q3R4', 'vendedor'),
('enrique.m',    '$2b$10$X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5', 'cajero');
