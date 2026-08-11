import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axiosClient from "../../lib/api";

function fmtDate(d) {
  return new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Stars({ value }) {
  return (
    <span className="text-[13px] font-semibold text-[#f59e0b]">
      {"★".repeat(value)}{"☆".repeat(5 - value)}
    </span>
  );
}

function ReviewRow({ review, onChanged }) {
  const [expanded, setExpanded] = useState(false);
  const [reply, setReply] = useState(review.reply || "");
  const [saving, setSaving] = useState(false);

  const saveReply = async () => {
    if (!reply.trim()) {
      toast.error("Vui lòng nhập nội dung phản hồi.");
      return;
    }
    setSaving(true);
    try {
      await axiosClient.patch(`/api/reviews/${review._id}/reply`, { reply: reply.trim() });
      toast.success("Đã phản hồi đánh giá");
      onChanged();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Không thể phản hồi đánh giá");
    } finally {
      setSaving(false);
    }
  };

  const deleteReview = async () => {
    if (!confirm("Xóa đánh giá này?")) return;
    setSaving(true);
    try {
      await axiosClient.delete(`/api/reviews/${review._id}/admin`);
      toast.success("Đã xóa đánh giá");
      onChanged();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Không thể xóa đánh giá");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <tr className="border-b border-black/[0.04] align-top transition-colors hover:bg-[#fafafa]">
        <td className="px-4 py-3">
          <p className="text-[13px] font-semibold text-[#1d1d1f]">{review.productId?.name || "Sản phẩm"}</p>
          <p className="mt-0.5 text-[11px] text-[#8e8e93]">{fmtDate(review.createdAt)}</p>
        </td>
        <td className="px-4 py-3">
          <p className="text-[13px] text-[#1d1d1f]">
            {review.userId?.fullName || review.userId?.username || "Khách hàng"}
          </p>
        </td>
        <td className="px-4 py-3">
          <Stars value={review.rating || 0} />
        </td>
        <td className="max-w-[320px] px-4 py-3">
          <p className="line-clamp-2 text-[13px] text-[#3a3a3c]">{review.comment || "Không có nội dung"}</p>
          {review.reply && (
            <p className="mt-2 rounded-lg bg-[#f0f7ff] px-3 py-2 text-[12px] text-[#1d4ed8]">
              Phản hồi: {review.reply}
            </p>
          )}
        </td>
        <td className="px-4 py-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="rounded-full border border-black/[0.1] px-2.5 py-1 text-[11px] font-medium text-[#3a3a3c] hover:bg-[#f5f5f7]"
            >
              {expanded ? "Ẩn" : "Chi tiết"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={deleteReview}
              className="rounded-full border border-[#e53e3e] px-2.5 py-1 text-[11px] font-medium text-[#e53e3e] hover:bg-[#fff1f0] disabled:opacity-50"
            >
              Xóa
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-black/[0.04] bg-[#fafafa]">
          <td colSpan={5} className="px-4 py-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <div>
                <p className="mb-2 text-[12px] font-semibold text-[#1d1d1f]">Nội dung đánh giá</p>
                <p className="text-[13px] text-[#3a3a3c]">{review.comment || "Không có nội dung"}</p>
                {review.images?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {review.images.map((img, index) => (
                      <img key={index} src={img} alt={`review-${index}`} className="h-16 w-16 rounded-lg object-cover" />
                    ))}
                  </div>
                )}
              </div>
              <div>
                <p className="mb-2 text-[12px] font-semibold text-[#1d1d1f]">Phản hồi của shop</p>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-black/[0.1] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20"
                  placeholder="Nhập phản hồi..."
                />
                <button
                  type="button"
                  disabled={saving}
                  onClick={saveReply}
                  className="mt-2 rounded-full bg-[#1d1d1f] px-4 py-2 text-[12px] font-medium text-white hover:bg-[#3d3d3f] disabled:opacity-50"
                >
                  Lưu phản hồi
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    axiosClient
      .get("/api/reviews?limit=100")
      .then((res) => setReviews(res.data.data?.reviews || []))
      .catch(() => toast.error("Không tải được danh sách đánh giá"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold text-[#1d1d1f]">Quản lý đánh giá</h1>
          <p className="text-sm text-[#8e8e93]">{reviews.length} đánh giá</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1d1d1f] border-t-transparent" />
          </div>
        ) : reviews.length === 0 ? (
          <p className="py-16 text-center text-sm text-[#8e8e93]">Chưa có đánh giá nào</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-black/[0.06] bg-[#fafafa]">
                  {["Sản phẩm", "Khách hàng", "Rating", "Nội dung", "Thao tác"].map((header) => (
                    <th key={header} className="px-4 py-3 text-[12px] font-semibold text-[#6e6e73]">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <ReviewRow key={review._id} review={review} onChanged={load} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
