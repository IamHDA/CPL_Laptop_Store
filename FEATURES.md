# HK TECH — Danh Sách Chức Năng

> Tài liệu tổng hợp chức năng thực tế có trong source code, dùng làm tư liệu thuyết trình.
> Cập nhật: 11/08/2026

---

## 1. Tổng quan hệ thống

Website thương mại điện tử bán laptop và linh kiện máy tính, kiến trúc tách rời
Front-end và Back-end, triển khai thành 2 project độc lập trên Vercel.

| Thành phần | Công nghệ | Quy mô |
|---|---|---|
| **Front-end** | React 19, Vite 6, TailwindCSS 4, React Router 7 | 16 trang khách + 11 trang quản trị |
| **Back-end** | Node.js, Express 5, MongoDB (Mongoose 8) | 16 nhóm route, 21 model |
| **Database** | MongoDB Atlas | 21 collection |
| **Triển khai** | Vercel (2 project) + MongoDB Atlas | tự động deploy khi push `main` |

**Thư viện hỗ trợ:** JWT + bcryptjs (xác thực), Nodemailer (email), Multer (upload
ảnh), Framer Motion (hiệu ứng), React Toastify (thông báo), Helmet +
express-rate-limit (bảo mật).

---

## 2. Chức năng phía khách hàng

### 2.1. Xác thực & tài khoản

| Chức năng | Mô tả |
|---|---|
| Đăng ký | Nhập email + mật khẩu, xác minh bằng **mã OTP gửi qua email** |
| Đăng nhập | JWT access token + refresh token lưu trong cookie httpOnly |
| Quên mật khẩu | Gửi OTP về email → xác minh → đặt lại mật khẩu |
| Đổi mật khẩu | Yêu cầu nhập mật khẩu hiện tại |
| Tự động gia hạn phiên | Interceptor bắt lỗi 401, gọi refresh token, chạy lại request cũ |
| Sổ địa chỉ | Lưu nhiều địa chỉ giao hàng, đặt một địa chỉ mặc định |
| Điểm tích luỹ | Tích điểm theo đơn hàng, đổi điểm lấy ưu đãi |

### 2.2. Duyệt & tìm sản phẩm

| Chức năng | Mô tả |
|---|---|
| Trang chủ | Carousel banner, Flash Sale đếm ngược, khối sản phẩm theo từng danh mục |
| Danh sách sản phẩm | Phân trang, lọc theo danh mục, lọc khoảng giá, 4 kiểu sắp xếp |
| Trang danh mục | Banner riêng theo danh mục, bộ lọc theo dòng sản phẩm |
| Tìm kiếm | MongoDB text index trên tên, tag, thương hiệu, CPU, VGA |
| Gợi ý tìm kiếm | Dropdown hiện sản phẩm khớp ngay khi đang gõ |
| Chi tiết sản phẩm | Bảng thông số kỹ thuật, chọn phiên bản, sản phẩm liên quan, đánh giá |
| Phiên bản sản phẩm | Mỗi máy có nhiều cấu hình RAM/SSD/màu, giá và tồn kho riêng |
| So sánh sản phẩm | Chọn 2–3 sản phẩm **cùng danh mục**, bảng đối chiếu chỉ hiện thông số có dữ liệu |
| Yêu thích | Thêm/xoá sản phẩm khỏi danh sách yêu thích |

**Sắp xếp:** Mới nhất · Bán chạy · Giá tăng dần · Giá giảm dần

### 2.3. Giỏ hàng & đặt hàng

| Chức năng | Mô tả |
|---|---|
| Giỏ hàng | Thêm/sửa/xoá, tự tính tổng tiền |
| Gộp giỏ hàng | Giỏ lưu ở localStorage khi chưa đăng nhập được gộp vào tài khoản sau khi đăng nhập |
| Áp mã giảm giá | Kiểm tra hiệu lực, giá trị đơn tối thiểu, giới hạn lượt dùng |
| Phí vận chuyển | Tính theo tỉnh/thành, kèm số ngày giao dự kiến |
| Đặt hàng | Điền thông tin giao hàng, chọn phương thức thanh toán, ghi chú |
| Chống bán vượt kho | Trừ tồn kho bằng thao tác atomic, tự hoàn lại khi đặt hàng lỗi giữa chừng |
| Email xác nhận | Tự động gửi email HTML sau khi đặt hàng thành công |
| Theo dõi đơn | Xem lịch sử đơn, trạng thái, huỷ đơn, yêu cầu trả hàng |

**6 trạng thái đơn hàng:**
`Chờ thanh toán` → `Chờ xác nhận` → `Đã xác nhận` → `Đang giao` → `Đã giao`
(nhánh riêng: `Đã huỷ`)

