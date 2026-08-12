// CLIENT_URL là danh sách origin cách nhau dấu phẩy (để CORS cho phép nhiều
// domain Vercel). Khi cần redirect người dùng thì phải lấy origin đầu tiên —
// ghép thẳng cả chuỗi sẽ ra URL rác kiểu "https://a,https://b/payment/result".
module.exports = () =>
  (process.env.CLIENT_URL || "http://localhost:5174")
    .split(",")[0]
    .trim()
    .replace(/\/$/, "");
