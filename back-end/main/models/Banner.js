const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title:     { type: String, required: true },
    imageUrl:  { type: String, required: true },
    linkUrl:   { type: String, default: "" },
    // "homepage" hoặc slug của một Category. Không dùng enum: mỗi lần thêm danh mục
    // mới lại phải sửa enum, đó là lý do danh sách cũ trôi lệch khỏi danh mục thật.
    position:  { type: String, default: "homepage", trim: true },
    sortOrder: { type: Number, default: 0 },
    isActive:  { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

bannerSchema.index({ isActive: 1, sortOrder: 1 });

module.exports = mongoose.model("Banner", bannerSchema);