### 2.4. Thanh toán

| Phương thức | Ghi chú |
|---|---|
| **COD** | Thanh toán khi nhận hàng |
| **VNPay** | Cổng thanh toán sandbox, có URL callback xác nhận |
| **MoMo** | Tạo giao dịch, nhận IPN, xử lý URL trả về |
| **Chuyển khoản** | Sinh **mã VietQR** tự động theo số tiền và mã đơn |

Hệ thống có luồng **hoàn tiền**: khách gửi thông tin tài khoản ngân hàng, quản trị
đánh dấu đã hoàn.

### 2.5. Đánh giá sản phẩm

- Chấm điểm 1–5 sao kèm bình luận
- **Đính kèm ảnh** cho đánh giá
- Chỉ đánh giá được sản phẩm đã mua và đơn ở trạng thái *Đã giao*
- Mỗi người chỉ đánh giá một lần cho mỗi sản phẩm
- Quản trị có thể **trả lời** đánh giá

### 2.6. Thông báo

Chuông thông báo trên header, hiện số chưa đọc, tự cập nhật mỗi 60 giây, đánh dấu
đã đọc từng cái hoặc tất cả.

---

## 3. Chức năng quản trị (Admin)

Truy cập tại `/admin`, được bảo vệ bằng kiểm tra vai trò **từ phía server** chứ
không tin dữ liệu lưu ở trình duyệt.

### 3.1. Dashboard thống kê

**4 thẻ số liệu tổng quan:** Doanh thu · Lợi nhuận · Tổng đơn hàng · Người dùng

**4 biểu đồ:**

| Biểu đồ | Dạng | Nội dung |
|---|---|---|
| Thống kê Lợi nhuận | Cột dọc, 12 tháng | Lợi nhuận theo từng tháng |
| Thống kê Đơn hàng | Cột dọc, 12 tháng | Số đơn theo từng tháng |
| Đơn hàng theo trạng thái | Cột ngang | 6 trạng thái, kèm số lượng và tỉ lệ % |
| Doanh thu theo danh mục | Cột ngang | Xếp hạng 8 danh mục theo doanh thu |

Bảng màu biểu đồ trạng thái đã kiểm định đạt chuẩn hiển thị cho **người mù màu**
(độ sáng, độ bão hoà, độ tách màu, tương phản nền).

**Bộ lọc:** theo khoảng ngày và theo danh mục.
**Khối bổ sung:** cảnh báo sắp hết hàng · top 5 sản phẩm bán chạy · đơn hàng gần đây.

### 3.2. Quản lý dữ liệu

| Trang | Chức năng |
|---|---|
| **Sản phẩm** | Thêm/sửa/xoá, ẩn/hiện, upload ảnh, quản lý phiên bản, xoá mềm |
| **Danh mục** | Thêm/sửa/xoá, ảnh đại diện, chọn hiện trên trang chủ, kéo thả sắp xếp |
| **Đơn hàng** | Xem chi tiết, đổi trạng thái, xác nhận thanh toán, đánh dấu đã hoàn tiền |
| **Người dùng** | Danh sách, tìm kiếm, khoá/mở khoá tài khoản |
| **Đánh giá** | Duyệt, ẩn/hiện, trả lời, xoá, xem ảnh đính kèm |
| **Voucher** | Giảm theo % hoặc số tiền, đơn tối thiểu, giảm tối đa, giới hạn lượt, thời hạn |
| **Flash Sale** | Tạo chương trình theo khung giờ, thêm sản phẩm, đặt mức giảm và số lượng |
| **Yêu cầu trả hàng** | Duyệt hoặc từ chối yêu cầu của khách |
| **Banner** | Thêm/sửa/xoá, chọn vị trí hiển thị, kéo thả đổi thứ tự |
| **Bố cục trang chủ** | Bật/tắt và sắp xếp các khối trên trang chủ |

---

## 4. Điểm kỹ thuật nổi bật

### 4.1. Một nguồn tính giá duy nhất

Toàn hệ thống dùng chung một hàm `getEffectivePrice()` với thứ tự ưu tiên:

```
Flash Sale còn hiệu lực  →  giá phiên bản (variant)  →  giá niêm yết × (1 − % giảm)
```

`basePrice` là **giá nhập**, không hiển thị cho khách, dùng để tính lợi nhuận.

### 4.2. Chống bán vượt tồn kho

