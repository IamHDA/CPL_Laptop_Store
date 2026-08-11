import { useCallback, useEffect, useState } from "react";
import { ImageWithFallback, resolveImageUrl } from "../ImageWithFallback";
import { API_URL } from "../../lib/api";

const AUTOPLAY_MS = 4500;
const BANNER_PATH = "/api/home-slides?position=homepage";

// Dùng API_URL như mọi chỗ khác. Bản cũ thử lần lượt đường dẫn tương đối rồi
// localhost:3000 — trên production đường dẫn tương đối rơi vào chính origin của
// FE, bị vercel.json rewrite về index.html và trả HTTP 200 kèm HTML, nên
// res.ok là true còn .json() thì ném lỗi. Hai fallback localhost sau đó cũng
// không thể tới được từ máy người dùng.
async function fetchBanners() {
  const url = `${API_URL}${BANNER_PATH}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return { json: await res.json(), url };
}

function Arrow({ left, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={left ? "Slide truoc" : "Slide sau"}
      className={`absolute top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center
        rounded-full border border-black/[0.08] bg-white/80 text-[#1d1d1f] shadow-md backdrop-blur-sm
        transition-all duration-200 hover:scale-105 hover:bg-white disabled:hidden
        ${left ? "left-4" : "right-4"}`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        {left ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
      </svg>
    </button>
  );
}

export default function Banner() {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [debugMessage, setDebugMessage] = useState("");

  useEffect(() => {
    fetchBanners()
      .then(({ json, url }) => {
        const data = (json.data || []).filter((banner) => banner.isActive !== false);
        setDebugMessage(`Loaded ${data.length} banner from ${url}`);
        setSlides(
          data.map((banner, index) => ({
            id: banner._id || index,
            src: resolveImageUrl(banner.imageUrl),
            alt: banner.title || "Banner",
            linkUrl: banner.linkUrl || "",
          }))
        );
        setCurrent(0);
      })
      .catch((error) => {
        setDebugMessage(error?.message || "Khong tai duoc banner");
        setSlides([]);
      })
      .finally(() => setLoaded(true));
  }, []);

  const total = slides.length;
  const safeCurrent = total === 0 ? 0 : Math.min(current, total - 1);

  const go = useCallback(
    (index) => {
      if (total === 0) return;
      setCurrent((index + total) % total);
    },
    [total]
  );

  const next = useCallback(() => go(safeCurrent + 1), [go, safeCurrent]);
  const prev = useCallback(() => go(safeCurrent - 1), [go, safeCurrent]);

  useEffect(() => {
    if (total <= 1) return;
    const id = setInterval(() => {
      setCurrent((index) => (index + 1) % total);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [total]);

  if (total === 0) {
    if (loaded && import.meta.env.DEV) {
      return (
        <section data-home-banner="empty" className="w-full bg-[#f5f5f7] px-4 py-6 text-center text-sm text-[#6e6e73]">
          Chua co banner homepage dang hien thi. {debugMessage ? `(${debugMessage})` : ""}
        </section>
      );
    }
    return null;
  }

  return (
    <section data-home-banner="true" className="relative w-full select-none overflow-hidden bg-[#f2f2f2]">
      <div className="relative h-[220px] w-full overflow-hidden md:h-[320px] lg:h-[420px]">
        <div
          className="flex h-full w-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${safeCurrent * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="h-full w-full shrink-0">
              {slide.linkUrl ? (
                <a href={slide.linkUrl} className="block h-full w-full">
                  <ImageWithFallback src={slide.src} alt={slide.alt} draggable={false} className="block h-full w-full object-cover" />
                </a>
              ) : (
                <ImageWithFallback src={slide.src} alt={slide.alt} draggable={false} className="block h-full w-full object-cover" />
              )}
            </div>
          ))}
        </div>
      </div>

      <Arrow left onClick={prev} disabled={total <= 1} />
      <Arrow onClick={next} disabled={total <= 1} />

      {total > 1 && (
        <>
          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/80 px-2.5 py-1.5 shadow-sm backdrop-blur-sm">
            {slides.map((slide, index) => (
              <button key={slide.id} type="button" onClick={() => go(index)} aria-label={`Slide ${index + 1}`}>
                <span
                  className="block rounded-full bg-[#1d1d1f]"
                  style={{
                    height: 8,
                    width: index === safeCurrent ? 20 : 8,
                    opacity: index === safeCurrent ? 1 : 0.45,
                    transition: "width 0.25s ease, opacity 0.25s ease",
                  }}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
