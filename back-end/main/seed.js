require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Category = require("./models/Category");
const Product = require("./models/Product");
const ProductVariant = require("./models/ProductVariant");
const User = require("./models/User");
const slugify = require("./lib/slugify");

const LOCAL = (name) => `/products/${name}.jpg`;
const IMG = (id, w = 800) => `https://images.unsplash.com/${id}?w=${w}&q=80`;

// Ảnh Unsplash đã kiểm tra HTTP 200 — gom lại để tái dùng theo nhóm sản phẩm
const PIC = {
  gaming1: IMG("photo-1603302576837-37561b2e2302"),
  gaming2: IMG("photo-1588872657578-7efd1f1555ed"),
  gaming3: IMG("photo-1591488320449-011701bb6704"),
  gaming4: IMG("photo-1615663245857-ac93bb7c39e7"),
  office1: IMG("photo-1541807084-5c52b6b3adef"),
  office2: IMG("photo-1496181133206-80ce9b88a853"),
  office3: IMG("photo-1517336714731-489689fd1ca8"),
  office4: IMG("photo-1531297484001-80022131f5a1"),
  creator1: IMG("photo-1527443224154-c4a3942d3acf"),
  creator2: IMG("photo-1593642632823-8f785ba67e45"),
  vga1: IMG("photo-1587202372775-e229f172b9d7"),
  vga2: IMG("photo-1591488320449-011701bb6704"),
  cpu1: IMG("photo-1555680202-c86f0e12f086"),
  cpu2: IMG("photo-1518770660439-4636190af475"),
  ssd1: IMG("photo-1597872200969-2b65d56bd16b"),
  ssd2: IMG("photo-1625842268584-8f3296236761"),
  monitor1: IMG("photo-1527814050087-3793815479db"),
  monitor2: IMG("photo-1593305841991-05c297ba4575"),
  // Phụ kiện dùng ảnh tải sẵn trong front-end/main/public/products/ — ảnh Unsplash
  // chung chung trước đó cho ra ghế thành máy ảnh, tai nghe thành bàn làm việc.
  keyboard: LOCAL("keyboard-keychron"),
  mouse:    LOCAL("mouse-logitech"),
  headset:  LOCAL("headset-gaming"),
  chair:    LOCAL("chair-ergonomic"),
  deskmat:  LOCAL("deskmat-xxl"),
};

const CATEGORIES = [
  { name: "Laptop Gaming",         description: "Laptop cấu hình cao, tản nhiệt mạnh, cân mọi tựa game AAA",     sortOrder: 1, imageUrl: PIC.gaming1 },
  { name: "Laptop Văn Phòng",      description: "Mỏng nhẹ, pin trâu, tối ưu cho học tập và làm việc",             sortOrder: 2, imageUrl: PIC.office1 },
  { name: "Laptop Đồ Họa",         description: "Workstation màn hình chuẩn màu cho dựng phim, 3D, thiết kế",     sortOrder: 3, imageUrl: PIC.creator1 },
  { name: "VGA Card Đồ Họa",       description: "Card màn hình rời NVIDIA GeForce & AMD Radeon",                  sortOrder: 4, imageUrl: PIC.vga1 },
  { name: "CPU Bộ Vi Xử Lý",       description: "Vi xử lý Intel Core & AMD Ryzen các thế hệ mới nhất",            sortOrder: 5, imageUrl: PIC.cpu1 },
  { name: "RAM & Ổ Cứng SSD",      description: "Bộ nhớ trong và ổ cứng lưu trữ tốc độ cao",                      sortOrder: 6, imageUrl: PIC.ssd1 },
  { name: "Màn Hình Máy Tính",     description: "Màn hình gaming tần số quét cao và màn đồ họa chuẩn màu",        sortOrder: 7, imageUrl: PIC.monitor1 },
  { name: "Phụ Kiện Gaming",       description: "Chuột, bàn phím cơ, tai nghe và ghế công thái học",              sortOrder: 8, imageUrl: PIC.keyboard },
];

