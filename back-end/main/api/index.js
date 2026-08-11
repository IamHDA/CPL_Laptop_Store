// Điểm vào cho Vercel Serverless Function.
// Vercel không chạy `app.listen()` — nó cần một handler được export, và mọi file
// trong thư mục api/ đều tự động trở thành function. vercel.json rewrite tất cả
// request về đây để Express tự định tuyến như khi chạy local.
module.exports = require("../app");
