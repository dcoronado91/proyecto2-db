const IMAGENES = {
  // ── Laptops
  1:  'https://cdn.kemik.gt/2018/09/compu3.jpeg', // Laptop Dell Inspiron 15
  2:  'https://cdn.kemik.gt/2016/12/7b0739c1-336e-463f-8cd1-68837cdee503-526x395.jpg', // Laptop HP Pavilion 14
  3:  'https://img.pacifiko.com/PROD/resize/1/500x500/NzRjYmRjNj.jpg', // Laptop Lenovo IdeaPad 3
  4:  'https://img.pacifiko.com/PROD/resize/1/500x500/MzAyOTAwM2.jpg', // Laptop ASUS VivoBook 14
  5:  'https://m.media-amazon.com/images/I/71vvXGmdKWL._AC_SL1500_.jpg', // Laptop Acer Aspire 5

  // ── Monitores
  6:  'https://webobjects2.cdw.com/is/image/CDW/7932658?$product-main$', // Monitor Samsung 27" 4K
  7:  'https://img.pacifiko.com/PROD/resize/1/500x500/B09XTNY742.jpg', // Monitor LG UltraWide 34"
  8:  'https://m.media-amazon.com/images/I/71fldUuE52L._AC_UF894,1000_QL80_.jpg', // Monitor BenQ 24" FHD
  9:  'https://pcya.pe/wp-content/uploads/2024/05/PA278QV-10.png', // Monitor ASUS ProArt 27"
  10: 'https://thumb.pccomponentes.com/w-530-530/articles/25/257415/msi-optix-g271-27-led-ips-fullhd-144hz-freesync-62df4b88-e1a0-4c3e-a1af-db33138834ea.jpg', // Monitor MSI Optix 27" 144Hz

  // ── Teclados
  11: 'https://img.pacifiko.com/PROD/resize/1/480x480/N2E3Mjk1Yj.jpg', // Teclado Logitech MX Keys
  12: 'https://cdn.kemik.gt/2025/07/RZ03-03892000-R3M1-1-RAZER-1200x1200-00.-500x500.jpg', // Teclado Razer BlackWidow V3
  13: 'https://cdn.kemik.gt/2022/06/CH-9109018-SP-1000X1000-1-526x526.jpg', // Teclado Corsair K70 RGB
  14: 'https://cdn.kemik.gt/2024/02/4P4F5AIAC8-HYPERX-1200X1200-1-1-526x526.-500x500.jpg', // Teclado HyperX Alloy Core

  // ── Audífonos
  15: 'https://img.pacifiko.com/PROD/resize/1/1000x1000/Zjg5OGFlMD_1_477.png', // Audífonos Sony WH-1000XM5
  16: 'https://img.pacifiko.com/PROD/resize/1/500x500/MzI1MjVkNj.jpg', // Audífonos Razer Kraken
  17: 'https://media.spdigital.cl/thumbnails/products/tmpm6tm14np_25735f21_thumbnail_4096.jpg', // Audífonos SteelSeries Arctis 7
  18: 'https://cdn.kemik.gt/2024/01/981-001262-LOGITECH-1200x1200-01.-500x500.jpg', // Audífonos Logitech G Pro X

  // ── Almacenamiento
  19: 'https://m.media-amazon.com/images/I/41N0DgVAekL._AC_AA650_.jpg', // SSD Kingston A2000 1TB
  20: 'https://m.media-amazon.com/images/I/31yf-rQWDZL._SX600_.jpg', // SSD Samsung 870 EVO 500GB
  21: 'https://img.pacifiko.com/PROD/resize/1/500x500/NTc2YTNlOT.jpg', // HDD Seagate Barracuda 2TB
  22: 'https://cdn.kemik.gt/2023/06/WDBUZG0010BBK-WESN-WESTERNDIGITAL-1200x1200-01.-500x500.jpg', // HDD WD Elements 1TB

  // ── Ratones
  23: 'https://img.pacifiko.com/PROD/resize/1/500x500/B0B11LJ69K.jpg', // Mouse Logitech MX Master 3
  24: 'https://img.pacifiko.com/PROD/resize/1/500x500/ZDBlNzMyYz_1.png', // Mouse Razer DeathAdder V3
  25: 'https://img.pacifiko.com/PROD/resize/1/1000x1000/OWQ0ZmMzM2_16.jpg', // Mouse Corsair Dark Core RGB

  // ── Webcams
  26: 'https://cdn.kemik.gt/2025/09/960-000764-LOGITECH-C920-PRO-1200X1200-3-1-526x526.-500x500.jpg', // Webcam Logitech C920
  27: 'https://img.pacifiko.com/PROD/resize/1/500x500/B0CW1S7XP5.jpg', // Webcam Elgato Facecam

  // ── Accesorios
  28: 'https://cdn.kemik.gt/2026/03/AC001ANK95-Anker-1200x1200-1.jpg', // Hub USB-C Anker 7-en-1
  29: 'https://ishop.gt/cdn/shop/files/cq5dam.web.1000.1000-2_1de87fe5-7395-46a0-b29c-ca33aa5dc951.jpg?v=1715028493&width=1445', // Cable HDMI 2.1 2m
  30: 'https://cdn.kemik.gt/2022/10/CH-9417070-WW-Corsair-1200X1200-10-526x526.jpg', // Mouse Pad Corsair MM700 RGB
}

export const getImagen = (id) => IMAGENES[id] || null
