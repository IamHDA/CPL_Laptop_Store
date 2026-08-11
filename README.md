# 💻 LAPTOP STORE - HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ CÔNG NGHỆ

Hệ thống website thương mại điện tử chuyên kinh doanh Laptop & Thiết bị công nghệ hàng đầu, phát triển theo kiến trúc tách biệt Front-end (React/Vite) và Back-end (Node.js/Express/MongoDB).

---

## 🛠️ Công Nghệ Sử Dụng

### **Back-end**
- **Runtime**: Node.js (Express Framework)
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens), Bcryptjs
- **Email Service**: Nodemailer (Xác thực OTP, Gửi email hóa đơn HTML)
- **Payment Gateways**: VNPay Sandbox, Thanh toán COD, Chuyển khoản VietQR

### **Front-end**
- **Framework**: React 19 (Vite Build Tool)
- **Routing**: React Router v7
- **Styling**: TailwindCSS, Framer Motion (Animations)
- **UI Components**: Lucide React Icons, React Toastify

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Lập Trình (Local Setup)

### **1. Khởi chạy Back-end**
```bash
cd back-end/main

# 1. Cài đặt thư viện
npm install

# 2. Tạo file cấu hình môi trường (.env) từ file mẫu
copy .env.example .env

# 3. Nạp toàn bộ dữ liệu mẫu (đúng thứ tự phụ thuộc)
npm run seed

# 4. Chạy server phát triển
npm run dev
```
*Server Back-end sẽ chạy tại: `http://localhost:3000`*

> ⚠️ `npm run seed` **xoá sạch** Category / Product / User / Order / Review / Banner /
> Voucher / ShippingZone trước khi nạp lại. Kiểm tra `MONGO_URI` đang trỏ vào DB local
> chứ không phải cluster production trước khi chạy.

Kiểm tra dữ liệu seed khớp schema mà không cần kết nối DB:
```bash
npm run test:seeds
```

Từng bước riêng lẻ nếu cần chạy lại một phần (thứ tự có phụ thuộc):
```bash
node seed.js            # 8 danh mục · 42 sản phẩm · 23 variant · 2 tài khoản
node seed_shipping.js   # 20 khu vực vận chuyển
node seed_vouchers.js   # 10 voucher (đang chạy / sắp mở / hết hạn / hết lượt)
node seed_banners.js    # 16 banner trang chủ và theo danh mục
node seed_orders.js     # 120 đơn trải 12 tháng, 6 khách hàng   (cần seed.js)
node seed_flashsales.js # 4 chương trình flash sale             (cần seed.js)
node seed_reviews.js    # đánh giá gắn với đơn đã giao          (cần seed_orders.js)
```

### **2. Khởi chạy Front-end**
```bash
cd front-end/main

# 1. Cài đặt thư viện
npm install

# 2. Tạo file cấu hình môi trường (.env) từ file mẫu
copy .env.example .env

# 3. Đảm bảo VITE_API_URL trong file .env trỏ đúng vào Back-end:
# VITE_API_URL=http://localhost:3000

# 4. Khởi chạy Front-end
npm run dev
```
*Website Front-end sẽ chạy tại: `http://localhost:5174`*
*(cổng 5174 được cố định trong `vite.config.js` và là origin duy nhất được CORS của Back-end cho phép ở chế độ dev)*

---

## 🔑 Tài Khoản Thử Nghiệm (Test Accounts)

Dữ liệu seed đã chuẩn bị sẵn các tài khoản với các quyền tương ứng:

| Vai trò (Role) | Email | Mật khẩu | Quyền hạn |
|---|---|---|---|
| **Admin** | `admin@gmail.com` | `Admin@123` | Toàn quyền quản trị hệ thống, xem Dashboard thống kê |
| **Customer** | `user@gmail.com` | `User@123` | Người mua hàng, đặt đơn, có sẵn 2 địa chỉ giao hàng |

`seed_orders.js` còn tạo 6 khách hàng `customer1@example.com` … `customer6@example.com`
(cùng mật khẩu `User@123`) có sẵn lịch sử đơn hàng trải 12 tháng — đăng nhập bằng các
tài khoản này để xem trang Đơn hàng, đánh giá và tích điểm đã có dữ liệu.

Mã giảm giá thử ngay khi thanh toán: `WELCOME5` (-5%), `GIAM10` (-10% đơn từ 15 triệu),
`LAPTOP500K` (-500K đơn từ 10 triệu), `SETUPPC` (-1 triệu đơn từ 25 triệu).

---

## 📋 Danh Sách Chức Năng Hoàn Thành (Checklist)

### **1. Authentication & Phân Quyền**
- [x] Đăng ký, Đăng nhập, Đăng xuất, Đổi mật khẩu.
- [x] Phân quyền tối thiểu 2 role: Admin & Customer.
- [x] Bảo vệ Route theo role (AdminRoute & CustomerRoute).

### **2. Quản Lý Sản Phẩm**
- [x] Xem danh sách sản phẩm với bộ lọc theo danh mục (CPU, GPU, RAM, Laptop Gaming...).
- [x] Tìm kiếm sản phẩm theo tên, thương hiệu, từ khóa.
- [x] Trang chi tiết sản phẩm: thông số kỹ thuật chi tiết, hình ảnh, giá bán, tồn kho.
- [x] Admin Dashboard: Thêm, sửa, xóa (CRUD) và ẩn/hiện sản phẩm.

### **3. Giỏ Hàng & Đặt Hàng**
- [x] Thêm/xóa sản phẩm khỏi giỏ hàng, tự động cập nhật số lượng và tổng tiền.
- [x] Validate tồn kho thực tế trước khi cho phép đặt hàng (Atomic update).
- [x] Đặt hàng với đầy đủ thông tin giao hàng (họ tên, SĐT, địa chỉ chi tiết).
- [x] Quản lý lịch sử đơn hàng với các trạng thái: `Pending` / `Confirmed` / `Shipped` / `Delivered` / `Cancelled`.

### **4. Thanh Toán & Thông Báo Mail**
- [x] Tích hợp Cổng thanh toán VNPay Sandbox & Mã VietQR tự động.
- [x] Hỗ trợ Thanh toán khi nhận hàng (COD).
- [x] Tự động gửi Email HTML xác nhận đơn hàng chuyên nghiệp sau khi đặt thành công.

### **5. Dashboard Quản Trị (Admin Dashboard)**
- [x] Thống kê tổng doanh thu, lợi nhuận, tổng đơn hàng, sản phẩm bán chạy.
- [x] Bộ lọc thống kê linh hoạt theo ngày/tháng/năm và theo danh mục sản phẩm.
- [x] Tích hợp 2 loại biểu đồ tương tác: Biểu đồ Lợi nhuận & Biểu đồ Đơn hàng.

### **6. Tính Năng Nâng Cao (Bonus Features)**
- [x] **Đánh giá sản phẩm (Reviews & Ratings)**: Cho phép chấm điểm sao và để lại bình luận.
- [x] **Mã giảm giá (Coupon/Vouchers)**: Áp dụng voucher giảm giá % hoặc số tiền cố định khi thanh toán.
