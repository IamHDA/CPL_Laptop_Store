import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../lib/api";
import { ImageWithFallback } from "../../components/ImageWithFallback";

function fmt(n) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);
}

function fmtNum(n) {
  return new Intl.NumberFormat("vi-VN").format(n);
}

// Doanh thu đầy đủ dài tới "5.418.533.755 ₫", nhét cạnh mỗi cột thì tràn.
// Rút gọn cho nhãn, giá trị đầy đủ vẫn nằm ở tooltip khi hover.
function fmtCompact(n) {
  const v = Number(n) || 0;
  if (v >= 1e9) return `${(v / 1e9).toFixed(1).replace(".", ",")} tỷ`;
  if (v >= 1e6) return `${Math.round(v / 1e6)} tr`;
  if (v >= 1e3) return `${Math.round(v / 1e3)}K`;
  return fmtNum(v);
}

const MONTH_LABELS = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"];

/* ── Low Stock Panel ── */
const LIMIT = 5;

function LowStockPanel({ items }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, LIMIT);
  const hidden = items.length - LIMIT;

  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
      <h2 className="mb-4 text-[15px] font-semibold text-[#1d1d1f] flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#fee2e2] text-[10px] font-bold text-[#e53e3e]">!</span>
        Sắp hết hàng
        {items.length > 0 && (
          <span className="ml-auto text-[11px] font-normal text-[#8e8e93]">{items.length} sản phẩm</span>
        )}
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-[#8e8e93]">Không có sản phẩm nào sắp hết</p>
      ) : (
        <>
          <div className="space-y-3">
            {visible.map((p) => (
              <div key={p._id} className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f5f5f7]">
                  <ImageWithFallback src={p.images?.[0]?.url} alt={p.name} className="max-h-full w-auto object-contain" />
                </div>
                <p className="flex-1 min-w-0 text-[13px] text-[#1d1d1f] truncate">{p.name}</p>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${p.stock <= 3 ? "bg-[#fee2e2] text-[#e53e3e]" : "bg-[#fff7ed] text-[#c2410c]"}`}>
                  {p.stock} còn
                </span>
              </div>
            ))}
          </div>
          {items.length > LIMIT && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-3 w-full rounded-xl border border-black/[0.08] py-2 text-[12px] font-medium text-[#0071e3] hover:bg-[#f0f7ff] transition-colors"
            >
              {expanded ? "Thu gọn" : `Xem thêm ${hidden} sản phẩm`}
            </button>
          )}
        </>
      )}
    </div>
  );
}

const ORDER_STATUS_COLOR = {
  Pending:   "bg-[#fff7ed] text-[#c2410c] border-[#fed7aa]",
  Confirmed: "bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]",
  Shipped:   "bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]",
  Delivered: "bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]",
  Cancelled: "bg-[#fef2f2] text-[#dc2626] border-[#fecaca]",
};
const ORDER_STATUS_VN = { Pending:"Chờ xác nhận", Confirmed:"Đã xác nhận", Shipped:"Đang giao", Delivered:"Đã giao", Cancelled:"Đã huỷ" };

/* ── Stat Card ── */
function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
      <p className="text-[12px] text-[#8e8e93]">{label}</p>
      <p className="text-[22px] font-bold text-[#1d1d1f] leading-none mt-0.5">{value}</p>
      {sub && <p className="text-[11px] text-[#6e6e73] mt-0.5">{sub}</p>}
    </div>
  );
}

/* ── Biểu đồ cột theo tháng ──────────────────────────────────────────────────
   Một component dùng cho cả Lợi nhuận lẫn Đơn hàng. Trước đây là hai component
   RevenueChart/OrderCountChart giống hệt nhau, chỉ khác tên field và màu. */
function MonthlyBarChart({ data, valueKey, color, formatValue, emptyText, unit = "" }) {
  if (!data || data.length === 0) {
    return <p className="py-12 text-center text-sm text-[#8e8e93]">{emptyText}</p>;
  }
  const max = Math.max(...data.map((d) => d[valueKey] || 0), 1);

  return (
    <div className="flex h-36 items-end gap-2 pt-2">
      {MONTH_LABELS.map((label, i) => {
        const month = i + 1;
        const value = data.find((d) => d._id?.month === month)?.[valueKey] || 0;
        const height = Math.max((value / max) * 100, value > 0 ? 4 : 0);
        return (
          <div key={month} className="group flex flex-1 flex-col items-center gap-1">
            <div className="relative flex w-full items-end justify-center" style={{ height: "112px" }}>
              {value > 0 && (
                <div
                  className="absolute bottom-full z-10 mb-1 hidden whitespace-nowrap rounded-lg px-2 py-1 text-[10px] text-white group-hover:block"
                  style={{ backgroundColor: color }}
                >
                  {formatValue(value)}{unit}
                </div>
              )}
              <div
                className="w-full rounded-t-lg transition-all duration-500"
                style={{ height: `${height}%`, minHeight: value > 0 ? "4px" : "0", backgroundColor: color }}
              />
            </div>
            <span className="text-[10px] text-[#8e8e93]">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Biểu đồ ngang: đơn hàng theo trạng thái ─────────────────────────────────
   Trạng thái là nhóm rời rạc chứ không phải chuỗi thời gian, nên cột ngang đọc
   dễ hơn cột dọc: nhãn tiếng Việt nằm ngang, không phải xoay chữ.

   Bảng màu đã chạy qua validator của skill dataviz (lightness band, chroma
   floor, tách màu cho người mù màu, tương phản nền) — pass cả 5. Điểm mấu chốt:
   "Đã giao" xanh lá và "Đã huỷ" đỏ nằm cạnh nhau là cặp khó nhất với người mù
   màu deutan, phải tách bằng chênh lệch độ sáng (xanh sáng #2da44e vs đỏ sẫm
   #a40e26) thì mới đạt. Dù vậy màu vẫn chỉ là phụ: mỗi thanh đều có nhãn chữ. */
const ORDER_STATUS = [
  { key: "PendingPayment", label: "Chờ thanh toán", color: "#8250df" },
  { key: "Pending",        label: "Chờ xác nhận",   color: "#bf8700" },
  { key: "Confirmed",      label: "Đã xác nhận",    color: "#bf3989" },
  { key: "Shipped",        label: "Đang giao",      color: "#0969da" },
  { key: "Delivered",      label: "Đã giao",        color: "#2da44e" },
  { key: "Cancelled",      label: "Đã huỷ",         color: "#a40e26" },
];

function OrderStatusChart({ data }) {
  const counts = Object.fromEntries((data || []).map((d) => [d._id, d.count || 0]));
  const total = Object.values(counts).reduce((s, n) => s + n, 0);

  if (total === 0) {
    return <p className="py-12 text-center text-sm text-[#8e8e93]">Chưa có đơn hàng nào</p>;
  }
  const max = Math.max(...ORDER_STATUS.map((s) => counts[s.key] || 0), 1);

  return (
    <div className="space-y-2.5">
      {ORDER_STATUS.map((s) => {
        const count = counts[s.key] || 0;
        const pct = (count / total) * 100;
        return (
          <div key={s.key} className="group flex items-center gap-3">
            <span className="w-[110px] shrink-0 text-[12px] text-[#3a3a3c]">{s.label}</span>
            <div className="h-5 flex-1 overflow-hidden rounded-md bg-[#f5f5f7]">
              <div
                className="h-full rounded-md transition-all duration-500 group-hover:opacity-80"
                style={{ width: `${Math.max((count / max) * 100, count > 0 ? 2 : 0)}%`, backgroundColor: s.color }}
                title={`${s.label}: ${fmtNum(count)} đơn (${pct.toFixed(1)}%)`}
              />
            </div>
            <span className="w-[86px] shrink-0 text-right text-[12px] tabular-nums text-[#1d1d1f]">
              <span className="font-semibold">{fmtNum(count)}</span>
              <span className="ml-1 text-[#8e8e93]">{pct.toFixed(0)}%</span>
            </span>
          </div>
        );
      })}
      <p className="pt-1 text-[11px] text-[#8e8e93]">Tổng {fmtNum(total)} đơn</p>
    </div>
  );
}

/* ── Biểu đồ ngang: doanh thu theo danh mục ──────────────────────────────────
   Một chuỗi dữ liệu duy nhất nên dùng một màu, không cần legend — tiêu đề đã
   nói rõ đang đo gì. Tô mỗi cột một màu ở đây chỉ là màu mè, không mã hoá thêm
   thông tin gì. */
function CategoryRevenueChart({ data }) {
  const rows = (data || []).filter((d) => (d.revenue || 0) > 0);
  if (rows.length === 0) {
    return <p className="py-12 text-center text-sm text-[#8e8e93]">Chưa có doanh thu theo danh mục</p>;
  }
  const max = Math.max(...rows.map((d) => d.revenue), 1);

  return (
    <div className="space-y-2.5">
      {rows.map((d) => (
        <div key={d.categoryId || d.categoryName} className="group flex items-center gap-3">
          <span className="w-[110px] shrink-0 truncate text-[12px] text-[#3a3a3c]" title={d.categoryName}>
            {d.categoryName}
          </span>
          <div className="h-5 flex-1 overflow-hidden rounded-md bg-[#f5f5f7]">
            <div
              className="h-full rounded-md bg-[#0071e3] transition-all duration-500 group-hover:opacity-80"
              style={{ width: `${Math.max((d.revenue / max) * 100, 2)}%` }}
              title={`${d.categoryName}: ${fmt(d.revenue)} · ${fmtNum(d.quantity || 0)} sản phẩm`}
            />
          </div>
          <span className="w-[86px] shrink-0 text-right text-[12px] font-semibold tabular-nums text-[#1d1d1f]">
            {fmtCompact(d.revenue)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [ordersByStatus, setOrdersByStatus] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [activeChartTab, setActiveChartTab] = useState("profit"); // 'profit' | 'orders'

  // Fetch categories on mount
  useEffect(() => {
    axiosClient.get("/api/categories")
      .then((res) => {
        const cats = res.data?.data || res.data || [];
        setCategories(Array.isArray(cats) ? cats : []);
      })
      .catch(() => {});
  }, []);

  // Fetch dashboard stats whenever filters change
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (categoryId && categoryId !== "all") params.append("categoryId", categoryId);

    const year = new Date().getFullYear();
    params.append("period", "monthly");
    params.append("year", year);

    const qStr = params.toString() ? `?${params.toString()}` : "";

    Promise.all([
      axiosClient.get(`/api/admin/stats/overview${qStr}`),
      axiosClient.get(`/api/admin/stats/revenue${qStr}`),
      axiosClient.get(`/api/admin/stats/top-products${qStr}&limit=5`),
      axiosClient.get("/api/admin/stats/low-stock?threshold=10&limit=200"),
      axiosClient.get("/api/admin/orders?limit=5"),
      axiosClient.get(`/api/admin/stats/by-category${qStr}`),
      axiosClient.get(`/api/admin/stats/orders-by-status${qStr}`),
    ])
      .then(([ov, rev, top, low, ord, cat, sts]) => {
        setOverview(ov.data.data);
        setRevenue(rev.data.data || []);
        setTopProducts(top.data.data || []);
        setLowStock(low.data.data || []);
        setRecentOrders(ord.data.data?.orders || []);
        setByCategory(cat.data.data || []);
        setOrdersByStatus(sts.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [startDate, endDate, categoryId]);

  const handleResetFilters = () => {
    setStartDate("");
    setEndDate("");
    setCategoryId("all");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-[#1d1d1f]">Dashboard</h1>
          <p className="text-sm text-[#8e8e93]">Tổng quan hoạt động cửa hàng</p>
        </div>

        {/* ── Filter Bar ── */}
        <div className="flex flex-wrap items-center gap-2 bg-white border border-black/[0.06] p-2 rounded-2xl shadow-sm">
          <div className="flex items-center gap-1">
            <span className="text-xs text-[#8e8e93] px-1 font-medium">Từ:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs border border-black/[0.1] rounded-lg px-2 py-1 bg-[#f9f9fb] focus:outline-none focus:border-[#0071e3]"
            />
            <span className="text-xs text-[#8e8e93] px-1 font-medium">Đến:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs border border-black/[0.1] rounded-lg px-2 py-1 bg-[#f9f9fb] focus:outline-none focus:border-[#0071e3]"
            />
          </div>

          <div className="h-4 w-[1px] bg-black/10 mx-1 hidden sm:block" />

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="text-xs border border-black/[0.1] rounded-lg px-2 py-1 bg-[#f9f9fb] focus:outline-none focus:border-[#0071e3] max-w-[150px]"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {(startDate || endDate || categoryId !== "all") && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-[#ff3b30] hover:underline px-2 font-medium"
            >
              Xóa lọc
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1d1d1f] border-t-transparent" />
        </div>
      ) : (
        <>
          {/* ── Stat cards ── */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Lợi nhuận" value={fmt(overview?.totalProfit || 0)} sub={`Doanh thu: ${fmt(overview?.totalRevenue || 0)}`} />
            <StatCard label="Đơn hàng" value={fmtNum(overview?.orderCount || 0)} sub="Trong khoảng lọc" />
            <StatCard label="Sản phẩm" value={fmtNum(overview?.productCount || 0)} sub="Đang kinh doanh" />
            <StatCard label="Người dùng" value={fmtNum(overview?.userCount || 0)} sub="Đã đăng ký" />
          </div>

          {/* ── Charts + Low stock ── */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Revenue / Orders Chart */}
            <div className="lg:col-span-2 rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveChartTab("profit")}
                    className={`text-[14px] font-semibold transition-colors pb-1 ${activeChartTab === "profit" ? "text-[#1d1d1f] border-b-2 border-[#1d1d1f]" : "text-[#8e8e93] hover:text-[#1d1d1f]"}`}
                  >
                    Thống kê Lợi nhuận
                  </button>
                  <button
                    onClick={() => setActiveChartTab("orders")}
                    className={`text-[14px] font-semibold transition-colors pb-1 ${activeChartTab === "orders" ? "text-[#0071e3] border-b-2 border-[#0071e3]" : "text-[#8e8e93] hover:text-[#0071e3]"}`}
                  >
                    Thống kê Đơn hàng
                  </button>
                </div>
                <span className="text-xs text-[#8e8e93]">Hover để xem chi tiết</span>
              </div>

              {activeChartTab === "profit" ? (
                <MonthlyBarChart
                  data={revenue}
                  valueKey="profit"
                  color="#1d1d1f"
                  formatValue={fmt}
                  emptyText="Chưa có dữ liệu lợi nhuận"
                />
              ) : (
                <MonthlyBarChart
                  data={revenue}
                  valueKey="orderCount"
                  color="#0071e3"
                  formatValue={fmtNum}
                  unit=" đơn"
                  emptyText="Chưa có dữ liệu đơn hàng"
                />
              )}
            </div>

            {/* Low stock */}
            <LowStockPanel items={lowStock} />
          </div>

          {/* ── Đơn theo trạng thái + Doanh thu theo danh mục ── */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className="text-[15px] font-semibold text-[#1d1d1f]">Đơn hàng theo trạng thái</h2>
                <span className="text-xs text-[#8e8e93]">
                  {startDate || endDate || categoryId !== "all" ? "Theo bộ lọc" : "Toàn thời gian"}
                </span>
              </div>
              <OrderStatusChart data={ordersByStatus} />
            </div>

            <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className="text-[15px] font-semibold text-[#1d1d1f]">Doanh thu theo danh mục</h2>
                <span className="text-xs text-[#8e8e93]">Hover để xem đầy đủ</span>
              </div>
              <CategoryRevenueChart data={byCategory} />
            </div>
          </div>

          {/* ── Top products + Recent orders ── */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Top products */}
            <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <h2 className="mb-4 text-[15px] font-semibold text-[#1d1d1f]">Top sản phẩm bán chạy</h2>
              {topProducts.length === 0 ? (
                <p className="text-sm text-[#8e8e93]">Chưa có dữ liệu</p>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((p, i) => (
                    <div key={p._id} className="flex items-center gap-3">
                      <span className="text-[13px] font-bold text-[#8e8e93] w-5 text-center">#{i + 1}</span>
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f5f5f7]">
                        <ImageWithFallback src={p.images?.[0]?.url} alt={p.name} className="max-h-full w-auto object-contain" />
                      </div>
                      <p className="flex-1 min-w-0 text-[13px] text-[#1d1d1f] truncate">{p.name}</p>
                      <span className="shrink-0 text-[13px] font-semibold text-[#1d1d1f]">
                        {fmtNum(p.sold || 0)} đã bán
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent orders */}
            <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[15px] font-semibold text-[#1d1d1f]">Đơn hàng gần đây</h2>
                <Link to="/admin/orders" className="text-xs text-[#0071e3] hover:underline">Xem tất cả</Link>
              </div>
              {recentOrders.length === 0 ? (
                <p className="text-sm text-[#8e8e93]">Chưa có đơn hàng</p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((o) => (
                    <div key={o._id} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-[#1d1d1f] truncate">#{o._id.slice(-8).toUpperCase()}</p>
                        <p className="text-[11px] text-[#8e8e93]">{o.user?.email || o.user?.fullName || "—"}</p>
                      </div>
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${ORDER_STATUS_COLOR[o.status] || "bg-[#f5f5f7] text-[#6e6e73]"}`}>
                        {ORDER_STATUS_VN[o.status] || o.status}
                      </span>
                      <span className="shrink-0 text-[12px] font-semibold text-[#1d1d1f]">
                        {fmt(o.total)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
