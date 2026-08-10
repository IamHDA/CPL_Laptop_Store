import { motion } from "framer-motion";
import { fadeInUp } from "../../lib/animations";

const exploreImg = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200";

export default function ExploreProducts() {
  return (
    <section className="w-full bg-[#fafafa] py-16">
      <motion.div
        className="max-w-[1200px] mx-auto px-6 flex flex-col items-center text-center"
        {...fadeInUp}
      >
        <h2
          className="text-[#1d1d1f] mb-4 tracking-tight"
          style={{ fontSize: "32px", fontWeight: 600 }}
        >
          Hệ sinh thái hoàn hảo
        </h2>
        <p
          className="text-[#6e6e73] max-w-[500px] mb-8"
          style={{ fontSize: "16px", lineHeight: 1.6 }}
        >
          Tất cả thiết bị Laptop & Công nghệ hoạt động liền mạch, tạo nên hệ sinh thái mạnh
          mẽ cho cuộc sống số của bạn.
        </p>

        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <img
            src={exploreImg}
            alt="Ecosystem"
            className="w-full max-h-[500px] object-cover rounded-2xl shadow-sm"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
