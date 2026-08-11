// Kiểm tra dữ liệu seed khớp schema Mongoose — chạy offline, KHÔNG cần kết nối DB.
// Bắt đúng lớp lỗi từng có: field không tồn tại trong schema (Order.isPaid),
// sai tên field (User.name thay vì fullName), slug danh mục lệch khỏi sản phẩm.
//
//   node test_seeds.js
require("dotenv").config();
const assert = require("assert");
const mongoose = require("mongoose");

const Category = require("./models/Category");
const Product = require("./models/Product");
const Banner = require("./models/Banner");
const Voucher = require("./models/Voucher");
const ShippingZone = require("./models/ShippingZone");
const Order = require("./models/Order");

const slugify = require("./lib/slugify");
const { getEffectivePrice } = require("./lib/pricing");
const { CATEGORIES, PRODUCTS } = require("./seed");
const { banners } = require("./seed_banners");
const { vouchers } = require("./seed_vouchers");
const { zones } = require("./seed_shipping");
const { PROGRAMS } = require("./seed_flashsales");

// specifications là object lồng nên schema.paths phẳng thành "specifications.cpu"...
const SPEC_KEYS = new Set(
  Object.keys(Product.schema.paths)
    .filter((p) => p.startsWith("specifications."))
    .map((p) => p.slice("specifications.".length))
);

const check = (Model, doc, label) => {
  const err = new Model(doc).validateSync();
  assert.strictEqual(err, undefined, `${label}: ${err?.message}`);
};

// Mongoose bỏ qua field lạ khi validate → so khớp key thủ công mới bắt được typo
const assertNoUnknownKeys = (Model, doc, label) => {
  const known = new Set(Object.keys(Model.schema.paths).map((p) => p.split(".")[0]));
  for (const key of Object.keys(doc)) {
    assert.ok(known.has(key), `${label}: field "${key}" không có trong schema ${Model.modelName}`);
  }
};

// ─── Danh mục ─────────────────────────────────────────────────────────────────
const catSlugs = new Set(CATEGORIES.map((c) => slugify(c.name)));
assert.strictEqual(catSlugs.size, CATEGORIES.length, "Có 2 danh mục sinh ra cùng một slug");
CATEGORIES.forEach((c) => check(Category, { ...c, slug: slugify(c.name) }, `Danh mục "${c.name}"`));

// ─── Sản phẩm ─────────────────────────────────────────────────────────────────
const productSlugs = new Set();
for (const p of PRODUCTS) {
  const slug = slugify(p.name);
  assert.ok(catSlugs.has(p.cat), `Sản phẩm "${p.name}" trỏ tới danh mục không tồn tại: ${p.cat}`);
  assert.ok(!productSlugs.has(slug), `Trùng slug sản phẩm: ${slug}`);
  productSlugs.add(slug);

  // basePrice là giá nhập — bán dưới giá này là lỗ, ProductController cũng chặn
  assert.ok(p.salePrice > p.basePrice, `"${p.name}": salePrice phải lớn hơn basePrice`);
  const afterDiscount = Math.round(p.salePrice * (1 - p.saleDiscount / 100));
  assert.ok(afterDiscount > p.basePrice, `"${p.name}": giá sau giảm ${p.saleDiscount}% đã thấp hơn giá nhập`);

  for (const k of Object.keys(p.specs)) {
    assert.ok(SPEC_KEYS.has(k), `"${p.name}": specifications.${k} không có trong schema`);
  }

  check(Product, {
    name: p.name, slug, brand: p.brand, description: p.description,
    category: new mongoose.Types.ObjectId(),
    basePrice: p.basePrice, salePrice: p.salePrice, saleDiscount: p.saleDiscount,
    stock: p.stock, sold: p.sold, tags: p.tags || [], specifications: p.specs,
    images: [{ url: p.img, isPrimary: true }],
  }, `Sản phẩm "${p.name}"`);

  for (const v of p.variants || []) {
    assert.ok(v.price > p.basePrice, `"${p.name}" / "${v.name}": giá variant thấp hơn giá nhập`);
  }
}

// ─── Banner ───────────────────────────────────────────────────────────────────
const bannerPositions = new Set(["homepage", ...catSlugs]);
banners.forEach((b) => {
  assert.ok(bannerPositions.has(b.position), `Banner "${b.title}": position "${b.position}" không khớp danh mục nào`);
  check(Banner, { linkUrl: "", isActive: true, ...b }, `Banner "${b.title}"`);
});

