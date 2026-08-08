import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Category from "./models/Category.js";
import Product from "./models/Product.js";
import User from "./models/User.js";
import bcrypt from "bcryptjs";

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // 1. Xóa sạch dữ liệu cũ
    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});

    console.log("🧹 Đã dọn dẹp Database cũ...");

    // 2. Tạo tài khoản Admin & User mặc định
    const adminPassword = await bcrypt.hash("Admin@123", 10);
    const userPassword = await bcrypt.hash("User@123", 10);

    await User.create([
      { name: "Quản trị viên", email: "admin@gmail.com", password: adminPassword, role: "admin" },
      { name: "Khách hàng mẫu", email: "user@gmail.com", password: userPassword, role: "user" },
    ]);

    // 3. Tạo Danh mục sản phẩm Laptop & Linh kiện
    const categories = await Category.create([
      { name: "Laptop Gaming", slug: "laptop-gaming", description: "Laptop cấu hình cao chơi game, đồ họa" },
      { name: "Laptop Văn Phòng", slug: "laptop-van-phong", description: "Laptop mỏng nhẹ, pin trâu cho học tập & làm việc" },
      { name: "VGA - Card Đồ Họa", slug: "vga-card-do-hoa", description: "Card màn hình rời NVIDIA & AMD" },
      { name: "CPU - Bộ Vi Xử Lý", slug: "cpu-bo-vi-xu-ly", description: "Vi xử lý Intel Core & AMD Ryzen" },
      { name: "RAM & Ổ Cứng SSD", slug: "ram-ssd", description: "Bộ nhớ trong và ổ cứng lưu trữ tốc độ cao" },
    ]);

    const catMap = Object.fromEntries(categories.map((c) => [c.slug, c._id]));

    // 4. Tạo Sản phẩm chuẩn thông số kỹ thuật (specifications)
    await Product.create([
      {
        name: "Laptop ASUS ROG Strix G16 (2024)",
        brand: "ASUS",
        category: catMap["laptop-gaming"],
        basePrice: 32000000,
        salePrice: 35990000,
        saleDiscount: 10,
        stock: 25,
        sold: 12,
        images: [{ url: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800" }],
        description: "Laptop Gaming ASUS ROG Strix G16 trang bị CPU Intel thế hệ 13 và VGA RTX 4060 cân mọi tựa game AAA.",
        specifications: {
          cpu: "Intel Core i7-13650HX",
          ram: "16GB DDR5 4800MHz",
          vga: "NVIDIA GeForce RTX 4060 8GB",
          storage: "512GB SSD NVMe PCIe 4.0",
          screen: '16 inch FHD+ 165Hz IPS',
        },
      },
      {
        name: "Laptop MSI Katana 15 B13VFK",
        brand: "MSI",
        category: catMap["laptop-gaming"],
        basePrice: 24000000,
        salePrice: 27990000,
        saleDiscount: 5,
        stock: 30,
        sold: 18,
        images: [{ url: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800" }],
        description: "MSI Katana 15 mạnh mẽ đỉnh cao với bàn phím RGB 4 vùng ấn tượng.",
        specifications: {
          cpu: "Intel Core i7-13620H",
          ram: "16GB DDR5 5200MHz",
          vga: "NVIDIA GeForce RTX 4060 8GB",
          storage: "1TB SSD NVMe PCIe 4.0",
          screen: '15.6 inch FHD 144Hz IPS',
        },
      },
      {
        name: "Laptop Lenovo ThinkPad X1 Carbon Gen 11",
        brand: "Lenovo",
        category: catMap["laptop-van-phong"],
        basePrice: 38000000,
        salePrice: 42990000,
        saleDiscount: 8,
        stock: 15,
        sold: 5,
        images: [{ url: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800" }],
        description: "Dòng laptop doanh nhân siêu bền nhẹ chuẩn quân đội, bàn phím gõ êm nhất thế giới.",
        specifications: {
          cpu: "Intel Core i7-1355U",
          ram: "32GB LPDDR5 5200MHz",
          vga: "Intel Iris Xe Graphics",
          storage: "1TB SSD NVMe PCIe 4.0",
          screen: '14 inch 2.8K OLED Touch',
        },
      },
      {
        name: "Card màn hình ASUS ROG Strix RTX 4070 Ti SUPER 16GB",
        brand: "ASUS",
        category: catMap["vga-card-do-hoa"],
        basePrice: 22000000,
        salePrice: 25490000,
        saleDiscount: 0,
        stock: 10,
        sold: 3,
        images: [{ url: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800" }],
        description: "VGA đồ họa cao cấp hiệu năng vượt trội cho Gaming 4K và xử lý AI đồ họa nặng.",
        specifications: {
          vga: "NVIDIA GeForce RTX 4070 Ti SUPER",
          ram: "16GB GDDR6X",
          psu: "Khuyên dùng Nguồn 750W trở lên",
        },
      },
      {
        name: "SSD Kingston NV2 1TB NVMe PCIe 4.0",
        brand: "Kingston",
        category: catMap["ram-ssd"],
        basePrice: 1200000,
        salePrice: 1590000,
        saleDiscount: 15,
        stock: 100,
        sold: 45,
        images: [{ url: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800" }],
        description: "Ổ cứng SSD M.2 NVMe tốc độ đọc 3500MB/s giúp máy tính khởi động và load game tức thì.",
        specifications: {
          storage: "1TB M.2 2280 NVMe PCIe Gen 4x4",
        },
      },
    ]);

    console.log("✅ Seed dữ liệu Laptop & Linh kiện thành công!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi khi seed dữ liệu:", error);
    process.exit(1);
  }
};

seedData();