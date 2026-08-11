import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { ImageWithFallback } from "../components/ImageWithFallback";
import { API_URL } from "../lib/api";
import { getDisplayPrice } from "../lib/pricing";
import { formatCurrency } from "../lib/format";

const SF_FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

const SPEC_ROWS = [
  { key: "brand", label: "Thương hiệu", get: (p) => p.brand },
  { key: "category", label: "Danh mục", get: (p) => p.category?.name },
  { key: "price", label: "Giá bán", get: (p) => formatCurrency(getDisplayPrice(p).price) },
  { key: "stock", label: "Tồn kho", get: (p) => `${p.stock ?? 0} sản phẩm` },
  { key: "cpu", label: "CPU", get: (p) => p.specifications?.cpu },
  { key: "ram", label: "RAM", get: (p) => p.specifications?.ram },
  { key: "vga", label: "VGA", get: (p) => p.specifications?.vga },
  { key: "storage", label: "Ổ cứng", get: (p) => p.specifications?.storage },
  { key: "screen", label: "Màn hình", get: (p) => p.specifications?.screen },
  { key: "mainboard", label: "Mainboard", get: (p) => p.specifications?.mainboard },
  { key: "psu", label: "Nguồn", get: (p) => p.specifications?.psu },
  { key: "other", label: "Thông số khác", get: (p) => p.specifications?.other },
];

function ProductOption({ product, checked, disabled, onToggle }) {
  const image = product.images?.[0]?.url;
  const { price } = getDisplayPrice(product);

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled && !checked}
      className={`flex h-full flex-col overflow-hidden rounded-2xl border bg-white text-left transition-all ${
        checked
          ? "border-[#1d1d1f] shadow-[0_8px_28px_rgba(0,0,0,0.08)]"
          : "border-black/[0.06] hover:border-black/[0.18]"
      } ${disabled && !checked ? "cursor-not-allowed opacity-45" : "cursor-pointer"}`}
    >
      <div className="flex h-36 items-center justify-center bg-[#f5f5f7] p-4">
        <ImageWithFallback src={image} alt={product.name} className="max-h-full w-auto object-contain" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="mb-1 text-[11px] text-[#8e8e93]">{product.category?.name}</span>
        <span className="line-clamp-2 min-h-10 text-[13px] font-semibold text-[#1d1d1f]">{product.name}</span>
        <span className="mt-2 text-[13px] font-bold text-[#0071e3]">{formatCurrency(price)}</span>
        <span
          className={`mt-3 inline-flex w-fit rounded-full px-3 py-1 text-[12px] font-medium ${
            checked ? "bg-[#1d1d1f] text-white" : "bg-[#f5f5f7] text-[#3a3a3c]"
          }`}
        >
          {checked ? "Đã chọn" : "Chọn so sánh"}
        </span>
      </div>
    </button>
  );
}

