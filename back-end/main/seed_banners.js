require("dotenv").config();
const mongoose = require("mongoose");
const Banner = require("./models/Banner");

// Ảnh nằm trong front-end/main/public/banners/, được Vercel phục vụ ở gốc domain
// front-end. Đường dẫn không bắt đầu bằng /api/ nên resolveImageUrl() giữ nguyên,
// tức là trình duyệt tải thẳng từ origin của FE — không hotlink, không phụ thuộc
// bên thứ ba, và không tốn thêm một vòng request qua backend.
// Nguồn ảnh: Pexels (Pexels License — dùng thương mại tự do, không cần ghi nguồn).
const IMG = (name) => `/banners/${name}.jpg`;

const banners = [
  // ── Trang chủ (carousel) ────────────────────────────────────────────────────
  { title: "Laptop Gaming RTX 40 Series - Giảm đến 18%",     imageUrl: IMG("laptop-gaming-rgb"),   linkUrl: "/categories/laptop-gaming",     position: "homepage", sortOrder: 1 },
  { title: "Laptop Văn Phòng - Mỏng nhẹ, pin cả ngày",       imageUrl: IMG("laptop-office"),       linkUrl: "/categories/laptop-van-phong",  position: "homepage", sortOrder: 2 },
  { title: "Workstation Đồ Họa - Màn chuẩn màu, trả góp 0%", imageUrl: IMG("workstation-editing"), linkUrl: "/categories/laptop-do-hoa",     position: "homepage", sortOrder: 3 },
  { title: "Nâng Cấp SSD NVMe - Giá chỉ từ 990K",            imageUrl: IMG("ssd-nvme"),            linkUrl: "/categories/ram-o-cung-ssd",    position: "homepage", sortOrder: 4 },
  { title: "Màn Hình Ultrawide & Gaming 180Hz",              imageUrl: IMG("monitor-ultrawide"),   linkUrl: "/categories/man-hinh-may-tinh", position: "homepage", sortOrder: 5 },
  { title: "Bàn Phím Cơ & Phụ Kiện Gaming",                  imageUrl: IMG("keyboard-mech"),       linkUrl: "/categories/phu-kien-gaming",   position: "homepage", sortOrder: 6 },

  // ── Banner từng danh mục ────────────────────────────────────────────────────
  { title: "ROG · Legion · Predator - Bảo hành 24 tháng", imageUrl: IMG("laptop-gaming-rig"),   position: "laptop-gaming",     sortOrder: 1 },
  { title: "Laptop Gaming Dưới 25 Triệu",                 imageUrl: IMG("laptop-gaming-desk"),  position: "laptop-gaming",     sortOrder: 2 },
  { title: "Ultrabook Mỏng Nhẹ Dưới 1.3kg",               imageUrl: IMG("laptop-office"),       position: "laptop-van-phong",  sortOrder: 1 },
  { title: "ThinkPad · XPS · Zenbook Chính Hãng",          imageUrl: IMG("laptop-office-night"), position: "laptop-van-phong",  sortOrder: 2 },
  { title: "Màn Hình Chuẩn Màu 100% DCI-P3",              imageUrl: IMG("workstation-editing"), position: "laptop-do-hoa",     sortOrder: 1 },
  { title: "VGA RTX 40 SUPER - Hàng Chính Hãng",          imageUrl: IMG("vga-aorus"),           position: "vga-card-do-hoa",   sortOrder: 1 },
  { title: "Radeon RX 7000 - Hiệu Năng Trên Giá Tiền",    imageUrl: IMG("vga-nvidia"),          position: "vga-card-do-hoa",   sortOrder: 2 },
  { title: "Intel Core & AMD Ryzen Thế Hệ Mới",           imageUrl: IMG("cpu-intel"),           position: "cpu-bo-vi-xu-ly",   sortOrder: 1 },
  { title: "Combo CPU + RAM - Tiết Kiệm Đến 2 Triệu",     imageUrl: IMG("cpu-ram-kit"),         position: "cpu-bo-vi-xu-ly",   sortOrder: 2 },
  { title: "SSD NVMe Gen4 - Đọc Tới 7450MB/s",            imageUrl: IMG("ssd-storage"),         position: "ram-o-cung-ssd",    sortOrder: 1 },
  { title: "Màn Hình Cong 240Hz Cho Game Thủ",            imageUrl: IMG("monitor-curved"),      position: "man-hinh-may-tinh", sortOrder: 1 },
  { title: "Bàn Phím Cơ Hot-swap - Bảo Hành 12 Tháng",    imageUrl: IMG("keyboard-mech"),       position: "phu-kien-gaming",   sortOrder: 1 },
];

async function main() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce");
  console.log("✅ Đã kết nối MongoDB");

  await Banner.deleteMany({});
  await Banner.insertMany(banners.map((b) => ({ linkUrl: "", isActive: true, ...b })));
  console.log(`🖼️  Đã tạo ${banners.length} banner`);

  await mongoose.disconnect();
}

if (require.main === module) main().catch(async (err) => {
  console.error("❌ Lỗi khi seed banner:", err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});

module.exports = { banners };
