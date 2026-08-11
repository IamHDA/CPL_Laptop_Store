// ─── Slug helper (single source of truth) ────────────────────────────────────
// Bỏ dấu tiếng Việt rồi kebab-case. "đ/Đ" phải xử lý riêng vì NFD không tách nó.
module.exports = (str) =>
  String(str)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