// basePrice = giá nhập (ẩn với khách) · salePrice = giá niêm yết · saleDiscount = % giảm trên salePrice
// variants: [{ name, price, stock, attributes }] — sku sinh tự động từ slug sản phẩm
const PRODUCTS = [
  // ─── Laptop Gaming ──────────────────────────────────────────────────────────
  {
    name: "Laptop ASUS ROG Strix G16 G614JI", brand: "ASUS", cat: "laptop-gaming",
    basePrice: 32000000, salePrice: 41990000, saleDiscount: 12, stock: 25, sold: 47, img: PIC.gaming1,
    description: "ROG Strix G16 với Intel Core i7-13650HX và RTX 4070, màn 165Hz cùng hệ tản nhiệt ROG Intelligent Cooling giữ máy mát trong nhiều giờ chiến game.",
    specs: { cpu: "Intel Core i7-13650HX", ram: "16GB DDR5 4800MHz", vga: "NVIDIA GeForce RTX 4070 8GB", storage: "1TB SSD NVMe PCIe 4.0", screen: "16 inch FHD+ 165Hz IPS" },
    tags: ["gaming", "rtx-4070", "asus", "165hz"],
    variants: [
      { name: "16GB / 512GB", price: 39990000, stock: 12, attributes: { ram: "16GB", storage: "512GB" } },
      { name: "16GB / 1TB",   price: 41990000, stock: 9,  attributes: { ram: "16GB", storage: "1TB" } },
      { name: "32GB / 1TB",   price: 45990000, stock: 4,  attributes: { ram: "32GB", storage: "1TB" } },
    ],
  },
  {
    name: "Laptop MSI Katana 15 B13VFK", brand: "MSI", cat: "laptop-gaming",
    basePrice: 24000000, salePrice: 29990000, saleDiscount: 8, stock: 30, sold: 62, img: PIC.gaming2,
    description: "MSI Katana 15 cân bằng giữa giá và hiệu năng, RTX 4060 8GB cùng bàn phím RGB 4 vùng, lựa chọn quốc dân trong tầm giá 30 triệu.",
    specs: { cpu: "Intel Core i7-13620H", ram: "16GB DDR5 5200MHz", vga: "NVIDIA GeForce RTX 4060 8GB", storage: "1TB SSD NVMe PCIe 4.0", screen: "15.6 inch FHD 144Hz IPS" },
    tags: ["gaming", "rtx-4060", "msi"],
    variants: [
      { name: "16GB / 512GB", price: 27990000, stock: 18, attributes: { ram: "16GB", storage: "512GB" } },
      { name: "16GB / 1TB",   price: 29990000, stock: 12, attributes: { ram: "16GB", storage: "1TB" } },
    ],
  },
  {
    name: "Laptop Acer Predator Helios Neo 16", brand: "Acer", cat: "laptop-gaming",
    basePrice: 28500000, salePrice: 35990000, saleDiscount: 10, stock: 18, sold: 33, img: PIC.gaming3,
    description: "Predator Helios Neo 16 với màn 16 inch WQXGA 165Hz và tản nhiệt quạt AeroBlade 5th Gen, đủ sức kéo game AAA ở mức thiết lập cao.",
    specs: { cpu: "Intel Core i7-13650HX", ram: "16GB DDR5 5600MHz", vga: "NVIDIA GeForce RTX 4060 8GB", storage: "512GB SSD NVMe PCIe 4.0", screen: "16 inch WQXGA 165Hz IPS" },
    tags: ["gaming", "rtx-4060", "acer", "wqxga"],
  },
  {
    name: "Laptop Lenovo Legion Pro 5 16IRX9", brand: "Lenovo", cat: "laptop-gaming",
    basePrice: 36000000, salePrice: 45990000, saleDiscount: 7, stock: 12, sold: 21, img: PIC.gaming4,
    description: "Legion Pro 5 dùng Core i9-14900HX và RTX 4070 140W, màn 16 inch 2K 240Hz, cỗ máy chơi game eSports lẫn sáng tạo nội dung.",
    specs: { cpu: "Intel Core i9-14900HX", ram: "32GB DDR5 5600MHz", vga: "NVIDIA GeForce RTX 4070 8GB", storage: "1TB SSD NVMe PCIe 4.0", screen: "16 inch WQXGA 240Hz IPS" },
    tags: ["gaming", "rtx-4070", "lenovo", "240hz", "hot"],
    variants: [
      { name: "16GB / 1TB", price: 43990000, stock: 7, attributes: { ram: "16GB", storage: "1TB" } },
      { name: "32GB / 1TB", price: 45990000, stock: 5, attributes: { ram: "32GB", storage: "1TB" } },
    ],
  },
  {
    name: "Laptop HP Victus 16 R0127TX", brand: "HP", cat: "laptop-gaming",
    basePrice: 21000000, salePrice: 26490000, saleDiscount: 15, stock: 22, sold: 55, img: PIC.gaming2,
    description: "HP Victus 16 thiết kế tối giản đi làm được đi chơi cũng được, RTX 4050 6GB đủ chiến mọi tựa game phổ thông ở FHD.",
    specs: { cpu: "Intel Core i5-13500HX", ram: "16GB DDR5 4800MHz", vga: "NVIDIA GeForce RTX 4050 6GB", storage: "512GB SSD NVMe PCIe 4.0", screen: "16.1 inch FHD 144Hz IPS" },
    tags: ["gaming", "rtx-4050", "hp", "sinh-vien"],
  },
  {
    name: "Laptop Gigabyte G5 KF5", brand: "Gigabyte", cat: "laptop-gaming",
    basePrice: 19500000, salePrice: 24990000, saleDiscount: 18, stock: 26, sold: 71, img: PIC.gaming1,
    description: "Gigabyte G5 KF5 giá tốt nhất phân khúc có RTX 4060, bàn phím full-size có phím số, phù hợp sinh viên vừa học vừa chơi.",
    specs: { cpu: "Intel Core i5-13500H", ram: "16GB DDR5 4800MHz", vga: "NVIDIA GeForce RTX 4060 8GB", storage: "512GB SSD NVMe PCIe 4.0", screen: "15.6 inch FHD 144Hz IPS" },
    tags: ["gaming", "rtx-4060", "gigabyte", "gia-tot"],
  },
  {
    name: "Laptop ASUS TUF Gaming A15 FA507NV", brand: "ASUS", cat: "laptop-gaming",
    basePrice: 22000000, salePrice: 27990000, saleDiscount: 12, stock: 20, sold: 40, img: PIC.gaming3,
    description: "TUF Gaming A15 đạt chuẩn độ bền quân đội MIL-STD-810H, chip Ryzen 7 7735HS mát mẻ và tiết kiệm pin hơn đối thủ Intel cùng tầm.",
    specs: { cpu: "AMD Ryzen 7 7735HS", ram: "16GB DDR5 4800MHz", vga: "NVIDIA GeForce RTX 4060 8GB", storage: "512GB SSD NVMe PCIe 4.0", screen: "15.6 inch FHD 144Hz IPS" },
    tags: ["gaming", "rtx-4060", "asus", "amd", "ben-bi"],
  },

  // ─── Laptop Văn Phòng ───────────────────────────────────────────────────────
  {
    name: "Laptop Lenovo ThinkPad X1 Carbon Gen 11", brand: "Lenovo", cat: "laptop-van-phong",
    basePrice: 38000000, salePrice: 46990000, saleDiscount: 8, stock: 15, sold: 18, img: PIC.office1,
    description: "ThinkPad X1 Carbon Gen 11 nặng chỉ 1.12kg, đạt chuẩn quân đội và có bàn phím gõ êm bậc nhất, mẫu laptop doanh nhân kinh điển.",
    specs: { cpu: "Intel Core i7-1355U", ram: "32GB LPDDR5 5200MHz", vga: "Intel Iris Xe Graphics", storage: "1TB SSD NVMe PCIe 4.0", screen: "14 inch 2.8K OLED cảm ứng" },
    tags: ["van-phong", "thinkpad", "mong-nhe", "oled", "hot"],
    variants: [
      { name: "16GB / 512GB", price: 42990000, stock: 8, attributes: { ram: "16GB", storage: "512GB" } },
      { name: "32GB / 1TB",   price: 46990000, stock: 7, attributes: { ram: "32GB", storage: "1TB" } },
    ],
  },
  {
    name: "Laptop Dell XPS 13 9340", brand: "Dell", cat: "laptop-van-phong",
    basePrice: 34000000, salePrice: 42990000, saleDiscount: 10, stock: 14, sold: 25, img: PIC.office2,
    description: "Dell XPS 13 9340 với chip Core Ultra 7 155H tích hợp NPU cho tác vụ AI, viền màn hình siêu mỏng InfinityEdge và vỏ nhôm nguyên khối.",
    specs: { cpu: "Intel Core Ultra 7 155H", ram: "16GB LPDDR5x 6400MHz", vga: "Intel Arc Graphics", storage: "512GB SSD NVMe PCIe 4.0", screen: "13.4 inch FHD+ 120Hz" },
    tags: ["van-phong", "dell", "mong-nhe", "core-ultra"],
  },
  {
    name: "Laptop HP Pavilion 15 eg3097TU", brand: "HP", cat: "laptop-van-phong",
    basePrice: 14500000, salePrice: 18490000, saleDiscount: 14, stock: 40, sold: 88, img: PIC.office3,
    description: "HP Pavilion 15 là lựa chọn văn phòng phổ thông đáng tiền, Core i5 gen 13 chạy mượt Office và họp Teams cả ngày.",
    specs: { cpu: "Intel Core i5-1335U", ram: "16GB DDR4 3200MHz", vga: "Intel Iris Xe Graphics", storage: "512GB SSD NVMe PCIe 4.0", screen: "15.6 inch FHD IPS" },
    tags: ["van-phong", "hp", "gia-tot", "sinh-vien"],
  },
  {
    name: "Laptop ASUS Zenbook 14 OLED UX3405MA", brand: "ASUS", cat: "laptop-van-phong",
    basePrice: 26000000, salePrice: 32990000, saleDiscount: 12, stock: 19, sold: 36, img: PIC.office4,
    description: "Zenbook 14 OLED nặng 1.2kg với màn 3K 120Hz rực rỡ và pin 75Wh dùng cả ngày không cần sạc.",
    specs: { cpu: "Intel Core Ultra 7 155H", ram: "16GB LPDDR5x 7467MHz", vga: "Intel Arc Graphics", storage: "1TB SSD NVMe PCIe 4.0", screen: "14 inch 3K OLED 120Hz" },
    tags: ["van-phong", "asus", "oled", "mong-nhe"],
  },
  {
    name: "Laptop Acer Aspire 5 A515", brand: "Acer", cat: "laptop-van-phong",
    basePrice: 11000000, salePrice: 14490000, saleDiscount: 16, stock: 45, sold: 112, img: PIC.office2,
    description: "Acer Aspire 5 giá dưới 15 triệu, nâng cấp RAM và SSD dễ dàng, phù hợp sinh viên năm nhất cần một máy học tập bền bỉ.",
    specs: { cpu: "Intel Core i5-1235U", ram: "8GB DDR4 3200MHz", vga: "Intel Iris Xe Graphics", storage: "512GB SSD NVMe PCIe 3.0", screen: "15.6 inch FHD IPS" },
    tags: ["van-phong", "acer", "gia-re", "sinh-vien"],
    variants: [
      { name: "8GB / 512GB",  price: 14490000, stock: 30, attributes: { ram: "8GB",  storage: "512GB" } },
      { name: "16GB / 512GB", price: 16490000, stock: 15, attributes: { ram: "16GB", storage: "512GB" } },
    ],
  },
  {
    name: "Laptop LG Gram 16 Z90S", brand: "LG", cat: "laptop-van-phong",
    basePrice: 30000000, salePrice: 37990000, saleDiscount: 9, stock: 10, sold: 14, img: PIC.office1,
    description: "LG Gram 16 chỉ nặng 1.19kg dù màn hình tới 16 inch, pin 77Wh và vỏ magie siêu nhẹ cho người hay di chuyển.",
    specs: { cpu: "Intel Core Ultra 7 155H", ram: "16GB LPDDR5x 6400MHz", vga: "Intel Arc Graphics", storage: "512GB SSD NVMe PCIe 4.0", screen: "16 inch WQXGA IPS" },
    tags: ["van-phong", "lg", "sieu-nhe"],
  },
  {
    name: "Laptop MSI Modern 14 C13M", brand: "MSI", cat: "laptop-van-phong",
    basePrice: 12500000, salePrice: 15990000, saleDiscount: 13, stock: 32, sold: 64, img: PIC.office3,
    description: "MSI Modern 14 nhẹ 1.4kg vỏ nhôm, đủ cổng USB-C lẫn HDMI, đáp ứng tốt nhu cầu văn phòng cơ bản với giá mềm.",
    specs: { cpu: "Intel Core i5-1335U", ram: "16GB DDR4 3200MHz", vga: "Intel Iris Xe Graphics", storage: "512GB SSD NVMe PCIe 4.0", screen: "14 inch FHD IPS" },
    tags: ["van-phong", "msi", "gia-tot"],
  },

  // ─── Laptop Đồ Họa ──────────────────────────────────────────────────────────
  {
    name: "Laptop Dell Precision 5690 Workstation", brand: "Dell", cat: "laptop-do-hoa",
    basePrice: 62000000, salePrice: 78990000, saleDiscount: 6, stock: 6, sold: 4, img: PIC.creator1,
    description: "Precision 5690 với card RTX 3500 Ada chuẩn ISV, được các hãng phần mềm CAD/CAM chứng nhận, dành cho kỹ sư và studio dựng phim.",
    specs: { cpu: "Intel Core Ultra 7 165H", ram: "32GB DDR5 5600MHz", vga: "NVIDIA RTX 3500 Ada 12GB", storage: "1TB SSD NVMe PCIe 4.0", screen: "16 inch 4K+ OLED cảm ứng" },
    tags: ["do-hoa", "workstation", "dell", "isv"],
  },
  {
    name: "Laptop ASUS ProArt Studiobook 16 OLED", brand: "ASUS", cat: "laptop-do-hoa",
    basePrice: 48000000, salePrice: 59990000, saleDiscount: 8, stock: 8, sold: 9, img: PIC.creator2,
    description: "ProArt Studiobook 16 có màn 3.2K OLED chuẩn màu Pantone và núm xoay ASUS Dial điều khiển Adobe, sinh ra cho dân dựng phim.",
    specs: { cpu: "Intel Core i9-13980HX", ram: "32GB DDR5 4800MHz", vga: "NVIDIA GeForce RTX 4070 8GB", storage: "1TB SSD NVMe PCIe 4.0", screen: "16 inch 3.2K OLED 120Hz" },
    tags: ["do-hoa", "asus", "oled", "pantone", "hot"],
    variants: [
      { name: "32GB / 1TB", price: 59990000, stock: 5, attributes: { ram: "32GB", storage: "1TB" } },
      { name: "64GB / 2TB", price: 71990000, stock: 3, attributes: { ram: "64GB", storage: "2TB" } },
    ],
  },
  {
    name: "Laptop HP ZBook Firefly 14 G11", brand: "HP", cat: "laptop-do-hoa",
    basePrice: 40000000, salePrice: 49990000, saleDiscount: 10, stock: 9, sold: 7, img: PIC.creator1,
    description: "ZBook Firefly 14 gói sức mạnh workstation vào thân máy 1.4kg, card RTX A500 chạy được SolidWorks và Revit khi đi công trình.",
    specs: { cpu: "Intel Core Ultra 7 155H", ram: "32GB DDR5 5600MHz", vga: "NVIDIA RTX A500 4GB", storage: "1TB SSD NVMe PCIe 4.0", screen: "14 inch WUXGA IPS chống chói" },
    tags: ["do-hoa", "workstation", "hp", "mong-nhe"],
  },
  {
    name: "Laptop Lenovo ThinkPad P1 Gen 7", brand: "Lenovo", cat: "laptop-do-hoa",
    basePrice: 55000000, salePrice: 68990000, saleDiscount: 7, stock: 5, sold: 3, img: PIC.creator2,
    description: "ThinkPad P1 Gen 7 mỏng 15.4mm nhưng chứa RTX 3000 Ada, màn 4K OLED cho render 3D và mô phỏng kỹ thuật nặng.",
    specs: { cpu: "Intel Core Ultra 9 185H", ram: "64GB DDR5 5600MHz", vga: "NVIDIA RTX 3000 Ada 8GB", storage: "2TB SSD NVMe PCIe 4.0", screen: "16 inch 4K OLED cảm ứng" },
    tags: ["do-hoa", "workstation", "thinkpad", "4k"],
  },

  // ─── VGA Card Đồ Họa ────────────────────────────────────────────────────────
  {
    name: "VGA ASUS ROG Strix RTX 4070 Ti SUPER 16GB", brand: "ASUS", cat: "vga-card-do-hoa",
    basePrice: 22000000, salePrice: 27490000, saleDiscount: 5, stock: 10, sold: 16, img: PIC.vga1,
    description: "ROG Strix RTX 4070 Ti SUPER 16GB VRAM cân gaming 4K và render AI, tản nhiệt 3 quạt Axial-tech chạy êm dưới 65 độ.",
    specs: { vga: "NVIDIA GeForce RTX 4070 Ti SUPER", ram: "16GB GDDR6X", psu: "Khuyên dùng nguồn 750W trở lên" },
    tags: ["vga", "nvidia", "rtx-4070ti", "4k"],
  },
  {
    name: "VGA MSI GeForce RTX 4060 Ventus 2X 8GB", brand: "MSI", cat: "vga-card-do-hoa",
    basePrice: 6800000, salePrice: 8990000, saleDiscount: 10, stock: 35, sold: 74, img: PIC.vga2,
    description: "RTX 4060 Ventus 2X gọn nhẹ vừa mọi case mini-ITX, chỉ ăn 115W nên dùng lại nguồn cũ 450W vẫn chạy tốt.",
    specs: { vga: "NVIDIA GeForce RTX 4060", ram: "8GB GDDR6", psu: "Khuyên dùng nguồn 550W trở lên" },
    tags: ["vga", "nvidia", "rtx-4060", "gia-tot"],
  },
  {
    name: "VGA Gigabyte AORUS RTX 4080 SUPER Master 16GB", brand: "Gigabyte", cat: "vga-card-do-hoa",
    basePrice: 32000000, salePrice: 39990000, saleDiscount: 4, stock: 6, sold: 8, img: PIC.vga1,
    description: "AORUS RTX 4080 SUPER Master là card đầu bảng cho gaming 4K 120fps, có màn LCD phụ hiển thị nhiệt độ và quạt Bionic Blade.",
    specs: { vga: "NVIDIA GeForce RTX 4080 SUPER", ram: "16GB GDDR6X", psu: "Khuyên dùng nguồn 850W trở lên" },
    tags: ["vga", "nvidia", "rtx-4080", "cao-cap"],
  },
  {
    name: "VGA Sapphire PULSE Radeon RX 7800 XT 16GB", brand: "Sapphire", cat: "vga-card-do-hoa",
    basePrice: 13500000, salePrice: 16990000, saleDiscount: 8, stock: 14, sold: 22, img: PIC.vga2,
    description: "RX 7800 XT 16GB VRAM cho hiệu năng trên giá tốt nhất phân khúc 17 triệu, rất hợp gaming 2K ở thiết lập Ultra.",
    specs: { vga: "AMD Radeon RX 7800 XT", ram: "16GB GDDR6", psu: "Khuyên dùng nguồn 700W trở lên" },
    tags: ["vga", "amd", "radeon", "2k"],
  },
  {
    name: "VGA ASUS Dual GeForce RTX 4070 SUPER 12GB", brand: "ASUS", cat: "vga-card-do-hoa",
    basePrice: 16000000, salePrice: 19990000, saleDiscount: 7, stock: 12, sold: 19, img: PIC.vga1,
    description: "RTX 4070 SUPER là điểm ngọt cho gaming 2K, DLSS 3 Frame Generation đẩy khung hình lên gấp đôi trong các game hỗ trợ.",
    specs: { vga: "NVIDIA GeForce RTX 4070 SUPER", ram: "12GB GDDR6X", psu: "Khuyên dùng nguồn 650W trở lên" },
    tags: ["vga", "nvidia", "rtx-4070", "2k"],
  },

  // ─── CPU ────────────────────────────────────────────────────────────────────
  {
    name: "CPU Intel Core i5-13400F", brand: "Intel", cat: "cpu-bo-vi-xu-ly",
    basePrice: 3800000, salePrice: 4790000, saleDiscount: 8, stock: 50, sold: 130, img: PIC.cpu1,
    description: "Core i5-13400F 10 nhân 16 luồng, CPU gaming quốc dân, ghép RTX 4060 là có dàn máy 2K không nghẽn cổ chai.",
    specs: { cpu: "Intel Core i5-13400F · 10 nhân 16 luồng · 4.6GHz Turbo · Socket LGA1700" },
    tags: ["cpu", "intel", "lga1700", "gia-tot"],
  },
  {
    name: "CPU Intel Core i7-14700K", brand: "Intel", cat: "cpu-bo-vi-xu-ly",
    basePrice: 8500000, salePrice: 10990000, saleDiscount: 6, stock: 28, sold: 47, img: PIC.cpu2,
    description: "Core i7-14700K 20 nhân 28 luồng mở hệ số ép xung, vừa gaming vừa stream vừa render đều xử lý ngon.",
    specs: { cpu: "Intel Core i7-14700K · 20 nhân 28 luồng · 5.6GHz Turbo · Socket LGA1700" },
    tags: ["cpu", "intel", "lga1700", "ep-xung"],
  },
  {
    name: "CPU AMD Ryzen 7 7800X3D", brand: "AMD", cat: "cpu-bo-vi-xu-ly",
    basePrice: 9200000, salePrice: 11990000, saleDiscount: 5, stock: 20, sold: 58, img: PIC.cpu1,
    description: "Ryzen 7 7800X3D với 96MB cache 3D V-Cache, hiện là CPU chơi game nhanh nhất thế giới mà chỉ tiêu thụ 120W.",
    specs: { cpu: "AMD Ryzen 7 7800X3D · 8 nhân 16 luồng · 5.0GHz Boost · Socket AM5" },
    tags: ["cpu", "amd", "am5", "3d-cache", "hot"],
  },
  {
    name: "CPU AMD Ryzen 5 7600", brand: "AMD", cat: "cpu-bo-vi-xu-ly",
    basePrice: 4200000, salePrice: 5490000, saleDiscount: 10, stock: 38, sold: 91, img: PIC.cpu2,
    description: "Ryzen 5 7600 6 nhân 12 luồng kèm sẵn tản nhiệt Wraith Stealth, lên đời nền tảng AM5 mà không tốn thêm tiền tản.",
    specs: { cpu: "AMD Ryzen 5 7600 · 6 nhân 12 luồng · 5.1GHz Boost · Socket AM5" },
    tags: ["cpu", "amd", "am5", "gia-tot"],
  },
  {
    name: "CPU Intel Core i9-14900K", brand: "Intel", cat: "cpu-bo-vi-xu-ly",
    basePrice: 13500000, salePrice: 16990000, saleDiscount: 4, stock: 11, sold: 15, img: PIC.cpu1,
    description: "Core i9-14900K 24 nhân 32 luồng xung tối đa 6.0GHz, CPU tiêu dùng mạnh nhất của Intel cho máy render chuyên nghiệp.",
    specs: { cpu: "Intel Core i9-14900K · 24 nhân 32 luồng · 6.0GHz Turbo · Socket LGA1700" },
    tags: ["cpu", "intel", "lga1700", "cao-cap"],
  },

  // ─── RAM & SSD ──────────────────────────────────────────────────────────────
  {
    name: "SSD Kingston NV2 1TB NVMe PCIe 4.0", brand: "Kingston", cat: "ram-o-cung-ssd",
    // basePrice = giá nhập của variant rẻ nhất (500GB), vì Order.costAtOrder luôn lấy
    // product.basePrice — đặt cao hơn thì đơn bán bản 500GB sẽ bị tính thành lỗ.
    basePrice: 700000, salePrice: 1690000, saleDiscount: 18, stock: 100, sold: 245, img: PIC.ssd1,
    description: "Kingston NV2 1TB đọc 3500MB/s, nâng cấp rẻ nhất mà thấy khác biệt rõ nhất, máy khởi động dưới 10 giây.",
    specs: { storage: "1TB M.2 2280 NVMe PCIe Gen 4x4 · Đọc 3500MB/s · Ghi 2100MB/s" },
    tags: ["ssd", "kingston", "nvme", "gia-tot"],
    variants: [
      { name: "500GB", price: 990000,  stock: 40, attributes: { storage: "500GB" } },
      { name: "1TB",   price: 1690000, stock: 40, attributes: { storage: "1TB" } },
      { name: "2TB",   price: 3190000, stock: 20, attributes: { storage: "2TB" } },
    ],
  },
  {
    name: "SSD Samsung 990 PRO 2TB NVMe PCIe 4.0", brand: "Samsung", cat: "ram-o-cung-ssd",
    basePrice: 2400000, salePrice: 5490000, saleDiscount: 12, stock: 30, sold: 68, img: PIC.ssd2,
    description: "Samsung 990 PRO đọc 7450MB/s, SSD PCIe 4.0 nhanh nhất hiện nay, hợp cho dựng video 4K và cài game nặng.",
    specs: { storage: "2TB M.2 2280 NVMe PCIe Gen 4x4 · Đọc 7450MB/s · Ghi 6900MB/s" },
    tags: ["ssd", "samsung", "nvme", "cao-cap"],
    variants: [
      { name: "1TB", price: 3190000, stock: 18, attributes: { storage: "1TB" } },
      { name: "2TB", price: 5490000, stock: 12, attributes: { storage: "2TB" } },
    ],
  },
  {
    name: "RAM Corsair Vengeance RGB 32GB DDR5 6000MHz", brand: "Corsair", cat: "ram-o-cung-ssd",
    basePrice: 2600000, salePrice: 3490000, saleDiscount: 14, stock: 42, sold: 97, img: PIC.ssd2,
    description: "Kit 2x16GB DDR5 6000MHz CL30 có sẵn profile EXPO/XMP, chỉ cần bật một dòng trong BIOS là chạy đúng tốc độ.",
    specs: { ram: "32GB (2x16GB) DDR5 6000MHz CL30 · Tản nhiệt nhôm RGB" },
    tags: ["ram", "corsair", "ddr5", "rgb"],
  },
  {
    name: "RAM Kingston Fury Beast 16GB DDR4 3200MHz", brand: "Kingston", cat: "ram-o-cung-ssd",
    basePrice: 950000, salePrice: 1290000, saleDiscount: 15, stock: 60, sold: 156, img: PIC.ssd1,
    description: "Kit 2x8GB DDR4 3200MHz giá mềm, lựa chọn nâng cấp phổ biến nhất cho các dàn máy nền tảng Intel gen 10-12.",
    specs: { ram: "16GB (2x8GB) DDR4 3200MHz CL16 · Tản nhiệt nhôm thấp" },
    tags: ["ram", "kingston", "ddr4", "gia-re"],
  },
  {
    name: "SSD WD Black SN770 1TB NVMe PCIe 4.0", brand: "Western Digital", cat: "ram-o-cung-ssd",
    basePrice: 1600000, salePrice: 2190000, saleDiscount: 16, stock: 48, sold: 121, img: PIC.ssd1,
    description: "WD Black SN770 đọc 5150MB/s không cần DRAM nên chạy mát, rất hợp làm ổ cài game cho laptop gaming.",
    specs: { storage: "1TB M.2 2280 NVMe PCIe Gen 4x4 · Đọc 5150MB/s · Ghi 4900MB/s" },
    tags: ["ssd", "wd", "nvme"],
  },

  // ─── Màn Hình ───────────────────────────────────────────────────────────────
  {
    name: "Màn hình LG UltraGear 27GP850 27 inch 2K 180Hz", brand: "LG", cat: "man-hinh-may-tinh",
    basePrice: 7200000, salePrice: 9490000, saleDiscount: 12, stock: 24, sold: 52, img: PIC.monitor1,
    description: "UltraGear 27GP850 tấm nền Nano IPS 2K 180Hz phản hồi 1ms, vừa nhanh cho FPS vừa đủ màu để chỉnh ảnh.",
    specs: { screen: "27 inch QHD 2560x1440 · Nano IPS · 180Hz · 1ms GtG · G-Sync Compatible" },
    tags: ["man-hinh", "lg", "2k", "180hz", "gaming"],
  },
  {
    name: "Màn hình Dell UltraSharp U2723QE 27 inch 4K", brand: "Dell", cat: "man-hinh-may-tinh",
    basePrice: 12000000, salePrice: 15490000, saleDiscount: 9, stock: 15, sold: 27, img: PIC.monitor2,
    description: "UltraSharp U2723QE tấm IPS Black 4K phủ 98% DCI-P3, có hub USB-C 90W cắm một dây vừa sạc laptop vừa xuất hình.",
    specs: { screen: "27 inch 4K 3840x2160 · IPS Black · 60Hz · USB-C 90W · 98% DCI-P3" },
    tags: ["man-hinh", "dell", "4k", "do-hoa", "usb-c"],
  },
  {
    name: "Màn hình ASUS TUF Gaming VG259QM 25 inch 280Hz", brand: "ASUS", cat: "man-hinh-may-tinh",
    basePrice: 4800000, salePrice: 6290000, saleDiscount: 14, stock: 30, sold: 63, img: PIC.monitor1,
    description: "VG259QM 280Hz với công nghệ ELMB Sync khử bóng mờ, màn hình được nhiều tuyển thủ Valorant và CS2 tin dùng.",
    specs: { screen: "25 inch FHD 1920x1080 · Fast IPS · 280Hz · 1ms GtG · G-Sync Compatible" },
    tags: ["man-hinh", "asus", "280hz", "esports"],
  },
  {
    name: "Màn hình Samsung Odyssey G9 49 inch Ultrawide", brand: "Samsung", cat: "man-hinh-may-tinh",
    basePrice: 22000000, salePrice: 28990000, saleDiscount: 11, stock: 7, sold: 9, img: PIC.monitor2,
    description: "Odyssey G9 49 inch cong 1000R tỉ lệ 32:9, thay thế được hai màn 27 inch mà không có viền chia giữa.",
    specs: { screen: "49 inch DQHD 5120x1440 · VA cong 1000R · 240Hz · 1ms · HDR1000" },
    tags: ["man-hinh", "samsung", "ultrawide", "240hz", "cao-cap"],
  },

  // ─── Phụ Kiện Gaming ────────────────────────────────────────────────────────
  {
    name: "Bàn phím cơ Keychron K8 Pro RGB", brand: "Keychron", cat: "phu-kien-gaming",
    basePrice: 2100000, salePrice: 2890000, saleDiscount: 15, stock: 40, sold: 118, img: PIC.keyboard,
    description: "Keychron K8 Pro hot-swap thay switch không cần hàn, kết nối được 3 thiết bị Bluetooth, dùng chung Mac và Windows.",
    specs: { other: "Layout TKL 87 phím · Hot-swap · Bluetooth 5.1 + USB-C · Switch Gateron G Pro" },
    tags: ["ban-phim", "keychron", "co", "hot-swap"],
    variants: [
      { name: "Red Switch",   price: 2890000, stock: 15, attributes: { switch: "Gateron Red" } },
      { name: "Brown Switch", price: 2890000, stock: 15, attributes: { switch: "Gateron Brown" } },
      { name: "Blue Switch",  price: 2890000, stock: 10, attributes: { switch: "Gateron Blue" } },
    ],
  },
  {
    name: "Chuột Logitech G Pro X Superlight 2", brand: "Logitech", cat: "phu-kien-gaming",
    basePrice: 2600000, salePrice: 3490000, saleDiscount: 12, stock: 35, sold: 143, img: PIC.mouse,
    description: "G Pro X Superlight 2 nặng 60g với cảm biến HERO 2 32K DPI, pin 95 giờ, chuột được nhiều tuyển thủ chuyên nghiệp chọn.",
    specs: { other: "Không dây LIGHTSPEED · 60g · Cảm biến HERO 2 32000 DPI · Pin 95 giờ" },
    tags: ["chuot", "logitech", "khong-day", "esports", "hot"],
    variants: [
      { name: "Đen",   price: 3490000, stock: 18, attributes: { color: "Đen",   colorHex: "#1d1d1f" } },
      { name: "Trắng", price: 3490000, stock: 17, attributes: { color: "Trắng", colorHex: "#f5f5f7" } },
    ],
  },
  {
    name: "Tai nghe SteelSeries Arctis Nova 7", brand: "SteelSeries", cat: "phu-kien-gaming",
    basePrice: 3200000, salePrice: 4290000, saleDiscount: 14, stock: 26, sold: 71, img: PIC.headset,
    description: "Arctis Nova 7 kết nối song song 2.4GHz và Bluetooth, vừa nghe game vừa nghe điện thoại, pin 38 giờ và mic khử ồn AI.",
    specs: { other: "Không dây 2.4GHz + Bluetooth · Driver 40mm · Pin 38 giờ · Mic ClearCast Gen 2" },
    tags: ["tai-nghe", "steelseries", "khong-day"],
  },
  {
    name: "Ghế công thái học Sihoo Doro C300", brand: "Sihoo", cat: "phu-kien-gaming",
    basePrice: 4500000, salePrice: 6490000, saleDiscount: 20, stock: 12, sold: 34, img: PIC.chair,
    description: "Sihoo Doro C300 lưng lưới tự điều chỉnh theo cột sống, tay vịn 4D, ngồi làm 8 tiếng vẫn không mỏi lưng.",
    specs: { other: "Lưng lưới tự thích ứng · Tay vịn 4D · Ngả 128 độ · Tải trọng 150kg" },
    tags: ["ghe", "sihoo", "cong-thai-hoc"],
  },
  {
    name: "Lót chuột Razer Gigantus V2 XXL", brand: "Razer", cat: "phu-kien-gaming",
    basePrice: 380000, salePrice: 590000, saleDiscount: 20, stock: 80, sold: 210, img: PIC.deskmat,
    description: "Lót chuột cỡ XXL 940x410mm trải kín bàn, bề mặt vải dệt mịn và đế cao su chống trượt.",
    specs: { other: "940 x 410 x 4mm · Bề mặt vải micro-weave · Đế cao su chống trượt" },
    tags: ["lot-chuot", "razer", "gia-re"],
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce");
  console.log("✅ Đã kết nối MongoDB");

  await Promise.all([
    Category.deleteMany({}),
    Product.deleteMany({}),
    ProductVariant.deleteMany({}),
    User.deleteMany({}),
  ]);
  console.log("🧹 Đã dọn dẹp Category / Product / ProductVariant / User");

  // ─── 1. Tài khoản ───────────────────────────────────────────────────────────
  const [adminPass, userPass] = await Promise.all([
    bcrypt.hash("Admin@123", 10),
    bcrypt.hash("User@123", 10),
  ]);

  await User.create([
    {
      username: "admin", fullName: "Quản Trị Viên", email: "admin@gmail.com",
      password: adminPass, role: "admin", isVerified: true,
      phone: "0901234567", address: "72 Lê Thánh Tôn, Quận 1, TP HCM",
    },
    {
      username: "khachhang", fullName: "Nguyễn Văn Khách", email: "user@gmail.com",
      password: userPass, role: "user", isVerified: true,
      phone: "0912345678", address: "180 Cao Lỗ, Quận 8, TP HCM",
      loyaltyPoints: 1250,
      addresses: [
        { fullName: "Nguyễn Văn Khách", phone: "0912345678", province: "TP Hồ Chí Minh", district: "Quận 8", ward: "Phường 4", street: "180 Cao Lỗ", isDefault: true },
        { fullName: "Nguyễn Văn Khách", phone: "0912345678", province: "TP Hồ Chí Minh", district: "Quận 1", ward: "Bến Nghé", street: "72 Lê Thánh Tôn", isDefault: false },
      ],
    },
  ]);
  console.log("👤 Đã tạo 2 tài khoản: admin@gmail.com / user@gmail.com");

  // ─── 2. Danh mục ────────────────────────────────────────────────────────────
  const categories = await Category.create(
    CATEGORIES.map((c) => ({ ...c, slug: slugify(c.name), showOnHome: true }))
  );
  const catBySlug = Object.fromEntries(categories.map((c) => [c.slug, c._id]));
  console.log(`📂 Đã tạo ${categories.length} danh mục`);

  // ─── 3. Sản phẩm ────────────────────────────────────────────────────────────
  let variantCount = 0;
  for (const p of PRODUCTS) {
    const categoryId = catBySlug[p.cat];
    if (!categoryId) throw new Error(`Sản phẩm "${p.name}" trỏ tới danh mục không tồn tại: ${p.cat}`);

    const slug = slugify(p.name);
    const product = await Product.create({
      name: p.name,
      slug,
      brand: p.brand,
      category: categoryId,
      description: p.description,
      basePrice: p.basePrice,
      salePrice: p.salePrice,
      saleDiscount: p.saleDiscount,
      stock: p.stock,
      sold: p.sold,
      tags: p.tags || [],
      specifications: p.specs,
      images: [{ url: p.img, isPrimary: true }],
      isActive: true,
    });

    for (const [i, v] of (p.variants || []).entries()) {
      await ProductVariant.create({
        productId: product._id,
        name: v.name,
        sku: `${slug.slice(0, 24).toUpperCase()}-${i + 1}`,
        attributes: v.attributes,
        price: v.price,
        stock: v.stock,
        images: [p.img],
      });
      variantCount++;
    }
  }
  console.log(`💻 Đã tạo ${PRODUCTS.length} sản phẩm và ${variantCount} phiên bản (variant)`);

  await mongoose.disconnect();
  console.log("✅ Seed danh mục + sản phẩm + tài khoản xong!");
}

if (require.main === module) seed().catch(async (err) => {
  console.error("❌ Lỗi khi seed:", err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});

module.exports = { CATEGORIES, PRODUCTS };