function CompareTable({ products }) {
  if (products.length < 2) {
    return (
      <div className="rounded-2xl border border-dashed border-black/[0.14] bg-white px-6 py-12 text-center">
        <p className="text-[15px] font-semibold text-[#1d1d1f]">Chọn ít nhất 2 sản phẩm để so sánh</p>
        <p className="mt-1 text-sm text-[#6e6e73]">Bạn có thể chọn tối đa 3 sản phẩm cùng loại.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b border-black/[0.06] bg-[#fafafa]">
              <th className="w-40 px-4 py-4 text-[12px] font-semibold uppercase text-[#6e6e73]">Tiêu chí</th>
              {products.map((product) => (
                <th key={product._id} className="px-4 py-4 align-top">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#f5f5f7] p-1.5">
                      <ImageWithFallback
                        src={product.images?.[0]?.url}
                        alt={product.name}
                        className="max-h-full w-auto object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <Link to={`/products/${product._id}`} className="line-clamp-2 text-[13px] font-semibold text-[#1d1d1f] hover:text-[#0071e3]">
                        {product.name}
                      </Link>
                      <p className="mt-0.5 text-[12px] text-[#8e8e93]">{product.category?.name}</p>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SPEC_ROWS.map((row) => (
              <tr key={row.key} className="border-b border-black/[0.04] last:border-b-0">
                <td className="bg-[#fafafa] px-4 py-3 text-[13px] font-semibold text-[#1d1d1f]">{row.label}</td>
                {products.map((product) => (
                  <td key={`${product._id}-${row.key}`} className="px-4 py-3 text-[13px] text-[#3a3a3c]">
                    {row.get(product) || "Đang cập nhật"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ComparePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [compareProducts, setCompareProducts] = useState([]);
  const [categorySlug, setCategorySlug] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/products?limit=100&sort=newest`).then((r) => r.json()),
      fetch(`${API_URL}/api/categories`).then((r) => r.json()),
    ])
      .then(([productsJson, categoriesJson]) => {
        setProducts(productsJson.data?.products || []);
        setCategories(categoriesJson.data || []);
      })
      .catch(() => toast.error("Không tải được danh sách sản phẩm"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedIds.length < 2) {
      setCompareProducts([]);
      return;
    }

    setComparing(true);
    fetch(`${API_URL}/api/products/compare?ids=${selectedIds.join(",")}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) throw new Error(json.message);
        const ordered = selectedIds
          .map((id) => json.data.find((product) => product._id === id))
          .filter(Boolean);
        setCompareProducts(ordered);
      })
      .catch((err) => toast.error(err.message || "Không thể so sánh sản phẩm"))
      .finally(() => setComparing(false));
  }, [selectedIds]);

  const filteredProducts = useMemo(() => {
    const term = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchCategory = categorySlug === "all" || product.category?.slug === categorySlug;
      const matchSearch =
        !term ||
        product.name?.toLowerCase().includes(term) ||
        product.brand?.toLowerCase().includes(term);
      return matchCategory && matchSearch;
    });
  }, [products, categorySlug, query]);

  const selectedCategoryNames = new Set(
    products.filter((product) => selectedIds.includes(product._id)).map((product) => product.category?.slug),
  );
  const mixedCategory = selectedCategoryNames.size > 1;

  const toggleProduct = (product) => {
    setSelectedIds((prev) => {
      if (prev.includes(product._id)) return prev.filter((id) => id !== product._id);
      const firstSelected = products.find((item) => item._id === prev[0]);
      if (firstSelected && firstSelected.category?.slug !== product.category?.slug) {
        toast.info("Vui lòng chọn các sản phẩm cùng danh mục để so sánh.");
        return prev;
      }
      if (prev.length >= 3) {
        toast.info("Chỉ chọn tối đa 3 sản phẩm để so sánh.");
        return prev;
      }
      return [...prev, product._id];
    });
  };

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] antialiased" style={{ fontFamily: SF_FONT }}>
      <Header />

      <main className="bg-[#fafafa] pb-16">
        <section className="border-b border-black/[0.06] bg-white">
          <div className="mx-auto max-w-[1200px] px-6 py-4 md:px-8">
            <p className="text-sm text-[#6e6e73]">
              <Link to="/" className="hover:text-[#1d1d1f]">Home</Link>
              {" / "}
              <span className="text-[#1d1d1f]">So sánh sản phẩm</span>
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-4 py-8 md:px-8">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-[26px] font-semibold text-[#1d1d1f]">So sánh sản phẩm</h1>
              <p className="mt-1 text-sm text-[#6e6e73]">Chọn 2-3 sản phẩm để so sánh giá, tồn kho và thông số kỹ thuật.</p>
            </div>
            <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-[#3a3a3c] shadow-sm">
              Đã chọn {selectedIds.length}/3
            </div>
          </div>

          <div className="mb-6 overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="flex flex-col gap-3 border-b border-black/[0.06] p-4 md:flex-row md:items-center">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm theo tên hoặc thương hiệu"
                className="min-w-0 flex-1 rounded-xl border border-black/[0.1] bg-[#fafafa] px-4 py-2.5 text-sm outline-none transition-all focus:border-[#0071e3] focus:bg-white focus:ring-2 focus:ring-[#0071e3]/20"
              />
              <select
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                className="rounded-xl border border-black/[0.1] bg-[#fafafa] px-4 py-2.5 text-sm outline-none transition-all focus:border-[#0071e3] focus:bg-white"
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category._id} value={category.slug}>{category.name}</option>
                ))}
              </select>
              {selectedIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="rounded-xl border border-black/[0.1] px-4 py-2.5 text-sm font-medium text-[#3a3a3c] transition-colors hover:bg-[#f5f5f7]"
                >
                  Bỏ chọn
                </button>
              )}
            </div>

            {mixedCategory && (
              <div className="border-b border-[#fde68a] bg-[#fffbeb] px-4 py-3 text-sm text-[#92400e]">
                Nên chọn các sản phẩm cùng danh mục để bảng so sánh chính xác hơn.
              </div>
            )}

            <div className="p-4">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#1d1d1f] border-t-transparent" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <p className="py-10 text-center text-sm text-[#8e8e93]">Không có sản phẩm phù hợp.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {filteredProducts.map((product) => (
                    <ProductOption
                      key={product._id}
                      product={product}
                      checked={selectedIds.includes(product._id)}
                      disabled={selectedIds.length >= 3}
                      onToggle={() => toggleProduct(product)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {comparing ? (
            <div className="flex justify-center rounded-2xl bg-white py-12">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#1d1d1f] border-t-transparent" />
            </div>
          ) : (
            <CompareTable products={compareProducts} />
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
