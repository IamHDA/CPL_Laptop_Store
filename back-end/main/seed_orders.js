require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Product = require("./models/Product");
const ProductVariant = require("./models/ProductVariant");
const Order = require("./models/Order");
const { getEffectivePrice } = require("./lib/pricing");

const CUSTOMERS = [
  { email: "customer1@example.com", username: "minhanh",  fullName: "Trần Minh Anh",  phone: "0901234561", province: "TP Hồ Chí Minh", district: "Quận 1",     ward: "Bến Nghé",    street: "45 Nguyễn Huệ" },
  { email: "customer2@example.com", username: "quochuy",  fullName: "Lê Quốc Huy",    phone: "0901234562", province: "Hà Nội",         district: "Cầu Giấy",   ward: "Dịch Vọng",   street: "128 Xuân Thủy" },
  { email: "customer3@example.com", username: "thuhang",  fullName: "Phạm Thu Hằng",  phone: "0901234563", province: "Đà Nẵng",        district: "Hải Châu",   ward: "Thạch Thang", street: "22 Bạch Đằng" },
  { email: "customer4@example.com", username: "vanduc",   fullName: "Nguyễn Văn Đức", phone: "0901234564", province: "TP Hồ Chí Minh", district: "Thủ Đức",    ward: "Linh Trung",  street: "9 Võ Văn Ngân" },
  { email: "customer5@example.com", username: "kimngan",  fullName: "Võ Kim Ngân",    phone: "0901234565", province: "Hà Nội",         district: "Hai Bà Trưng", ward: "Bách Khoa", street: "17 Tạ Quang Bửu" },
  { email: "customer6@example.com", username: "tuankiet", fullName: "Đặng Tuấn Kiệt", phone: "0901234566", province: "Cần Thơ",        district: "Ninh Kiều",  ward: "An Hòa",      street: "3 Trần Văn Khéo" },
];

// Phí ship theo tỉnh — khớp với dữ liệu trong seed_shipping.js
const SHIP_FEE = { "TP Hồ Chí Minh": 20000, "Hà Nội": 25000, "Đà Nẵng": 30000, "Cần Thơ": 35000 };

const NOTES = [
  "", "", "", // đa số đơn không có ghi chú
  "Giao giờ hành chính giúp mình nhé.",
  "Gọi trước 15 phút khi tới, cảm ơn shop.",
  "Cho mình xin hóa đơn VAT công ty.",
  "Đóng gói kỹ giúp mình, hàng dễ vỡ.",
];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function seedOrders() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce");
  console.log("✅ Đã kết nối MongoDB");

  const products = await Product.find({ isActive: true, deletedAt: null });
  if (products.length === 0) {
    console.log("❌ Chưa có sản phẩm nào. Chạy `node seed.js` trước!");
    return mongoose.disconnect();
  }
  const variantsByProduct = {};
  for (const v of await ProductVariant.find()) {
    (variantsByProduct[v.productId] ||= []).push(v);
  }

  await Order.deleteMany({});
  console.log("🧹 Đã xoá đơn hàng cũ");

  // Hash thật để các tài khoản mẫu đăng nhập được mà xem lịch sử đơn khi demo
  const password = await bcrypt.hash("User@123", 10);

  const users = [];
  for (const c of CUSTOMERS) {
    users.push(
      await User.findOneAndUpdate(
        { email: c.email },
        {
          username: c.username,
          fullName: c.fullName,
          password,
          phone: c.phone,
          role: "user",
          isVerified: true,
          address: `${c.street}, ${c.district}, ${c.province}`,
          loyaltyPoints: randInt(0, 3000),
          addresses: [{ fullName: c.fullName, phone: c.phone, province: c.province, district: c.district, ward: c.ward, street: c.street, isDefault: true }],
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    );
  }
  console.log(`👥 Đã tạo/cập nhật ${users.length} khách hàng mẫu`);

  // Trải đơn qua 12 tháng để biểu đồ doanh thu theo tháng/năm có dữ liệu thật
  const STATUS_MIX = [
    ...Array(30).fill("Delivered"),
    ...Array(6).fill("Shipped"),
    ...Array(6).fill("Confirmed"),
    ...Array(6).fill("Pending"),
    ...Array(4).fill("Cancelled"),
    ...Array(2).fill("PendingPayment"),
  ];

  const orders = [];
  for (let i = 0; i < 120; i++) {
    const customer = rand(CUSTOMERS);
    const user = users[CUSTOMERS.indexOf(customer)];
    const status = rand(STATUS_MIX);

    // Chọn 1-4 sản phẩm khác nhau
    const picked = new Map();
    for (let j = 0, want = randInt(1, 4); j < want; j++) {
      const p = rand(products);
      if (!picked.has(String(p._id))) picked.set(String(p._id), p);
    }

    const items = [];
    let subtotal = 0;
    for (const p of picked.values()) {
      const variant = rand(variantsByProduct[p._id] || [null]);
      const quantity = randInt(1, 2);
      const priceAtOrder = getEffectivePrice(p, variant);
      subtotal += priceAtOrder * quantity;
      items.push({
        product: p._id,
        quantity,
        priceAtOrder,
        costAtOrder: p.basePrice,
        nameAtOrder: p.name,
        imageAtOrder: p.images?.[0]?.url || "",
        variantLabel: variant ? variant.name : "",
        variant: variant?._id ?? null,
      });
    }

    // Đơn trên 20 triệu miễn phí ship
    const shippingFee = subtotal >= 20000000 ? 0 : (SHIP_FEE[customer.province] ?? 30000);
    // ~25% đơn dùng voucher giảm 5%, tối đa 1 triệu
    const useVoucher = Math.random() < 0.25;
    const discountAmount = useVoucher ? Math.min(Math.round(subtotal * 0.05), 1000000) : 0;
    const total = Math.max(0, subtotal + shippingFee - discountAmount);

    const createdAt = new Date(Date.now() - randInt(0, 364) * 86400000 - randInt(0, 86399) * 1000);
    const paymentMethod = rand(["cod", "cod", "bank", "vnpay", "vnpay"]);
    // Chỉ đơn đã giao hoặc thanh toán online thành công mới có paidAt
    const isPaid = status === "Delivered" || (paymentMethod !== "cod" && !["Cancelled", "PendingPayment"].includes(status));

    orders.push({
      user: user._id,
      products: items,
      subtotal,
      shippingFee,
      discountAmount,
      voucherCode: useVoucher ? "WELCOME5" : null,
      total,
      note: rand(NOTES),
      status,
      paymentMethod,
      paidAt: isPaid ? createdAt : null,
      billingInfo: {
        fullName: customer.fullName,
        phone: customer.phone,
        email: customer.email,
        street: customer.street,
        district: customer.district,
        city: customer.province,
      },
      createdAt,
      updatedAt: createdAt,
    });
  }

  await Order.insertMany(orders);

  const byStatus = orders.reduce((acc, o) => ({ ...acc, [o.status]: (acc[o.status] || 0) + 1 }), {});
  const revenue = orders.filter((o) => o.status === "Delivered").reduce((s, o) => s + o.total, 0);
  console.log(`🧾 Đã tạo ${orders.length} đơn hàng trải 12 tháng`);
  console.log(`   Trạng thái: ${Object.entries(byStatus).map(([k, v]) => `${k}=${v}`).join(" · ")}`);
  console.log(`   Doanh thu đơn Delivered: ${revenue.toLocaleString("vi-VN")}đ`);

  await mongoose.disconnect();
}

seedOrders().catch(async (err) => {
  console.error("❌ Lỗi khi seed đơn hàng:", err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
