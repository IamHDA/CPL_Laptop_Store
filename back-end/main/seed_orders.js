require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Product = require("./models/Product");
const Order = require("./models/Order");

const mongoUrl = process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce";

async function seedOrders() {
  try {
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB");

    // Lấy danh sách sản phẩm hiện có
    const products = await Product.find({ isActive: true });
    if (products.length === 0) {
      console.log("Không có sản phẩm nào. Hãy chạy seed.js trước!");
      process.exit(1);
    }

    // Xóa orders cũ để tránh trùng lặp nếu chạy nhiều lần
    await Order.deleteMany({});
    console.log("🧹 Đã dọn dẹp các đơn hàng cũ...");
    
    // Tạo 5 user mới làm khách hàng
    const users = [];
    for (let i = 1; i <= 5; i++) {
      const u = await User.findOneAndUpdate(
        { email: `customer${i}@example.com` },
        {
          username: `customer${i}`,
          fullName: `Khách Hàng ${i}`,
          password: "hashed_password",
          role: "user",
          phone: `090123456${i}`,
          address: `Số ${i} Đường ABC, Quận XYZ, TP HCM`
        },
        { upsert: true, new: true }
      );
      users.push(u);
    }

    let ordersCreated = 0;
    
    // Tạo 40 đơn hàng trải dài trong 6 tháng qua
    for (let i = 0; i < 40; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      
      // Đặt trọng số để có nhiều đơn Delivered (tạo doanh thu cho thống kê)
      const statusWeight = Math.random();
      let status = "Delivered";
      if (statusWeight < 0.1) status = "Pending";
      else if (statusWeight < 0.2) status = "Confirmed";
      else if (statusWeight < 0.3) status = "Shipped";
      else if (statusWeight < 0.4) status = "Cancelled";
      
      const numProducts = Math.floor(Math.random() * 3) + 1; // 1-3 sản phẩm
      const orderProducts = [];
      let total = 0;
      
      for (let j = 0; j < numProducts; j++) {
        const prod = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 2) + 1; // 1-2 cái
        const priceAtOrder = prod.salePrice || prod.basePrice;
        
        // Tránh trùng sản phẩm trong 1 order
        if (!orderProducts.find(p => p.product.toString() === prod._id.toString())) {
          orderProducts.push({
            product: prod._id,
            quantity,
            priceAtOrder,
            costAtOrder: prod.basePrice * 0.8 // Giá vốn = 80% giá gốc để có lợi nhuận
          });
          total += priceAtOrder * quantity;
        }
      }
      
      // Random ngày tạo trong vòng 180 ngày qua
      const today = new Date();
      const pastDate = new Date(today.getTime() - Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000);
      
      await Order.create({
        user: user._id,
        products: orderProducts,
        total,
        billingInfo: {
          fullName: user.fullName,
          phone: user.phone,
          street: "123 Test St",
          district: "Test Dist",
          city: "Test City"
        },
        paymentMethod: Math.random() > 0.5 ? "cod" : "bank",
        isPaid: status === "Delivered",
        status,
        createdAt: pastDate,
        updatedAt: pastDate
      });
      ordersCreated++;
    }

    console.log(`✅ Đã tạo thành công ${ordersCreated} đơn hàng mẫu đa dạng (thời gian, khách hàng, doanh thu)!`);
    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Lỗi:", error);
    process.exit(1);
  }
}

seedOrders();