// ─── Voucher ──────────────────────────────────────────────────────────────────
const codes = new Set();
vouchers.forEach((v) => {
  assert.ok(!codes.has(v.code), `Trùng mã voucher: ${v.code}`);
  codes.add(v.code);
  assert.ok(v.expiresAt > v.startsAt, `Voucher ${v.code}: expiresAt phải sau startsAt`);
  if (v.type === "percent") assert.ok(v.value > 0 && v.value <= 100, `Voucher ${v.code}: % giảm phải trong khoảng 1-100`);
  check(Voucher, v, `Voucher ${v.code}`);
});
const now = new Date();
assert.ok(
  vouchers.some((v) => v.isActive && v.startsAt <= now && v.expiresAt > now && (v.usageLimit === null || v.usedCount < v.usageLimit)),
  "Không có voucher nào dùng được ngay — demo thanh toán sẽ không thử được mã giảm giá"
);

// ─── Khu vực vận chuyển ───────────────────────────────────────────────────────
const zoneCodes = new Set();
zones.forEach((z) => {
  assert.ok(!zoneCodes.has(z.code), `Trùng mã khu vực: ${z.code}`);
  zoneCodes.add(z.code);
  check(ShippingZone, { ...z, isActive: true }, `Khu vực ${z.name}`);
});

// ─── Flash sale ───────────────────────────────────────────────────────────────
const bySlug = Object.fromEntries(PRODUCTS.map((p) => [slugify(p.name), p]));
for (const program of PROGRAMS) {
  assert.ok(program.endsAt > program.startsAt, `Flash sale "${program.name}": endsAt phải sau startsAt`);
  for (const item of program.products) {
    const p = bySlug[item.slug];
    assert.ok(p, `Flash sale "${program.name}" trỏ tới slug không tồn tại: ${item.slug}`);
    // Hook FlashSale tính giá flash từ salePrice — không được rơi xuống dưới giá nhập
    const flashPrice = item.discountType === "percent"
      ? Math.round(p.salePrice * (1 - item.discountValue / 100))
      : Math.max(0, p.salePrice - item.discountValue);
    assert.ok(flashPrice > p.basePrice, `Flash sale "${program.name}": giá flash của "${p.name}" (${flashPrice}) thấp hơn giá nhập ${p.basePrice}`);
    assert.ok(item.sold <= item.quantity, `Flash sale "${program.name}": "${p.name}" đã bán ${item.sold} vượt số lượng ${item.quantity}`);
  }
}
assert.ok(
  PROGRAMS.some((p) => p.isActive && p.startsAt <= now && p.endsAt > now),
  "Không có flash sale nào đang chạy — trang chủ sẽ không hiện khối Flash Sale"
);

// ─── Đơn hàng: đúng field schema (bug cũ: isPaid không tồn tại, phải là paidAt) ─
const sampleOrder = {
  user: new mongoose.Types.ObjectId(),
  products: [{
    product: new mongoose.Types.ObjectId(), quantity: 2, priceAtOrder: 29990000,
    costAtOrder: 24000000, nameAtOrder: "Laptop MSI Katana 15", imageAtOrder: "https://x/y.jpg",
    variantLabel: "16GB / 1TB", variant: null,
  }],
  subtotal: 59980000, shippingFee: 0, discountAmount: 1000000, voucherCode: "WELCOME5",
  total: 58980000, note: "", status: "Delivered", paymentMethod: "vnpay",
  paidAt: new Date(), billingInfo: { fullName: "A", phone: "0900000000", email: "a@b.c", street: "1", district: "2", city: "3" },
  createdAt: new Date(), updatedAt: new Date(),
};
assertNoUnknownKeys(Order, sampleOrder, "Đơn hàng mẫu");
check(Order, sampleOrder, "Đơn hàng mẫu");

// ─── Pricing: flash sale phải thắng saleDiscount ───────────────────────────────
const p0 = { basePrice: 1000, salePrice: 2000, saleDiscount: 10, isFlashSale: false };
assert.strictEqual(getEffectivePrice(p0), 1800, "saleDiscount 10% trên 2000 phải ra 1800");
assert.strictEqual(
  getEffectivePrice({ ...p0, isFlashSale: true, flashSalePrice: 1500, flashSaleEndsAt: new Date(Date.now() + 3600000) }),
  1500,
  "Flash sale còn hiệu lực phải thắng saleDiscount"
);
assert.strictEqual(
  getEffectivePrice({ ...p0, isFlashSale: true, flashSalePrice: 1500, flashSaleEndsAt: new Date(Date.now() - 1000) }),
  1800,
  "Flash sale đã hết hạn phải quay về giá saleDiscount"
);
assert.strictEqual(getEffectivePrice(p0, { price: 3000 }), 2700, "Giá variant phải thay salePrice trước khi giảm %");

console.log(`✅ ${CATEGORIES.length} danh mục · ${PRODUCTS.length} sản phẩm · ${PRODUCTS.reduce((s, p) => s + (p.variants?.length || 0), 0)} variant`);
console.log(`✅ ${banners.length} banner · ${vouchers.length} voucher · ${zones.length} khu vực vận chuyển`);
console.log("✅ Toàn bộ dữ liệu seed khớp schema và quy tắc giá.");