Trừ kho bằng `findOneAndUpdate` kèm điều kiện `stock >= số lượng` trong một thao
tác nguyên tử, tránh trường hợp nhiều người đặt cùng lúc làm âm kho. Nếu đặt hàng
lỗi giữa chừng, tồn kho đã trừ được hoàn lại.

### 4.3. Ảnh chụp thông tin tại thời điểm đặt hàng

Đơn hàng lưu lại `priceAtOrder`, `costAtOrder`, `nameAtOrder`, `imageAtOrder` —
nên sau này đổi giá hay đổi tên sản phẩm thì lịch sử đơn cũ vẫn đúng.

### 4.4. Bảo mật

- Mật khẩu băm bằng bcrypt, không bao giờ trả về trong response
- JWT bắt buộc có secret, thiếu là server không khởi động
- Rate limit: 10 lần/15 phút cho đăng nhập & đăng ký, 40 lần/phút cho tìm kiếm
- Helmet đặt security header, CORS chỉ cho phép domain đã khai báo
- Xoá mềm (`deletedAt`) cho sản phẩm, danh mục, người dùng, voucher

### 4.5. Tối ưu cho môi trường serverless

- Cache kết nối MongoDB giữa các lần gọi, tránh mở connection mới mỗi request
- Đảm bảo kết nối trước mỗi request, tự thử lại khi lần trước hỏng
- Ảnh lưu trong MongoDB và phục vụ qua API, không phụ thuộc ổ đĩa

---

## 5. Dữ liệu mẫu

Chạy một lệnh `npm run seed` để nạp đầy đủ:

| Loại | Số lượng |
|---|---|
| Danh mục | 8 |
| Sản phẩm | 42 |
| Phiên bản sản phẩm | 23 |
| Đơn hàng | 120 (trải 12 tháng) |
| Đánh giá | ~78 (gắn với đơn đã giao thật) |
| Banner | 18 |
| Voucher | 10 (đang chạy / sắp mở / hết hạn / hết lượt) |
| Khu vực vận chuyển | 20 tỉnh thành |
| Flash Sale | 4 chương trình |

**8 danh mục:** Laptop Gaming · Laptop Văn Phòng · Laptop Đồ Họa · VGA Card Đồ Họa
· CPU Bộ Vi Xử Lý · RAM & Ổ Cứng SSD · Màn Hình Máy Tính · Phụ Kiện Gaming

Dữ liệu seed có file kiểm tra riêng (`npm run test:seeds`) chạy không cần kết nối
database, đối chiếu toàn bộ dữ liệu với schema và các quy tắc giá.

### Tài khoản thử nghiệm

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Quản trị | `admin@gmail.com` | `Admin@123` |
| Khách hàng | `user@gmail.com` | `User@123` |
| Khách có lịch sử đơn | `customer1@example.com` … `customer6@example.com` | `User@123` |

**Mã giảm giá dùng thử:** `WELCOME5` · `GIAM10` · `LAPTOP500K` · `SETUPPC`

---

## 6. Thống kê quy mô

| Hạng mục | Số lượng |
|---|---|
| Model dữ liệu | 21 |
| Nhóm route API | 16 |
| Endpoint API | ~100 |
| Trang giao diện khách | 16 |
| Trang quản trị | 11 |
| Phương thức thanh toán | 4 |
| Biểu đồ thống kê | 4 |

---

## 7. Ghi chú cho người thuyết trình

**Những điểm nên nhấn mạnh:**

1. **Chống bán vượt kho bằng thao tác atomic** — không phải chỉ kiểm tra rồi trừ,
   mà gộp cả hai vào một câu lệnh database. Đây là điểm nhiều bài làm bỏ qua.
2. **Một nguồn tính giá duy nhất** — flash sale, phiên bản, giảm giá % đều đi qua
   cùng một hàm, front-end và back-end dùng chung logic nên không bao giờ lệch giá.
3. **Snapshot đơn hàng** — đổi giá sản phẩm không làm sai lịch sử đơn cũ.
4. **Bảng màu biểu đồ kiểm định cho người mù màu** — không chọn màu theo cảm tính.
5. **Dữ liệu seed có test riêng** — chạy được mà không cần database.

**Những phần chưa hoàn thiện (nên chủ động nêu nếu bị hỏi):**

- Đăng nhập Google: back-end còn endpoint nhưng đã gỡ khỏi giao diện
- Đăng ký nhận hàng về kho (`notify-restock`): có API nhưng chưa gắn vào giao diện
- Flash Sale hẹn lịch: chỉ áp giá khi được lưu lại, chưa có cron tự bật đúng giờ
- Biểu đồ "Đơn hàng theo trạng thái" luôn tính toàn thời gian, không theo bộ lọc ngày
