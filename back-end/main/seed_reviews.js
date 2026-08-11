require("dotenv").config();
const mongoose = require("mongoose");
const Order = require("./models/Order");
const Review = require("./models/Review");

// Bình luận theo mức sao — để nội dung khớp với điểm, không khen 5 sao rồi chê
const COMMENTS = {
  5: [
    "Máy chạy mượt, build đẹp hơn mong đợi. Shop đóng gói kỹ, giao đúng hẹn.",
    "Dùng được 2 tuần rồi, pin trâu và tản nhiệt mát. Rất đáng tiền.",
    "Hàng chính hãng, có tem bảo hành đầy đủ. Tư vấn viên nhiệt tình.",
    "Chất lượng vượt tầm giá, mình sẽ giới thiệu cho bạn bè.",
    "Giao nhanh trong ngày, sản phẩm nguyên seal. Rất hài lòng.",
    "Cấu hình mạnh, chiến game max setting không giật. Quá ổn.",
  ],
  4: [
    "Sản phẩm tốt, chỉ là quạt hơi ồn khi chạy full tải. Nhìn chung vẫn ưng.",
    "Đúng như mô tả, giao hàng hơi chậm 1 ngày nhưng không sao.",
    "Máy ngon trong tầm giá, giá mà tặng kèm túi chống sốc thì tuyệt.",
    "Hài lòng, trừ việc màn hình hơi bám vân tay.",
    "Chất lượng ổn định, dùng ổn cho công việc hằng ngày.",
  ],
  3: [
    "Tạm ổn so với giá tiền, nhưng pin không được như quảng cáo.",
    "Máy dùng được, đóng gói hơi sơ sài. Mong shop cải thiện.",
    "Bình thường, không có gì nổi bật nhưng cũng không lỗi gì.",
  ],
  2: [
    "Giao hàng chậm gần một tuần, sản phẩm thì tạm được.",
    "Máy có tiếng rít nhẹ khi sạc, đang liên hệ shop để đổi.",
  ],
  1: [
    "Nhận hàng bị trầy góc máy, shop xử lý bảo hành hơi lâu.",
  ],
};

const REPLIES = [
  "Cảm ơn bạn đã tin tưởng shop! Chúc bạn có trải nghiệm tuyệt vời.",
  "Shop cảm ơn đánh giá của bạn, rất mong được phục vụ bạn lần sau.",
  "Shop xin ghi nhận góp ý và sẽ cải thiện khâu đóng gói. Cảm ơn bạn!",
  "Rất xin lỗi vì trải nghiệm chưa tốt. Bạn nhắn shop qua hotline để được hỗ trợ đổi trả nhé.",
];

// Phân bố sao thiên về tích cực nhưng vẫn có đánh giá thấp để demo bộ lọc
const RATING_MIX = [5, 5, 5, 5, 5, 5, 5, 4, 4, 4, 4, 3, 3, 2, 1];
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function seedReviews() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce");
  console.log("✅ Đã kết nối MongoDB");

  const orders = await Order.find({ status: "Delivered" }).sort({ createdAt: 1 }).lean();
  if (orders.length === 0) {
    console.log("❌ Chưa có đơn hàng Delivered nào. Chạy `node seed_orders.js` trước!");
    return mongoose.disconnect();
  }

  await Review.deleteMany({});
  console.log("🧹 Đã xoá đánh giá cũ");

  // Review model có unique index (productId, userId) — mỗi cặp chỉ được review một lần
  const seen = new Set();
  const reviews = [];

  for (const order of orders) {
    for (const item of order.products) {
      const key = `${item.product}-${order.user}`;
      if (seen.has(key)) continue;
      if (Math.random() > 0.72) continue; // ~72% đơn đã giao để lại đánh giá
      seen.add(key);

      const rating = rand(RATING_MIX);
      // Đánh giá viết sau khi nhận hàng vài ngày, không sớm hơn ngày đặt
      const createdAt = new Date(order.createdAt.getTime() + (3 + Math.random() * 10) * 86400000);
      if (createdAt > new Date()) continue;

      const replied = rating <= 3 || Math.random() < 0.3;
      reviews.push({
        productId: item.product,
        userId: order.user,
        orderId: order._id,
        rating,
        comment: rand(COMMENTS[rating]),
        isVisible: true,
        reply: replied ? rand(REPLIES) : "",
        repliedAt: replied ? new Date(createdAt.getTime() + 86400000) : null,
        createdAt,
        updatedAt: createdAt,
      });
    }
  }

  await Review.insertMany(reviews);

  const dist = reviews.reduce((acc, r) => ({ ...acc, [r.rating]: (acc[r.rating] || 0) + 1 }), {});
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  console.log(`⭐ Đã tạo ${reviews.length} đánh giá trên ${new Set(reviews.map((r) => String(r.productId))).size} sản phẩm`);
  console.log(`   Phân bố sao: ${[5, 4, 3, 2, 1].map((s) => `${s}★=${dist[s] || 0}`).join(" · ")} · trung bình ${avg.toFixed(2)}`);

  await mongoose.disconnect();
}

seedReviews().catch(async (err) => {
  console.error("❌ Lỗi khi seed đánh giá:", err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
