require("dotenv").config();
const mongoose = require("mongoose");
const FlashSale = require("./models/FlashSale");
const Product = require("./models/Product");

const day = (d) => new Date(Date.now() + d * 86400000);
const hour = (h) => new Date(Date.now() + h * 3600000);

// Tham chiếu sản phẩm bằng slug (không phải thứ tự insert) — slug sai sẽ báo lỗi
// ngay khi seed, thay vì âm thầm giảm giá nhầm một sản phẩm khác.
const PROGRAMS = [
  {
    name: "Flash Sale Hôm Nay - Săn Deal Giờ Vàng",
    description: "Giảm sốc trong 12 giờ, số lượng có hạn, hết là hết",
    startsAt: hour(-2), endsAt: hour(12), isActive: true,
    products: [
      { slug: "laptop-msi-katana-15-b13vfk",         discountType: "percent", discountValue: 15,     quantity: 30, sold: 19 },
      { slug: "laptop-gigabyte-g5-kf5",              discountType: "percent", discountValue: 17,     quantity: 25, sold: 21 },
      { slug: "ssd-kingston-nv2-1tb-nvme-pcie-40",   discountType: "fixed",   discountValue: 400000, quantity: 60, sold: 47 },
      { slug: "chuot-logitech-g-pro-x-superlight-2", discountType: "percent", discountValue: 20,     quantity: 40, sold: 33 },
    ],
  },
  {
    name: "Sale Cuối Tuần - Laptop Văn Phòng",
    description: "Ưu đãi cho dân văn phòng và sinh viên, áp dụng 3 ngày",
    startsAt: hour(-24), endsAt: day(3), isActive: true,
    products: [
      { slug: "laptop-hp-pavilion-15-eg3097tu", discountType: "percent", discountValue: 18,      quantity: 40, sold: 12 },
      { slug: "laptop-acer-aspire-5-a515",      discountType: "percent", discountValue: 20,      quantity: 35, sold: 16 },
      { slug: "laptop-msi-modern-14-c13m",      discountType: "fixed",   discountValue: 1500000, quantity: 20, sold: 6 },
    ],
  },
  {
    name: "Siêu Sale Linh Kiện - Sắp Diễn Ra",
    description: "Chương trình bắt đầu sau 3 ngày nữa, đặt lịch nhắc ngay",
    startsAt: day(3), endsAt: day(6), isActive: true,
    products: [
      { slug: "vga-msi-geforce-rtx-4060-ventus-2x-8gb",        discountType: "percent", discountValue: 15,     quantity: 20, sold: 0 },
      { slug: "cpu-intel-core-i5-13400f",                      discountType: "fixed",   discountValue: 500000, quantity: 30, sold: 0 },
      { slug: "ram-corsair-vengeance-rgb-32gb-ddr5-6000mhz",   discountType: "percent", discountValue: 18,     quantity: 25, sold: 0 },
    ],
  },
  {
    name: "Flash Sale Tháng Trước - Đã Kết Thúc",
    description: "Chương trình đã đóng, giữ lại để xem lịch sử trong trang quản trị",
    startsAt: day(-40), endsAt: day(-12), isActive: false,
    products: [
      { slug: "man-hinh-asus-tuf-gaming-vg259qm-25-inch-280hz", discountType: "percent", discountValue: 12, quantity: 40, sold: 38 },
    ],
  },
];

async function main() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce");
  console.log("✅ Đã kết nối MongoDB");

  const products = await Product.find({ isActive: true, deletedAt: null }).select("slug").lean();
  if (products.length === 0) {
    console.log("❌ Chưa có sản phẩm nào. Chạy `node seed.js` trước.");
    return mongoose.disconnect();
  }
  const idBySlug = Object.fromEntries(products.map((p) => [p.slug, p._id]));

  // Xoá flash fields cũ trên Product để lần seed lại không để sót giá flash mồ côi
  await Product.updateMany(
    { isFlashSale: true },
    { $unset: { isFlashSale: "", flashSalePrice: "", flashSaleEndsAt: "" } }
  );
  await FlashSale.deleteMany({});
  console.log("🗑️  Đã xoá flash sale cũ");

  for (const program of PROGRAMS) {
    const items = program.products.map(({ slug, ...rest }) => {
      const productId = idBySlug[slug];
      if (!productId) throw new Error(`Flash sale "${program.name}" trỏ tới slug không tồn tại: ${slug}`);
      return { productId, ...rest };
    });
    // create() chứ không insertMany() — hook post("save") mới chạy để đồng bộ
    // isFlashSale / flashSalePrice / flashSaleEndsAt sang Product cho lib/pricing đọc.
    await FlashSale.create({ ...program, products: items });
  }

  const synced = await Product.countDocuments({ isFlashSale: true });
  const running = PROGRAMS.filter((p) => p.isActive && p.startsAt <= new Date() && p.endsAt > new Date()).length;
  console.log(`⚡ Đã tạo ${PROGRAMS.length} flash sale (${running} đang chạy) · ${synced} sản phẩm có giá flash`);

  await mongoose.disconnect();
}

if (require.main === module) main().catch(async (err) => {
  console.error("❌ Lỗi khi seed flash sale:", err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});

module.exports = { PROGRAMS };
